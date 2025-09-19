import { create } from 'zustand';
import { onAuthStateChange, signUp, signIn, logout as firebaseLogout } from '../services/firebaseService';
import type { User as FirebaseUser } from 'firebase/auth';

export type User = {
	id: string;
	name: string;
	email: string;
};

type AuthState = {
	user: User | null;
	loading: boolean;
	signUp: (input: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
	signIn: (input: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
	initialize: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	loading: true,
	signUp: async ({ name, email, password }) => {
		set({ loading: true });
		const { user, error } = await signUp(email, password, name);
		
		if (error) {
			set({ loading: false });
			return { success: false, error };
		}
		
		if (user) {
			const userData: User = {
				id: user.uid,
				name,
				email: user.email || email
			};
			set({ user: userData, loading: false });
			return { success: true };
		}
		
		set({ loading: false });
		return { success: false, error: 'Unknown error occurred' };
	},
	signIn: async ({ email, password }) => {
		set({ loading: true });
		const { user, error } = await signIn(email, password);
		
		if (error) {
			set({ loading: false });
			return { success: false, error };
		}
		
		if (user) {
			// Get user data from Firestore
			const { getUserData } = await import('../services/firebaseService');
			const { data } = await getUserData(user.uid);
			
			if (data) {
				const userData: User = {
					id: user.uid,
					name: data.name,
					email: user.email || email
				};
				set({ user: userData, loading: false });
				return { success: true };
			}
		}
		
		set({ loading: false });
		return { success: false, error: 'Failed to load user data' };
	},
	logout: async () => {
		set({ loading: true });
		await firebaseLogout();
		set({ user: null, loading: false });
	},
	initialize: () => {
		onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
			const currentUser = get().user;
			
			if (firebaseUser) {
				// Only update if we don't have a user or if it's a different user
				if (!currentUser || currentUser.id !== firebaseUser.uid) {
					// User is signed in, get their data
					const { getUserData } = await import('../services/firebaseService');
					const { data } = await getUserData(firebaseUser.uid);
					
					if (data) {
						const userData: User = {
							id: firebaseUser.uid,
							name: data.name,
							email: firebaseUser.email || ''
						};
						set({ user: userData, loading: false });
						
						// Load user preferences and menu
						const { usePrefStore } = await import('./preferences');
						const { useMenuStore } = await import('./menu');
						
						if (data.preferences) {
							usePrefStore.getState().loadPreferences(data.preferences);
						}
						
						if (data.menu) {
							useMenuStore.getState().loadMenu(data.menu);
						}
					} else {
						set({ user: null, loading: false });
					}
				}
			} else {
				// User is signed out
				set({ user: null, loading: false });
			}
		});
	}
}));


