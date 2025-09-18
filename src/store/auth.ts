import { create } from 'zustand';

export type User = {
	id: string;
	name: string;
	email: string;
};

type AuthState = {
	user: User | null;
	signUp: (input: { name: string; email: string }) => void;
	logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	signUp: ({ name, email }) => {
		const id = crypto.randomUUID();
		const user: User = { id, name, email };
		localStorage.setItem('user', JSON.stringify(user));
		set({ user });
	},
	logout: () => {
		localStorage.removeItem('user');
		set({ user: null });
	},
}));

// hydrate from storage
const raw = localStorage.getItem('user');
if (raw) {
	try {
		const user = JSON.parse(raw) as User;
		useAuthStore.setState({ user });
	} catch {}
}


