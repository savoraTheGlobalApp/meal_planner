import { create } from 'zustand';
import { updateUserPreferences } from '../services/firebaseService';
import { useAuthStore } from './auth';

export type Category = 'breakfast' | 'dal' | 'veg';

export type Preferences = Record<Category, string[]>;

const initialItems: Record<Category, string[]> = {
	breakfast: ['Poha','Daliya','Upma','Aloo Paratha','Paneer Paratha','Gobhi Paratha','Masala Dosa','Idli Sambhar','Veg Sandwich','Cornflakes'],
	dal: ['Moong Dal','Masoor Dal','Chana Dal','Toor (Arhar) Dal','Urad Dal','Rajma','Chhole','Lobia'],
	veg: ['Potato','Paneer','Mushroom','Spinach','Cauliflower','Broccoli','Cabbage','Beans','Peas','Brinjal','Okra (Bhindi)','Capsicum','Bottle Gourd (Lauki)'],
};

type PrefState = {
	available: Record<Category, string[]>;
	selected: Preferences;
	loading: boolean;
	addCustom: (cat: Category, item: string) => Promise<void>;
	removeCustom: (cat: Category, item: string) => Promise<void>;
	toggleSelected: (cat: Category, item: string) => Promise<void>;
	loadPreferences: (preferences: Preferences) => void;
};

export const usePrefStore = create<PrefState>((set, get) => ({
	available: initialItems,
	selected: { breakfast: [], dal: [], veg: [] },
	loading: false,
	addCustom: async (cat, item) => {
		item = item.trim();
		if (!item) return;
		
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
		
		const exists = get().available[cat].some(i => i.toLowerCase() === item.toLowerCase());
		const newState = {
			available: {
				...get().available,
				[cat]: exists ? get().available[cat] : [...get().available[cat], item],
			},
			selected: {
				...get().selected,
				[cat]: [...new Set([...get().selected[cat], item])],
			}
		};
		
		// Update local state
		set(newState);
		
		// Save to Firebase
		const { error } = await updateUserPreferences(user.id, newState.selected);
		if (error) {
			console.error('Failed to save preferences to Firebase:', error);
		}
		
		set({ loading: false });
	},
	removeCustom: async (cat, item) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
		
		const newState = {
			available: {
				...get().available,
				[cat]: get().available[cat].filter(i => i !== item),
			},
			selected: {
				...get().selected,
				[cat]: get().selected[cat].filter(i => i !== item),
			}
		};
		
		// Update local state
		set(newState);
		
		// Save to Firebase
		const { error } = await updateUserPreferences(user.id, newState.selected);
		if (error) {
			console.error('Failed to save preferences to Firebase:', error);
		}
		
		set({ loading: false });
	},
	toggleSelected: async (cat, item) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
		
		const isOn = get().selected[cat].includes(item);
		const newState = {
			selected: {
				...get().selected,
				[cat]: isOn ? get().selected[cat].filter(i => i !== item) : [...get().selected[cat], item],
			}
		};
		
		// Update local state
		set(newState);
		
		// Save to Firebase
		const { error } = await updateUserPreferences(user.id, newState.selected);
		if (error) {
			console.error('Failed to save preferences to Firebase:', error);
		}
		
		set({ loading: false });
	},
	loadPreferences: (preferences: any) => {
		// Handle migration from old data structure that might include 'salad'
		const migratedPreferences: Preferences = {
			breakfast: preferences.breakfast || [],
			dal: preferences.dal || [],
			veg: preferences.veg || []
		};
		
		// If there's old salad data, we can optionally migrate some items to vegetables
		// For now, we'll just ignore the salad data
		if (preferences.salad && Array.isArray(preferences.salad)) {
			console.log('Found old salad data, ignoring:', preferences.salad);
		}
		
		set({ selected: migratedPreferences });
	}
}));


