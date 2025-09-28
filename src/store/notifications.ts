import { create } from 'zustand';
import { useMenuStore } from './menu';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useAuthStore } from './auth';
import { getUserData, updateUserNotificationTime } from '../services/firebaseService';

export type AppNotification = {
	id: string;
	title: string;
	body: string;
	createdAt: number; // epoch ms
	read: boolean;
};

type NotificationState = {
	notifications: AppNotification[];
	permission: NotificationPermission | 'unsupported';
	initialised: boolean;
    listenersAdded?: boolean;
    scheduleTime: string; // HH:MM 24h
    setScheduleTime: (time: string) => Promise<void>;
	init: () => void;
	markAllRead: () => void;
	getLast7Days: () => AppNotification[];
};

const STORAGE_KEY = 'meal_planner_notifications';
const LAST_SCHEDULED_KEY = 'meal_planner_notifications_last_schedule';
const NOTIF_TIME_KEY = 'meal_planner_notification_time';
const DEFAULT_TIME = '20:00';

function loadStored(): AppNotification[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as AppNotification[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveStored(items: AppNotification[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {}
}

function formatNextDayMessage(): { title: string; body: string } {
	const { week } = useMenuStore.getState();
	const now = new Date();
	const tomorrow = new Date(now);
	tomorrow.setDate(now.getDate() + 1);

	// Monday=0..Sunday=6 index for tomorrow
	const weekday = tomorrow.getDay() === 0 ? 6 : tomorrow.getDay() - 1;
	const meal = week[weekday];

    if (!meal) {
		return {
            title: 'Set your preferences',
            body: 'Add or update your preferences. We\'re working to get you a menu that you\'ll love.'
		};
	}

    const title = 'Check out your next meals';
    const body = `Tomorrow:\nBreakfast - ${meal.breakfast}\nLunch - ${meal.lunch.join(', ')}\nDinner - ${meal.dinner.join(', ')}`;
	return { title, body };
}

async function waitForMenuReady(timeoutMs = 1500): Promise<void> {
    const start = Date.now();
    const hasMenu = () => (useMenuStore.getState().week || []).length > 0;
    if (hasMenu()) return;
    return new Promise<void>(resolve => {
        const unsub = useMenuStore.subscribe(() => {
            if (hasMenu()) {
                unsub();
                resolve();
            }
        });
        const timer = setInterval(() => {
            if (hasMenu() || Date.now() - start > timeoutMs) {
                clearInterval(timer);
                try { unsub(); } catch {}
                resolve();
            }
        }, 50);
    });
}

function getNextTriggerDate(scheduleTime: string): Date {
	const now = new Date();
    const target = new Date();
    const [hh, mm] = scheduleTime.split(':').map(v => parseInt(v, 10));
    target.setHours(!Number.isNaN(hh) ? hh : 20, !Number.isNaN(mm) ? mm : 0, 0, 0);
	if (now.getTime() >= target.getTime()) {
		// schedule for tomorrow 20:00
        target.setDate(target.getDate() + 1);
	}
    return target;
}

function msUntilNextReminder(scheduleTime: string): number {
    const now = new Date();
    const target = getNextTriggerDate(scheduleTime);
    return target.getTime() - now.getTime();
}

// no test override logic; single constant SCHEDULE_TIME controls scheduling

function scheduleTimer(scheduleTime: string, send: () => void) {
    const delay = msUntilNextReminder(scheduleTime);
	window.setTimeout(() => {
		send();
		// chain next run roughly 24h later; use setTimeout again for clock changes
		scheduleTimer(scheduleTime, send);
	}, delay);
}

async function scheduleNativeDaily(getPermission: () => NotificationPermission | 'unsupported', scheduleTime: string) {
    // Cancel any previous schedule with our ID to avoid duplicates
    try {
        await LocalNotifications.cancel({ notifications: [{ id: 8001 }] });
    } catch {}

    // Compute next trigger time and message content for tomorrow
    const at = getNextTriggerDate(scheduleTime);
    const { title, body } = formatNextDayMessage();

    // Schedule a single notification with specific content (we'll chain next day on delivery/tap)
    await LocalNotifications.schedule({
        notifications: [
            {
                id: 8001,
                title,
                body,
                schedule: { at, repeats: false },
                smallIcon: 'ic_stat_icon',
                largeIcon: 'ic_launcher',
                channelId: 'meal_planner_daily',
            },
        ],
    });
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
	notifications: loadStored(),
	permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
    initialised: false,
    listenersAdded: false,
    scheduleTime: (() => {
        try { return localStorage.getItem(NOTIF_TIME_KEY) || DEFAULT_TIME; } catch { return DEFAULT_TIME; }
    })(),
    setScheduleTime: async (time: string) => {
        const clean = /^\d{2}:\d{2}$/.test(time) ? time : DEFAULT_TIME;
        try { localStorage.setItem(NOTIF_TIME_KEY, clean); } catch {}
        set({ scheduleTime: clean });
        // Persist to Firestore if logged in
        try {
            const { user } = useAuthStore.getState();
            if (user) { await updateUserNotificationTime(user.id, clean as unknown as string); }
        } catch {}
        // Re-schedule
        const isNative = Capacitor.isNativePlatform();
        if (isNative) {
            try { await scheduleNativeDaily(() => get().permission, clean); } catch {}
        }
        // Web timer: schedule a new timer (does not cancel previous but safe enough)
        try {
            scheduleTimer(clean, () => {
                const { title, body } = formatNextDayMessage();
                if (get().permission === 'granted') {
                    try { new Notification(title, { body }); } catch {}
                }
                const entry: AppNotification = {
                    id: `${Date.now()}`,
                    title,
                    body,
                    createdAt: Date.now(),
                    read: false,
                };
                const updated = [entry, ...get().notifications].slice(0, 50);
                set({ notifications: updated });
                saveStored(updated);
            });
        } catch {}
    },

	init: () => {
		if (get().initialised) return;
        const isNative = Capacitor.isNativePlatform();
        const webSupported = typeof window !== 'undefined' && 'Notification' in window;

        const requestWebPermission = async () => {
            try {
                const perm = await Notification.requestPermission();
                set({ permission: perm });
            } catch {
                set({ permission: Notification.permission });
            }
        };

        // Native (APK): request and schedule via Capacitor Local Notifications
        if (isNative) {
            (async () => {
                try {
                    const perm = await LocalNotifications.checkPermissions();
                    if (perm.display !== 'granted') {
                        await LocalNotifications.requestPermissions();
                    }
                    // Ensure a channel exists (Android 8+)
                    try {
                        await LocalNotifications.createChannel({
                            id: 'meal_planner_daily',
                            name: 'Meal Planner Daily',
                            description: 'Daily reminders for tomorrow\'s meals',
                            importance: 4,
                            visibility: 1,
                        });
                    } catch {}

                    await scheduleNativeDaily(() => get().permission, get().scheduleTime);

                    // Add listeners once
                    if (!get().listenersAdded) {
                        LocalNotifications.addListener('localNotificationActionPerformed', async () => {
                            // Wait briefly for stores to hydrate, then generate fresh content
                            await waitForMenuReady();
                            const { title, body } = formatNextDayMessage();
                            const entry: AppNotification = {
                                id: `${Date.now()}`,
                                title,
                                body,
                                createdAt: Date.now(),
                                read: false,
                            };
                            const updated = [entry, ...get().notifications].slice(0, 50);
                            set({ notifications: updated, listenersAdded: true });
                            saveStored(updated);
                            // Schedule next day's notification immediately
                            try { await scheduleNativeDaily(() => get().permission, get().scheduleTime); } catch {}
                            try {
                                const w = window as unknown as { history?: History; location?: Location };
                                if (w.history && typeof w.history.pushState === 'function') {
                                    w.history.pushState({}, '', '/notifications');
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                } else if (w.location) {
                                    w.location.href = '/notifications';
                                }
                            } catch {}
                        });

                        LocalNotifications.addListener('localNotificationReceived', async () => {
                            // If app is foreground, also log entry with fresh content
                            await waitForMenuReady();
                            const { title, body } = formatNextDayMessage();
                            const entry: AppNotification = {
                                id: `${Date.now()}`,
                                title,
                                body,
                                createdAt: Date.now(),
                                read: false,
                            };
                            const updated = [entry, ...get().notifications].slice(0, 50);
                            set({ notifications: updated, listenersAdded: true });
                            saveStored(updated);
                            // Chain next day's schedule as well
                            try { await scheduleNativeDaily(() => get().permission, get().scheduleTime); } catch {}
                        });
                    }
                } catch (e) {
                    console.warn('LocalNotifications scheduling failed, falling back to web if available', e);
                }
            })();
        }

        // Web fallback: request permission and schedule setTimeout loop
        if (webSupported) {
            if (Notification.permission === 'default') {
                requestWebPermission();
            } else {
                set({ permission: Notification.permission });
            }

            try {
                const last = localStorage.getItem(LAST_SCHEDULED_KEY);
                const todayKey = new Date().toDateString();
                if (last !== todayKey) {
                    localStorage.setItem(LAST_SCHEDULED_KEY, todayKey);
                    scheduleTimer(get().scheduleTime, () => {
                        const { title, body } = formatNextDayMessage();
                        if (get().permission === 'granted') {
                            try { new Notification(title, { body }); } catch {}
                        }
                        const entry: AppNotification = {
                            id: `${Date.now()}`,
                            title,
                            body,
                            createdAt: Date.now(),
                            read: false,
                        };
                        const updated = [entry, ...get().notifications].slice(0, 50);
                        set({ notifications: updated });
                        saveStored(updated);
                    });
                }
            } catch {}
        }

        // On initialise, load notification time from Firestore if available
        (async () => {
            try {
                const { user } = useAuthStore.getState();
                if (user) {
                    const { data } = await getUserData(user.id);
                    const cloudTime = data?.notificationTime as string | undefined;
                    if (cloudTime && /^\d{2}:\d{2}$/.test(cloudTime) && cloudTime !== get().scheduleTime) {
                        try { localStorage.setItem(NOTIF_TIME_KEY, cloudTime); } catch {}
                        set({ scheduleTime: cloudTime });
                    }
                }
            } catch {}
        })();

        set({ initialised: true });
	},

	markAllRead: () => {
		const updated = get().notifications.map(n => ({ ...n, read: true }));
		set({ notifications: updated });
		saveStored(updated);
	},

	getLast7Days: () => {
		const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
		return get().notifications.filter(n => n.createdAt >= sevenDaysAgo);
	},
}));


