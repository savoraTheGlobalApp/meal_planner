import { create } from 'zustand';

export type Category = 'breakfast' | 'dal' | 'veg' | 'salad';

export type Preferences = Record<Category, string[]>;

const initialItems: Record<Category, string[]> = {
	breakfast: ['Poha','Daliya','Upma','Aloo Paratha','Paneer Paratha','Gobhi Paratha','Masala Dosa','Idli Sambhar','Veg Sandwich','Cornflakes'],
	dal: ['Moong Dal','Masoor Dal','Chana Dal','Toor (Arhar) Dal','Urad Dal','Rajma','Chhole','Lobia'],
	veg: ['Potato','Paneer','Mushroom','Spinach','Cauliflower','Broccoli','Cabbage','Beans','Peas','Brinjal','Okra (Bhindi)','Capsicum','Bottle Gourd (Lauki)'],
	salad: ['Apple','Banana','Carrot','Beetroot','Papaya','Orange','Grapes','Mango','Pomegranate'],
};

type PrefState = {
	available: Record<Category, string[]>;
	selected: Preferences;
	addCustom: (cat: Category, item: string) => void;
	removeCustom: (cat: Category, item: string) => void;
	toggleSelected: (cat: Category, item: string) => void;
};

export const usePrefStore = create<PrefState>((set, get) => ({
	available: initialItems,
	selected: { breakfast: [], dal: [], veg: [], salad: [] },
	addCustom: (cat, item) => {
		item = item.trim();
		if (!item) return;
		const exists = get().available[cat].some(i => i.toLowerCase() === item.toLowerCase());
		set(state => {
			const newState = {
				available: {
					...state.available,
					[cat]: exists ? state.available[cat] : [...state.available[cat], item],
				},
				selected: {
					...state.selected,
					[cat]: [...new Set([...state.selected[cat], item])],
				}
			};
			// Save to localStorage
			localStorage.setItem('preferences', JSON.stringify(newState.selected));
			return newState;
		});
	},
	removeCustom: (cat, item) => {
		set(state => {
			const newState = {
				available: {
					...state.available,
					[cat]: state.available[cat].filter(i => i !== item),
				},
				selected: {
					...state.selected,
					[cat]: state.selected[cat].filter(i => i !== item),
				}
			};
			// Save to localStorage
			localStorage.setItem('preferences', JSON.stringify(newState.selected));
			return newState;
		});
	},
	toggleSelected: (cat, item) => {
		set(state => {
			const isOn = state.selected[cat].includes(item);
			const newState = {
				selected: {
					...state.selected,
					[cat]: isOn ? state.selected[cat].filter(i => i !== item) : [...state.selected[cat], item],
				}
			};
			// Save to localStorage
			localStorage.setItem('preferences', JSON.stringify(newState.selected));
			return newState;
		});
	}
}));

// Load preferences from localStorage on initialization
const savedPrefs = localStorage.getItem('preferences');
if (savedPrefs) {
	try {
		const parsed = JSON.parse(savedPrefs) as Preferences;
		usePrefStore.setState({ selected: parsed });
	} catch (error) {
		console.error('Failed to load preferences from localStorage:', error);
	}
}


