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

// Advanced meal generation with round-robin + randomness
class MealGenerator {
	private breakfastIndex = 0;
	private lunchDalIndex = 0;
	private lunchVegIndex = 0;
	private dinnerDalIndex = 0;
	private dinnerVegIndex = 0;
	private preferences: Preferences;

	constructor(preferences: Preferences) {
		this.preferences = preferences;
		// Shuffle dinner dal and veg arrays for variety
		this.shuffleDinnerArrays();
	}

	private shuffleDinnerArrays() {
		// Create shuffled copies for dinner to create variety using Fisher–Yates shuffle
		const shuffledDal = [...this.preferences.dal];
		for (let i = shuffledDal.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledDal[i], shuffledDal[j]] = [shuffledDal[j], shuffledDal[i]];
		}
		const shuffledVeg = [...this.preferences.veg];
		for (let i = shuffledVeg.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledVeg[i], shuffledVeg[j]] = [shuffledVeg[j], shuffledVeg[i]];
		}
		
		// Store shuffled arrays for dinner
		(this as any).dinnerDalArray = shuffledDal;
		(this as any).dinnerVegArray = shuffledVeg;
	}

	private selectItem(array: string[], index: number, isRandom: boolean = false): string {
		if (!array.length) return 'Item';
		if (isRandom) {
			return array[Math.floor(Math.random() * array.length)];
		}
		return array[index % array.length];
	}

	private shouldUseRandom(): boolean {
		// 10% chance for random selection
		return Math.random() < 0.1;
	}

	generateMeal(): Meal {
		// Breakfast: Round-robin with 10% randomness
		const breakfastRandom = this.shouldUseRandom();
		const breakfast = this.selectItem(
			this.preferences.breakfast, 
			this.breakfastIndex, 
			breakfastRandom
		);
		if (!breakfastRandom) this.breakfastIndex++;

		// Lunch Dal: Round-robin with 10% randomness
		const lunchDalRandom = this.shouldUseRandom();
		const lunchDal = this.selectItem(
			this.preferences.dal, 
			this.lunchDalIndex, 
			lunchDalRandom
		);
		if (!lunchDalRandom) this.lunchDalIndex++;

		// Lunch Veg: Round-robin with 10% randomness
		const lunchVegRandom = this.shouldUseRandom();
		const lunchVeg = this.selectItem(
			this.preferences.veg, 
			this.lunchVegIndex, 
			lunchVegRandom
		);
		if (!lunchVegRandom) this.lunchVegIndex++;

		// Dinner Dal: Use shuffled array, round-robin with 10% randomness
		const dinnerDalRandom = this.shouldUseRandom();
		const dinnerDal = this.selectItem(
			(this as any).dinnerDalArray, 
			this.dinnerDalIndex, 
			dinnerDalRandom
		);
		if (!dinnerDalRandom) this.dinnerDalIndex++;

		// Dinner Veg: Use shuffled array, round-robin with 10% randomness
		const dinnerVegRandom = this.shouldUseRandom();
		const dinnerVeg = this.selectItem(
			(this as any).dinnerVegArray, 
			this.dinnerVegIndex, 
			dinnerVegRandom
		);
		if (!dinnerVegRandom) this.dinnerVegIndex++;

		// Ensure lunch and dinner don't have the same dal or veg
		const finalDinnerDal = dinnerDal === lunchDal ? 
			this.selectItem((this as any).dinnerDalArray, this.dinnerDalIndex + 1, true) : 
			dinnerDal;
		
		const finalDinnerVeg = dinnerVeg === lunchVeg ? 
			this.selectItem((this as any).dinnerVegArray, this.dinnerVegIndex + 1, true) : 
			dinnerVeg;

		const meal = {
			breakfast,
			lunch: [lunchDal, lunchVeg, 'Roti/Rice'],
			dinner: [finalDinnerDal, finalDinnerVeg, 'Roti/Rice'],
		};

		console.log('GenerateDay - Final meal:', meal);
		return meal;
	}
}

function generateDay(preferences: Preferences): Meal {
	const generator = new MealGenerator(preferences);
	return generator.generateMeal();
}

function generateWeek(preferences: Preferences): WeekMenu {
	const generator = new MealGenerator(preferences);
	return Array.from({ length: 7 }, () => generator.generateMeal());
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