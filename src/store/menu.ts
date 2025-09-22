import { create } from 'zustand';
import { updateUserMenu, clearUserMenu } from '../services/firebaseService';
import { useAuthStore } from './auth';
import type { Preferences } from './preferences';

export type Meal = { breakfast: string; lunch: string[]; dinner: string[] };
export type WeekMenu = Meal[]; // length 7

function pickRandom<T>(arr: T[]): T | null {
	if (!arr.length) return null;
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateDay(preferences: Preferences): Meal {
	
	// Generate breakfast with main item only
	const mainBreakfast = pickRandom(preferences.breakfast);
	
	// Use actual selections or fallback to first item if available
	const breakfastMain = mainBreakfast || (preferences.breakfast.length > 0 ? preferences.breakfast[0] : 'Breakfast');
	const breakfast = breakfastMain;
	

	
	const lunchDal = pickRandom(preferences.dal);
	const lunchVeg = pickRandom(preferences.veg);
	const dinnerDal = pickRandom(preferences.dal);
	const dinnerVeg = pickRandom(preferences.veg);
	
	// Use actual selections or fallback to first item if available
	const lunchDalItem = lunchDal || (preferences.dal.length > 0 ? preferences.dal[0] : 'Dal');
	const lunchVegItem = lunchVeg || (preferences.veg.length > 0 ? preferences.veg[0] : 'Vegetable');
	const dinnerDalItem = dinnerDal || (preferences.dal.length > 0 ? preferences.dal[0] : 'Dal');
	const dinnerVegItem = dinnerVeg || (preferences.veg.length > 0 ? preferences.veg[0] : 'Vegetable');
	

	
	const meal = {
		breakfast,
		lunch: [lunchDalItem, lunchVegItem, 'Roti/Rice'],
		dinner: [dinnerDalItem, dinnerVegItem, 'Roti/Rice'],
	};
	
	console.log('GenerateDay - Final meal:', meal);
	return meal;
}

function generateWeek(preferences: Preferences): WeekMenu {
	return Array.from({ length: 7 }, () => generateDay(preferences));
}

type MenuState = {
	week: WeekMenu;
	loading: boolean;
	generate: (prefs: Preferences) => Promise<void>;
	regenerateMeal: (dayIndex: number, which: 'breakfast'|'lunch'|'dinner', prefs: Preferences) => Promise<void>;
	clearMenu: () => Promise<void>;
	loadMenu: (menu: WeekMenu) => void;
};

export const useMenuStore = create<MenuState>((set, get) => ({
	week: [],
	loading: false,
	generate: async (prefs) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
		
		const newWeek = generateWeek(prefs);
		console.log('Menu Store - Generated week:', newWeek);
		set({ week: newWeek });
		
		// Save to Firebase
		const { error } = await updateUserMenu(user.id, newWeek);
		if (error) {
			console.error('Failed to save menu to Firebase:', error);
		}
		
		set({ loading: false });
	},
	regenerateMeal: async (dayIndex, which, prefs) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
		
		const copy = get().week.slice();
		if (!copy[dayIndex]) {
			set({ loading: false });
			return;
		}
		
		const generated = generateDay(prefs);
		copy[dayIndex] = {
			...copy[dayIndex],
			[which]: generated[which],
		};
		
		set({ week: copy });
		
		// Save to Firebase
		const { error } = await updateUserMenu(user.id, copy);
		if (error) {
			console.error('Failed to save menu to Firebase:', error);
		}
		
		set({ loading: false });
	},
	clearMenu: async () => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
		
		set({ week: [] });
		
		// Clear from Firebase
		const { error } = await clearUserMenu(user.id);
		if (error) {
			console.error('Failed to clear menu from Firebase:', error);
		}
		
		set({ loading: false });
	},
	loadMenu: (menu: WeekMenu) => {
		set({ week: menu });
	}
}));