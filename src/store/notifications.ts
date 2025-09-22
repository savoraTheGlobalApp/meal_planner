import { create } from 'zustand';
import { useMenuStore } from './menu';

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

function msUntilNext8pm(): number {
	const now = new Date();
	const target = new Date();
	target.setHours(20, 0, 0, 0);
	if (now.getTime() >= target.getTime()) {
		// schedule for tomorrow 20:00
		target.setDate(target.getDate() + 1);
	}
	return target.getTime() - now.getTime();
}

function scheduleTimer(send: () => void) {
	const delay = msUntilNext8pm();
	window.setTimeout(() => {
		send();
		// chain next run roughly 24h later; use setTimeout again for clock changes
		scheduleTimer(send);
	}, delay);
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
	notifications: loadStored(),
	permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
	initialised: false,

	init: () => {
		if (get().initialised) return;
		const supported = typeof window !== 'undefined' && 'Notification' in window;
		if (!supported) {
			set({ permission: 'unsupported', initialised: true });
			return;
		}

		const requestPermission = async () => {
			try {
				const perm = await Notification.requestPermission();
				set({ permission: perm });
			} catch {
				set({ permission: Notification.permission });
			}
		};

		// Request permission if default
		if (Notification.permission === 'default') {
			requestPermission();
		} else {
			set({ permission: Notification.permission });
		}

		// Schedule timer only once per session and once per day (guard by last scheduled day)
		try {
			const last = localStorage.getItem(LAST_SCHEDULED_KEY);
			const todayKey = new Date().toDateString();
			if (last !== todayKey) {
				localStorage.setItem(LAST_SCHEDULED_KEY, todayKey);
				scheduleTimer(() => {
					const { title, body } = formatNextDayMessage();
					// Fire browser notification if permitted
					if (get().permission === 'granted') {
						try { new Notification(title, { body }); } catch {}
					}
					// Always store entry
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


