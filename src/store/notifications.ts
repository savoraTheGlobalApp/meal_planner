import { create } from 'zustand';
import { useMenuStore } from './menu';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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
	init: () => void;
	markAllRead: () => void;
	getLast7Days: () => AppNotification[];
};

const STORAGE_KEY = 'meal_planner_notifications';
const LAST_SCHEDULED_KEY = 'meal_planner_notifications_last_schedule';
// Single source of truth for daily reminder time (24h HH:MM). Change here only.
export const SCHEDULE_TIME: string = '20:00';

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
			title: 'Plan tomorrow\'s meals',
			body: 'Set preferences and generate your menu to get reminders.'
		};
	}

	const title = 'Check out your next meals';
	const body = `Tomorrow: Breakfast - ${meal.breakfast}; Lunch - ${meal.lunch.join(', ')}; Dinner - ${meal.dinner.join(', ')}`;
	return { title, body };
}

function getNextTriggerDate(): Date {
	const now = new Date();
    const target = new Date();
    const [hh, mm] = SCHEDULE_TIME.split(':').map(v => parseInt(v, 10));
    target.setHours(!Number.isNaN(hh) ? hh : 20, !Number.isNaN(mm) ? mm : 0, 0, 0);
	if (now.getTime() >= target.getTime()) {
		// schedule for tomorrow 20:00
        target.setDate(target.getDate() + 1);
	}
    return target;
}

function msUntilNextReminder(): number {
    const now = new Date();
    const target = getNextTriggerDate();
    return target.getTime() - now.getTime();
}

// no test override logic; single constant SCHEDULE_TIME controls scheduling

function scheduleTimer(send: () => void) {
    const delay = msUntilNextReminder();
	window.setTimeout(() => {
		send();
		// chain next run roughly 24h later; use setTimeout again for clock changes
		scheduleTimer(send);
	}, delay);
}

async function scheduleNativeDaily(getPermission: () => NotificationPermission | 'unsupported') {
    // Cancel any previous schedule with our ID to avoid duplicates
    try {
        await LocalNotifications.cancel({ notifications: [{ id: 8001 }] });
    } catch {}

    // Compute next trigger time at 20:00 and set repeating
    const at = getNextTriggerDate();

    // Schedule repeating notification handled by OS
    const { title, body } = formatNextDayMessage();
    await LocalNotifications.schedule({
        notifications: [
            {
                id: 8001,
                title,
                body,
                schedule: { at, repeats: true, every: 'day' },
                smallIcon: 'ic_stat_icon',
            },
        ],
    });

    // Also store an entry for history immediately at schedule time
    const entry: AppNotification = {
        id: `${Date.now()}`,
        title,
        body,
        createdAt: Date.now(),
        read: false,
    };
    const existing = loadStored();
    const updated = [entry, ...existing].slice(0, 50);
    saveStored(updated);
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
	notifications: loadStored(),
	permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
	initialised: false,

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
                    await scheduleNativeDaily(() => get().permission);
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
                    scheduleTimer(() => {
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


