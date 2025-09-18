import { create } from 'zustand';
import type { Preferences } from './preferences';

export type Meal = { breakfast: string; lunch: string[]; dinner: string[] };
export type WeekMenu = Meal[]; // length 7

function pickRandom<T>(arr: T[]): T | null {
	if (!arr.length) return null;
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateDay(preferences: Preferences): Meal {
	const breakfast = pickRandom(preferences.breakfast) ?? 'Breakfast';
	const lunchDal = pickRandom(preferences.dal) ?? 'Dal';
	const lunchVeg = pickRandom(preferences.veg) ?? 'Vegetable';
	const lunchSalad = pickRandom(preferences.salad) ?? 'Fruit/Salad';
	const dinnerDal = pickRandom(preferences.dal) ?? 'Dal';
	const dinnerVeg = pickRandom(preferences.veg) ?? 'Vegetable';
	const dinnerSalad = pickRandom(preferences.salad) ?? 'Fruit/Salad';
	
	const meal = {
		breakfast,
		lunch: [lunchDal!, lunchVeg!, lunchSalad!, 'Roti/Rice'],
		dinner: [dinnerDal!, dinnerVeg!, dinnerSalad!, 'Roti/Rice'],
	};
	
	return meal;
}

function generateWeek(preferences: Preferences): WeekMenu {
	return Array.from({ length: 7 }, () => generateDay(preferences));
}

type MenuState = {
	week: WeekMenu;
	generate: (prefs: Preferences) => void;
	regenerateMeal: (dayIndex: number, which: 'breakfast'|'lunch'|'dinner', prefs: Preferences) => void;
	clearMenu: () => void;
};

export const useMenuStore = create<MenuState>((set, get) => ({
	week: [],
	generate: (prefs) => {
		const newWeek = generateWeek(prefs);
		set({ week: newWeek });
		// Save to localStorage
		localStorage.setItem('menu', JSON.stringify(newWeek));
	},
	regenerateMeal: (dayIndex, which, prefs) => set(state => {
		const copy = state.week.slice();
		if (!copy[dayIndex]) return state;
		const generated = generateDay(prefs);
		copy[dayIndex] = {
			...copy[dayIndex],
			[which]: generated[which],
		};
		// Save to localStorage
		localStorage.setItem('menu', JSON.stringify(copy));
		return { week: copy };
	}),
	clearMenu: () => {
		set({ week: [] });
		localStorage.removeItem('menu');
	}
}));

// Load menu from localStorage on initialization
const savedMenu = localStorage.getItem('menu');
if (savedMenu) {
	try {
		const parsed = JSON.parse(savedMenu) as WeekMenu;
		useMenuStore.setState({ week: parsed });
	} catch (error) {
		console.error('Failed to load menu from localStorage:', error);
	}
}


