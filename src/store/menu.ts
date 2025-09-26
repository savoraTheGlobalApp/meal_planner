import { create } from 'zustand';
import { updateUserMenu, clearUserMenu } from '../services/firebaseService';
import { useAuthStore } from './auth';
import type { Preferences } from './preferences';

// Component extraction utility
function extractComponents(dishName: string): string[] {
	const components: string[] = [];
	const name = dishName.toLowerCase();
	
	// Common vegetable/protein components
	const componentMap: Record<string, string[]> = {
		'aloo': ['aloo', 'potato'],
		'bhindi': ['bhindi', 'okra'],
		'gobhi': ['gobhi', 'cauliflower'],
		'palak': ['palak', 'spinach'],
		'paneer': ['paneer'],
		'mushroom': ['mushroom'],
		'baingan': ['baingan', 'brinjal', 'eggplant'],
		'matar': ['matar', 'peas'],
		'capsicum': ['capsicum', 'shimla mirch', 'bell pepper'],
		'chana': ['chana', 'chickpea'],
		'rajma': ['rajma', 'kidney beans'],
		'lobia': ['lobia', 'black-eyed beans'],
		'chicken': ['chicken'],
		'fish': ['fish'],
		'egg': ['egg', 'anda'],
		'soyabean': ['soyabean', 'soya'],
		'kaddu': ['kaddu', 'pumpkin'],
		'parval': ['parval', 'pointed gourd'],
		'beans': ['beans'],
		'broccoli': ['broccoli'],
		'cabbage': ['cabbage'],
		'karela': ['karela', 'bitter gourd'],
		'lauki': ['lauki', 'bottle gourd'],
		'tinda': ['tinda']
	};
	
	// Check for each component
	for (const [key, variations] of Object.entries(componentMap)) {
		for (const variation of variations) {
			if (name.includes(variation)) {
				components.push(key);
				break; // Only add each component once
			}
		}
	}
	
	return components;
}

// Check if two dishes share any components (excluding Aloo special case)
function shareComponents(dish1: string, dish2: string, allowAloo: boolean = false): boolean {
	const components1 = extractComponents(dish1);
	const components2 = extractComponents(dish2);
	
	// Filter out Aloo if it's allowed to repeat
	if (allowAloo) {
		const filtered1 = components1.filter(c => c !== 'aloo');
		const filtered2 = components2.filter(c => c !== 'aloo');
		return filtered1.some(c => filtered2.includes(c));
	}
	
	return components1.some(c => components2.includes(c));
}

// Check if a dish shares components with any dish in a list
function sharesComponentsWithAny(dish: string, dishList: string[], allowAloo: boolean = false): boolean {
	return dishList.some(existingDish => shareComponents(dish, existingDish, allowAloo));
}

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

// Advanced meal generation with round-robin + randomness + component-based duplicate prevention
class MealGenerator {
	private breakfastIndex = 0;
	private lunchDalCurryIndex = 0;
	private lunchVegIndex = 0;
	private dinnerDalCurryIndex = 0;
	private dinnerVegIndex = 0;
	private preferences: Preferences;
	private previousMeals: Meal[] = []; // Track previous meals for component checking
	private combinedDalCurry: string[] = []; // Combined dal and curry list

	constructor(preferences: Preferences) {
		this.preferences = preferences;
		// Create combined dal and curry list
		this.combinedDalCurry = [...preferences.dal, ...preferences.curry];
		// Shuffle dinner arrays for variety
		this.shuffleDinnerArrays();
	}

	private shuffleDinnerArrays() {
		// Create shuffled copy of combined dal+curry for dinner variety using Fisher–Yates shuffle
		const shuffledDalCurry = [...this.combinedDalCurry];
		for (let i = shuffledDalCurry.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledDalCurry[i], shuffledDalCurry[j]] = [shuffledDalCurry[j], shuffledDalCurry[i]];
		}
		const shuffledVeg = [...this.preferences.veg];
		for (let i = shuffledVeg.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledVeg[i], shuffledVeg[j]] = [shuffledVeg[j], shuffledVeg[i]];
		}
		
		// Store shuffled arrays for dinner
		(this as any).dinnerDalCurryArray = shuffledDalCurry;
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

	private selectDalCurryItem(array: string[], index: number): string {
		if (!array.length) return 'Item';
		// 90% round-robin, 10% random
		if (this.shouldUseRandom()) {
			return array[Math.floor(Math.random() * array.length)];
		}
		return array[index % array.length];
	}

	// Check if a dish conflicts with components in the same meal
	private hasComponentConflictInSameMeal(dish: string, otherDishes: string[]): boolean {
		return sharesComponentsWithAny(dish, otherDishes, false); // No Aloo exception within same meal
	}

	// Check if a dish conflicts with components from previous meals
	private hasComponentConflictWithPrevious(dish: string, previousMeals: Meal[]): boolean {
		for (const meal of previousMeals) {
			const allPreviousDishes = [
				meal.breakfast,
				...meal.lunch.slice(0, 2), // Exclude 'Roti/Rice'
				...meal.dinner.slice(0, 2) // Exclude 'Roti/Rice'
			];
			
			// For previous days, no Aloo exception - all components must be different
			if (sharesComponentsWithAny(dish, allPreviousDishes, false)) {
				return true;
			}
		}
		return false;
	}

	// Check if a dish conflicts with same-day meals
	private hasComponentConflictWithSameDay(dish: string, sameDayMeals: string[]): boolean {
		// No Aloo exception - all components must be different across same day
		return sharesComponentsWithAny(dish, sameDayMeals, false);
	}

	// Find a dish that doesn't conflict with components
	private findNonConflictingDish(
		availableDishes: string[], 
		avoidDishes: string[], 
		previousMeals: Meal[],
		sameDayMeals: string[] = []
	): string {
		// First, try to find a dish that doesn't conflict with same meal components
		const sameMealFiltered = availableDishes.filter(dish => 
			!this.hasComponentConflictInSameMeal(dish, avoidDishes)
		);
		
		if (sameMealFiltered.length === 0) {
			// If no options without same-meal conflicts, use original logic
			return pickDifferentFromList(availableDishes, avoidDishes, availableDishes[0] || 'Item');
		}
		
		// Then, try to find one that doesn't conflict with same day meals (Aloo exception applies)
		const sameDayFiltered = sameMealFiltered.filter(dish => 
			!this.hasComponentConflictWithSameDay(dish, sameDayMeals)
		);
		
		if (sameDayFiltered.length > 0) {
			// Finally, try to find one that doesn't conflict with previous days
			const previousDayFiltered = sameDayFiltered.filter(dish => 
				!this.hasComponentConflictWithPrevious(dish, previousMeals)
			);
			
			if (previousDayFiltered.length > 0) {
				return pickRandom(previousDayFiltered) || previousDayFiltered[0];
			}
			
			// Fallback to same-day filtered options
			return pickRandom(sameDayFiltered) || sameDayFiltered[0];
		}
		
		// Fallback to same-meal filtered options
		return pickRandom(sameMealFiltered) || sameMealFiltered[0];
	}

	// Find a dal/curry dish with round-robin logic (90% round-robin, 10% random)
	private findNonConflictingDalCurryDish(
		availableDishes: string[], 
		avoidDishes: string[], 
		previousMeals: Meal[],
		sameDayMeals: string[] = [],
		index: number
	): string {
		// First, try to find a dish that doesn't conflict with same meal components
		const sameMealFiltered = availableDishes.filter(dish => 
			!this.hasComponentConflictInSameMeal(dish, avoidDishes)
		);
		
		if (sameMealFiltered.length === 0) {
			// If no options without same-meal conflicts, use original logic
			return pickDifferentFromList(availableDishes, avoidDishes, availableDishes[0] || 'Item');
		}
		
		// Then, try to find one that doesn't conflict with same day meals
		const sameDayFiltered = sameMealFiltered.filter(dish => 
			!this.hasComponentConflictWithSameDay(dish, sameDayMeals)
		);
		
		if (sameDayFiltered.length > 0) {
			// Finally, try to find one that doesn't conflict with previous days
			const previousDayFiltered = sameDayFiltered.filter(dish => 
				!this.hasComponentConflictWithPrevious(dish, previousMeals)
			);
			
			if (previousDayFiltered.length > 0) {
				// Use round-robin logic (90% round-robin, 10% random)
				return this.selectDalCurryItem(previousDayFiltered, index);
			}
			
			// Fallback to same-day filtered options with round-robin logic
			return this.selectDalCurryItem(sameDayFiltered, index);
		}
		
		// Fallback to same-meal filtered options with round-robin logic
		return this.selectDalCurryItem(sameMealFiltered, index);
	}

	generateMeal(): Meal {
		// Breakfast: Use component-based conflict detection
		const breakfast = this.findNonConflictingDish(
			this.preferences.breakfast,
			[], // No same-meal conflicts for breakfast
			this.previousMeals,
			[] // No same-day meals yet
		);
		this.breakfastIndex++;

		// Lunch Dal/Curry: Use combined list with 90% round-robin, 10% random
		const lunchDal = this.findNonConflictingDalCurryDish(
			this.combinedDalCurry,
			[], // No same-meal conflicts yet
			this.previousMeals,
			[breakfast], // Include breakfast for same-day conflict checking
			this.lunchDalCurryIndex
		);
		this.lunchDalCurryIndex++;

		// Lunch Veg: Use component-based conflict detection, avoid conflicts with lunch dal
		const lunchVeg = this.findNonConflictingDish(
			this.preferences.veg,
			[lunchDal], // Avoid conflicts with lunch dal
			this.previousMeals,
			[breakfast] // Include breakfast for same-day conflict checking
		);
		this.lunchVegIndex++;

		// Dinner Dal/Curry: Use combined list with 90% round-robin, 10% random
		const dinnerDal = this.findNonConflictingDalCurryDish(
			(this as any).dinnerDalCurryArray,
			[lunchDal, lunchVeg], // Avoid conflicts with lunch items
			this.previousMeals,
			[breakfast, lunchDal, lunchVeg], // Include all same-day meals
			this.dinnerDalCurryIndex
		);
		this.dinnerDalCurryIndex++;

		// Dinner Veg: Use component-based conflict detection, avoid conflicts with all other items
		const dinnerVeg = this.findNonConflictingDish(
			(this as any).dinnerVegArray,
			[lunchDal, lunchVeg, dinnerDal], // Avoid conflicts with all other items
			this.previousMeals,
			[breakfast, lunchDal, lunchVeg, dinnerDal] // Include all same-day meals
		);
		this.dinnerVegIndex++;

		const meal = {
			breakfast,
			lunch: [lunchDal, lunchVeg, 'Roti/Rice'],
			dinner: [dinnerDal, dinnerVeg, 'Roti/Rice'],
		};

		// Add this meal to previous meals for future conflict checking
		this.previousMeals.push(meal);

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
		week.push(meal);
	}

	// The component-based conflict detection is now handled within the MealGenerator
	// The previous logic for exact item duplicates is still maintained as a fallback
	// but the primary prevention is now component-based
	
	return week;
}

type MenuState = {
	week: WeekMenu;
	loading: boolean;
	regeneratingMeal: string | null; // Format: "dayIndex-mealType" e.g., "0-breakfast", "2-lunch"
	generate: (prefs: Preferences) => Promise<void>;
	regenerateMeal: (dayIndex: number, which: 'breakfast'|'lunch'|'dinner', prefs: Preferences) => Promise<void>;
	clearMenu: () => Promise<void>;
	loadMenu: (menu: WeekMenu) => void;
};

export const useMenuStore = create<MenuState>((set, get) => ({
	week: [],
	loading: false,
	regeneratingMeal: null,
	generate: async (prefs) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
		
		let newWeek = generateWeek(prefs);
		// Post-process to ensure no consecutive duplicates in the in-app order
		// In-app shows days starting from today (not Monday). Give preference to this order.
		const today = new Date();
		const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0..Sun=6
		
		function rotateToStart<T>(arr: T[], startIndex: number): T[] {
			const rotated: T[] = [];
			for (let i = 0; i < arr.length; i++) {
				rotated.push(arr[(startIndex + i) % arr.length]);
			}
			return rotated;
		}
		function rotateBackToMonday<T>(arr: T[], startIndex: number): T[] {
			const original: T[] = [];
			for (let i = 0; i < arr.length; i++) {
				// Reverse of rotateToStart: element at i in Monday-order corresponds to
				// index (i - startIndex + 7) % 7 in rotated array
				const srcIndex = (i - startIndex + arr.length) % arr.length;
				original.push(arr[srcIndex]);
			}
			return original;
		}
		
		function ensureNoAdjDuplicatesDisplayOrder(weekIn: WeekMenu, preferences: Preferences, startIndex: number): WeekMenu {
			const rotated = rotateToStart(weekIn, startIndex);
			for (let d = 0; d < rotated.length; d++) {
				if (d === 0) continue;
				const prev = rotated[d - 1];
				const cur = rotated[d];
				// Breakfast
				if (cur.breakfast === prev.breakfast) {
					cur.breakfast = pickDifferentFromList(preferences.breakfast, [prev.breakfast], cur.breakfast);
				}
				// Lunch dal and veg
				if (cur.lunch[0] === prev.lunch[0]) {
					cur.lunch[0] = pickDifferentFromList(preferences.dal, [prev.lunch[0]], cur.lunch[0]);
				}
				if (cur.lunch[1] === prev.lunch[1]) {
					cur.lunch[1] = pickDifferentFromList(preferences.veg, [prev.lunch[1]], cur.lunch[1]);
				}
				// Dinner dal and veg
				if (cur.dinner[0] === prev.dinner[0]) {
					cur.dinner[0] = pickDifferentFromList(preferences.dal, [prev.dinner[0]], cur.dinner[0]);
				}
				if (cur.dinner[1] === prev.dinner[1]) {
					cur.dinner[1] = pickDifferentFromList(preferences.veg, [prev.dinner[1]], cur.dinner[1]);
				}
				// Keep lunch vs dinner different within the same day
				if (cur.dinner[0] === cur.lunch[0]) {
					cur.dinner[0] = pickDifferentFromList(preferences.dal, [cur.lunch[0]], cur.dinner[0]);
				}
				if (cur.dinner[1] === cur.lunch[1]) {
					cur.dinner[1] = pickDifferentFromList(preferences.veg, [cur.lunch[1]], cur.dinner[1]);
				}
			}
			return rotateBackToMonday(rotated, startIndex);
		}
		
		newWeek = ensureNoAdjDuplicatesDisplayOrder(newWeek, prefs, todayIndex);
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
		
		const mealId = `${dayIndex}-${which}`;
		set({ regeneratingMeal: mealId });
		
		const copy = get().week.slice();
		if (!copy[dayIndex]) {
			set({ regeneratingMeal: null });
			return;
		}
		
		// Create a generator with previous meals for component conflict detection
		const generator = new MealGenerator(prefs);
		
		// Add all previous meals to the generator's history
		for (let i = 0; i < dayIndex; i++) {
			if (copy[i]) {
				(generator as any).previousMeals.push(copy[i]);
			}
		}
		
		// For same-day conflict checking, we need to get all same-day meals
		const currentDayMeal = copy[dayIndex];
		const sameDayMeals: string[] = [];
		
		if (currentDayMeal) {
			sameDayMeals.push(currentDayMeal.breakfast);
			sameDayMeals.push(...currentDayMeal.lunch.slice(0, 2));
			sameDayMeals.push(...currentDayMeal.dinner.slice(0, 2));
		}
		
		// Generate a new meal with component-based conflict detection
		const generated = generator.generateMeal();
		let newMeal = generated[which];
		
		// For lunch and dinner, we need to handle the array structure
		if (which === 'lunch' || which === 'dinner') {
			const currentMeal = copy[dayIndex][which];
			const newMealArray = generated[which];
			
			// Ensure we get a different meal by trying multiple times if needed
			let attempts = 0;
			while (attempts < 10 && JSON.stringify(newMealArray) === JSON.stringify(currentMeal)) {
				const newGenerator = new MealGenerator(prefs);
				// Add previous meals to new generator
				for (let i = 0; i < dayIndex; i++) {
					if (copy[i]) {
						(newGenerator as any).previousMeals.push(copy[i]);
					}
				}
				// Add same-day meals for Aloo exception
				(newGenerator as any).sameDayMeals = sameDayMeals;
				const tempGenerated = newGenerator.generateMeal();
				newMeal = tempGenerated[which];
				attempts++;
			}
		} else {
			// For breakfast, ensure we get a different item
			const currentMeal = copy[dayIndex][which];
			let attempts = 0;
			while (newMeal === currentMeal && attempts < 10) {
				const newGenerator = new MealGenerator(prefs);
				// Add previous meals to new generator
				for (let i = 0; i < dayIndex; i++) {
					if (copy[i]) {
						(newGenerator as any).previousMeals.push(copy[i]);
					}
				}
				// Add same-day meals for Aloo exception
				(newGenerator as any).sameDayMeals = sameDayMeals;
				const tempGenerated = newGenerator.generateMeal();
				newMeal = tempGenerated[which];
				attempts++;
			}
		}
		
		copy[dayIndex] = {
			...copy[dayIndex],
			[which]: newMeal,
		};
		
		set({ week: copy });
		
		// Save to Firebase
		const { error } = await updateUserMenu(user.id, copy);
		if (error) {
			console.error('Failed to save menu to Firebase:', error);
		}
		
		set({ regeneratingMeal: null });
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