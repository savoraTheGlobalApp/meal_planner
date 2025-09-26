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
	public lunchDalCurryIndex = 0;
	public lunchVegIndex = 0;
	public dinnerDalCurryIndex = 0;
	public dinnerVegIndex = 0;
	public preferences: Preferences;
	public previousMeals: Meal[] = []; // Track previous meals for component checking
	public combinedDalCurry: string[] = []; // Combined dal and curry list

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
	public findNonConflictingDish(
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


	generateMeal(): Meal {
		// Breakfast: Use component-based conflict detection
		const breakfast = this.findNonConflictingDish(
			this.preferences.breakfast,
			[], // No same-meal conflicts for breakfast
			this.previousMeals,
			[] // No same-day meals yet
		);
		this.breakfastIndex++;

		// Lunch Dal/Curry: Use combined list with conflict detection
		const lunchDal = this.findNonConflictingDish(
			this.combinedDalCurry,
			[], // No same-meal conflicts yet
			this.previousMeals,
			[breakfast] // Include breakfast for same-day conflict checking
		);

		// Lunch Veg: Use component-based conflict detection, avoid conflicts with lunch dal
		const lunchVeg = this.findNonConflictingDish(
			this.preferences.veg,
			[lunchDal], // Avoid conflicts with lunch dal
			this.previousMeals,
			[breakfast] // Include breakfast for same-day conflict checking
		);

		// Dinner Dal/Curry: Use combined list with conflict detection
		const dinnerDal = this.findNonConflictingDish(
			(this as any).dinnerDalCurryArray,
			[lunchDal, lunchVeg], // Avoid conflicts with lunch items
			this.previousMeals,
			[breakfast, lunchDal, lunchVeg] // Include all same-day meals
		);

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
	showRegenerateModal: boolean;
	regenerateModalData: { dayIndex: number; mealType: 'lunch'|'dinner'; currentMeal: string[] } | null;
	generate: (prefs: Preferences) => Promise<void>;
	regenerateMeal: (dayIndex: number, which: 'breakfast'|'lunch'|'dinner', prefs: Preferences) => Promise<void>;
	regenerateMealComponent: (dayIndex: number, mealType: 'lunch'|'dinner', component: 'dal'|'veg'|'both', prefs: Preferences) => Promise<void>;
	showRegenerateModalFor: (dayIndex: number, mealType: 'lunch'|'dinner', currentMeal: string[]) => void;
	hideRegenerateModal: () => void;
	regenerateWithHistory: (componentType: 'dal' | 'veg', currentItem: string, availableItems: string[], dayIndex: number, mealType: 'lunch' | 'dinner') => string;
	getPreviousDayItem: (currentDayIndex: number, componentType: 'dal' | 'veg') => string | null;
	updateRegenerationHistory: (componentType: 'dal' | 'veg', newItem: string) => void;
	clearRegenerationHistory: () => void;
	clearMenu: () => Promise<void>;
	loadMenu: (menu: WeekMenu) => void;
};

export const useMenuStore = create<MenuState>((set, get) => ({
	week: [],
	loading: false,
	regeneratingMeal: null,
	showRegenerateModal: false,
	regenerateModalData: null,
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
	},
	regenerateMealComponent: async (dayIndex, mealType, component, prefs) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		const mealId = `${dayIndex}-${mealType}-${component}`;
		set({ regeneratingMeal: mealId });
		
		const copy = get().week.slice();
		if (!copy[dayIndex]) {
			set({ regeneratingMeal: null });
			return;
		}
		
		// Get current meal
		const currentMeal = copy[dayIndex][mealType];
		const currentDal = currentMeal[0];
		const currentVeg = currentMeal[1];
		
		let newDal = currentDal;
		let newVeg = currentVeg;
		
		if (component === 'dal' || component === 'both') {
			// Regenerate dal/curry with smart history tracking
			newDal = get().regenerateWithHistory(
				'dal',
				currentDal,
				[...prefs.dal, ...prefs.curry],
				dayIndex,
				mealType
			);
		}
		
		if (component === 'veg' || component === 'both') {
			// Regenerate vegetable with smart history tracking
			newVeg = get().regenerateWithHistory(
				'veg',
				currentVeg,
				prefs.veg,
				dayIndex,
				mealType
			);
		}
		
		// Update the meal
		copy[dayIndex][mealType] = [newDal, newVeg, 'Roti/Rice'];
		
		// Save to Firebase
		const { error } = await updateUserMenu(user.id, copy);
		if (error) {
			console.error('Failed to update menu in Firebase:', error);
		}
		
		set({ week: copy, regeneratingMeal: null });
	},
	showRegenerateModalFor: (dayIndex, mealType, currentMeal) => {
		set({ 
			showRegenerateModal: true,
			regenerateModalData: { dayIndex, mealType, currentMeal }
		});
	},
	hideRegenerateModal: () => {
		set({ 
			showRegenerateModal: false,
			regenerateModalData: null
		});
	},
	
	// Smart regeneration with localStorage history tracking
	regenerateWithHistory: (
		componentType: 'dal' | 'veg',
		currentItem: string,
		availableItems: string[],
		dayIndex: number,
		mealType: 'lunch' | 'dinner'
	): string => {
		// Get regeneration history from localStorage
		const historyKey = `regeneration_history_${componentType}`;
		const history = JSON.parse(localStorage.getItem(historyKey) || '[]') as string[];
		
		// Get previous day's item (very low probability)
		const previousDayItem = get().getPreviousDayItem(dayIndex, componentType);
		
		// Filter out recent regeneration history (last 3)
		const filteredItems = availableItems.filter(item => !history.includes(item));
		
		// If no items left after filtering, use all available items
		const itemsToChooseFrom = filteredItems.length > 0 ? filteredItems : availableItems;
		
		// Remove current item to ensure we get something different
		const differentItems = itemsToChooseFrom.filter(item => item !== currentItem);
		
		// If no different items available, use all items except current
		const finalItems = differentItems.length > 0 ? differentItems : itemsToChooseFrom;
		
		if (finalItems.length === 0) {
			// Fallback: return current item if no options
			return currentItem;
		}
		
		// Smart selection with previous day consideration
		let selectedItem: string;
		
		// 5% chance to select previous day's item (very low probability)
		if (previousDayItem && Math.random() < 0.05 && finalItems.includes(previousDayItem)) {
			selectedItem = previousDayItem;
		} else {
			// 70% random, 30% systematic selection
			if (Math.random() < 0.7) {
				// Random selection from available items
				selectedItem = finalItems[Math.floor(Math.random() * finalItems.length)];
			} else {
				// Systematic selection: use day index to cycle through items
				const systematicIndex = (dayIndex + (mealType === 'lunch' ? 0 : 1)) % finalItems.length;
				selectedItem = finalItems[systematicIndex];
			}
		}
		
		// Update regeneration history in localStorage
		get().updateRegenerationHistory(componentType, selectedItem);
		
		return selectedItem;
	},
	
	// Get previous day's item for low probability selection
	getPreviousDayItem: (currentDayIndex: number, componentType: 'dal' | 'veg'): string | null => {
		const week = get().week;
		const previousDayIndex = currentDayIndex - 1;
		
		if (previousDayIndex >= 0 && week[previousDayIndex]) {
			const previousDay = week[previousDayIndex];
			// Get the most recent item from previous day (lunch or dinner)
			if (previousDay.lunch && previousDay.lunch.length > 0) {
				return previousDay.lunch[componentType === 'dal' ? 0 : 1];
			}
			if (previousDay.dinner && previousDay.dinner.length > 0) {
				return previousDay.dinner[componentType === 'dal' ? 0 : 1];
			}
		}
		
		return null;
	},
	
	// Update regeneration history in localStorage (maintains last 3 items)
	updateRegenerationHistory: (componentType: 'dal' | 'veg', newItem: string): void => {
		const historyKey = `regeneration_history_${componentType}`;
		const history = JSON.parse(localStorage.getItem(historyKey) || '[]') as string[];
		
		// Add new item
		history.push(newItem);
		
		// Keep only last 3 items
		const updatedHistory = history.slice(-3);
		
		// Save back to localStorage
		localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
	},
	
	// Clear regeneration history (called when app closes/refreshes)
	clearRegenerationHistory: (): void => {
		localStorage.removeItem('regeneration_history_dal');
		localStorage.removeItem('regeneration_history_veg');
	}
}));