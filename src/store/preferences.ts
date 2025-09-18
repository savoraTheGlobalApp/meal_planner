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
		set(state => ({
			available: {
				...state.available,
				[cat]: exists ? state.available[cat] : [...state.available[cat], item],
			},
			selected: {
				...state.selected,
				[cat]: [...new Set([...state.selected[cat], item])],
			}
		}));
	},
	removeCustom: (cat, item) => {
		set(state => ({
			available: {
				...state.available,
				[cat]: state.available[cat].filter(i => i !== item),
			},
			selected: {
				...state.selected,
				[cat]: state.selected[cat].filter(i => i !== item),
			}
		}));
	},
	toggleSelected: (cat, item) => {
		set(state => {
			const isOn = state.selected[cat].includes(item);
			return {
				selected: {
					...state.selected,
					[cat]: isOn ? state.selected[cat].filter(i => i !== item) : [...state.selected[cat], item],
				}
			};
		});
	}
}));


