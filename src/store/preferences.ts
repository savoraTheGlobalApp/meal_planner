import { create } from 'zustand';
import { updateUserPreferences } from '../services/firebaseService';
import { useAuthStore } from './auth';

export type Category = 'breakfast' | 'dal' | 'veg';

export type Preferences = Record<Category, string[]>;

export const initialItems: Record<Category, string[]> = {
	breakfast: ['Poha','Daliya','Upma','Aloo Paratha','Paneer Paratha','Gobhi Paratha','Masala Dosa','Idli Sambhar','Veg Sandwich','Cornflakes','Vermicelli','Chilla/Cheela','Chana','Moong Dal','Maggi','Pasta','Macroni','Bread Omlette','Bread Pakoda','Uttapam','Oats'],
	dal: [
		'Aloo (Potato)', 'Aloo Baingan','Aloo Capsicum (Shimla Mirch)','Aloo Matar','Aloo Mushroom',
		'Aloo Palak', 'Aloo Parval', 'Aloo Soyabean','Bhindi (Okra) Masala (Gravy)',
		'Butter Chicken','Chana Dal','Chana Masala', 'Chhole', 'Chicken Chettinad',
		'Chicken Curry','Chicken Do Pyaza','Chicken Handi','Chicken Korma',
		'Chicken Masala', 'Chicken Mughlai', 'Chicken Saagwala','Chicken Tikka Masala','Dal Fry',
		'Dal Makhani','Dal Tadka','Egg Curry',
		'Egg Masala','Anda Do Pyaza','Fish Curry','Fish Fry Curry',
		'Fish Korma','Fish Masala','Kadai Chicken',
		'Kadai Paneer','Lauki Chana Dal','Lobia (Black-eyed Beans)','Malka Masoor',
		'Masoor Dal','Matar Paneer','Moong Dal',
		'Mushroom Masala','Palak Dal','Palak Paneer','Paneer Bhurji',
		'Paneer Butter Masala', 'Parval (Pointed Gourd)', 'Rajma (Kidney Beans)',
		'Shahi Paneer', 'Soyabean Curry','Toor (Arhar) Dal','Urad Dal'
	  ],
	  veg: [
		'Aloo (Potato)','Aloo Baingan','Aloo Beans','Aloo Bhindi', 'Aloo Broccoli', 'Aloo Capsicum', 
		'Aloo Chana',  'Aloo Gobhi', 'Aloo Kaddu', 'Aloo Matar','Aloo Mushroom','Aloo Palak', 'Aloo Parval',
        'Aloo Patta Gobhi', 'Aloo Shimla Mirch', 'Aloo Tinda', 'Baingan (Brinjal)','Baingan Bharta','Beans', 'Beetroot',
        'Beans Poriyal','Bhindi (Okra)','Bhindi Masala (Dry)','Broccoli', 'Cabbage', 'Carrot',	
		'Cabbage Peas','Capsicum (Shimla Mirch)','Chicken Fry','Egg Bhurji',
		'Fish Fry','Gajar Matar','Gobhi (Cauliflower)','Kaddu (Pumpkin) Dry Sabzi',
		'Kadai Paneer','Keema Fry (Minced Meat Fry)','Lauki (Bottle Gourd)',
		'Matar (Peas)','Matar Paneer','Mix Veg Sabzi','Mushroom',
		'Palak (Spinach)','Palak Paneer','Paneer',
		'Paneer Bhurji','Patta Gobhi (Cabbage)','Shahi Paneer','Tinda Masala'
	  ],	  
};

type PrefState = {
	available: Record<Category, string[]>;
	selected: Preferences;
	loading: boolean;
	addCustom: (cat: Category, item: string) => Promise<void>;
	removeCustom: (cat: Category, item: string) => Promise<void>;
	toggleSelected: (cat: Category, item: string) => Promise<void>;
    saveSelected: () => Promise<void>;
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
        // Local-only update; persistence happens on saveSelected
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
		set({ loading: false });
	},
	removeCustom: async (cat, item) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
        // Local-only update; persistence happens on saveSelected
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
		set({ loading: false });
	},
	toggleSelected: async (cat, item) => {
		const { user } = useAuthStore.getState();
		if (!user) return;
		
		set({ loading: true });
        // Local-only update; persistence happens on saveSelected
		const isOn = get().selected[cat].includes(item);
		const newState = {
			selected: {
				...get().selected,
				[cat]: isOn ? get().selected[cat].filter(i => i !== item) : [...get().selected[cat], item],
			}
		};
		
        // Update local state
		set(newState);
		set({ loading: false });
	},
    saveSelected: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        set({ loading: true });
        const current = get().selected;
        const { error } = await updateUserPreferences(user.id, current);
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

		// Ensure available lists always include any custom items that were previously saved
		function mergeAvailable(base: string[], selected: string[]): string[] {
			const lower = new Set(base.map(i => i.toLowerCase()));
			const merged = base.slice();
			for (const item of selected) {
				if (!lower.has(item.toLowerCase())) {
					merged.push(item);
					lower.add(item.toLowerCase());
				}
			}
			return merged;
		}

		set({
			selected: migratedPreferences,
			available: {
				breakfast: mergeAvailable(initialItems.breakfast, migratedPreferences.breakfast),
				dal: mergeAvailable(initialItems.dal, migratedPreferences.dal),
				veg: mergeAvailable(initialItems.veg, migratedPreferences.veg),
			}
		});
	}
}));


