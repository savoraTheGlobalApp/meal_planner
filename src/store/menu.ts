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

function pickDifferent(arr: string[], avoid: string, fallback: string): string {
	// If there are fewer than 2 options, we cannot avoid a duplicate reliably
	if (!arr.length) return fallback;
	if (arr.length === 1) return arr[0];
	// Try random picks up to a few times to avoid avoid-value
	for (let attempts = 0; attempts < 5; attempts++) {
		const candidate = arr[Math.floor(Math.random() * arr.length)];
		if (candidate !== avoid) return candidate;
	}
	// As a final fallback, find first different item
	const firstDifferent = arr.find(v => v !== avoid);
	return firstDifferent ?? fallback;
}

function pickDifferentFromList(arr: string[], avoids: string[], fallback: string): string {
	if (!arr.length) return fallback;
	if (arr.length === 1) return arr[0];
	for (let attempts = 0; attempts < 7; attempts++) {
		const candidate = arr[Math.floor(Math.random() * arr.length)];
		if (!avoids.includes(candidate)) return candidate;
	}
	const firstDifferent = arr.find(v => !avoids.includes(v));
	return firstDifferent ?? fallback;
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
	const week: WeekMenu = [];
	for (let day = 0; day < 7; day++) {
		const meal = generator.generateMeal();
		if (week.length) {
			const prev = week[week.length - 1];
			// Breakfast should not repeat on adjacent days
			if (meal.breakfast === prev.breakfast) {
				meal.breakfast = pickDifferent(preferences.breakfast, prev.breakfast, meal.breakfast);
			}
			// Lunch dal and veg should not repeat on adjacent days
			if (meal.lunch[0] === prev.lunch[0]) {
				meal.lunch[0] = pickDifferent(preferences.dal, prev.lunch[0], meal.lunch[0]);
			}
			if (meal.lunch[1] === prev.lunch[1]) {
				meal.lunch[1] = pickDifferent(preferences.veg, prev.lunch[1], meal.lunch[1]);
			}
			// Dinner dal and veg should not repeat on adjacent days
			if (meal.dinner[0] === prev.dinner[0]) {
				meal.dinner[0] = pickDifferent(preferences.dal, prev.dinner[0], meal.dinner[0]);
			}
			if (meal.dinner[1] === prev.dinner[1]) {
				meal.dinner[1] = pickDifferent(preferences.veg, prev.dinner[1], meal.dinner[1]);
			}
		}
		week.push(meal);
	}

	// Ensure no duplicates across week boundary (e.g., Sunday vs Monday)
	if (week.length >= 2) {
		const first = week[0];
		const last = week[week.length - 1];
		const second = week[1];
		// Breakfast
		if (first.breakfast === last.breakfast) {
			first.breakfast = pickDifferentFromList(preferences.breakfast, [last.breakfast, second.breakfast], first.breakfast);
		}
		// Lunch dal and veg
		if (first.lunch[0] === last.lunch[0]) {
			first.lunch[0] = pickDifferentFromList(preferences.dal, [last.lunch[0], second.lunch[0]], first.lunch[0]);
		}
		if (first.lunch[1] === last.lunch[1]) {
			first.lunch[1] = pickDifferentFromList(preferences.veg, [last.lunch[1], second.lunch[1]], first.lunch[1]);
		}
		// Dinner dal and veg
		if (first.dinner[0] === last.dinner[0]) {
			first.dinner[0] = pickDifferentFromList(preferences.dal, [last.dinner[0], second.dinner[0]], first.dinner[0]);
		}
		if (first.dinner[1] === last.dinner[1]) {
			first.dinner[1] = pickDifferentFromList(preferences.veg, [last.dinner[1], second.dinner[1]], first.dinner[1]);
		}
	}
	return week;
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