import { useAuthStore } from '@/store/auth';

export function Profile() {
	const { user, logout } = useAuthStore();
	if (!user) return null;
	return (
		<div className="max-w-xl">
			<div className="card space-y-4">
				<h2 className="text-xl font-semibold">Profile</h2>
				<div>
					<div className="text-slate-300">Name</div>
					<div className="font-medium">{user.name}</div>
				</div>
				<div>
					<div className="text-slate-300">Email</div>
					<div className="font-medium">{user.email}</div>
				</div>
				<button className="btn btn-outline" onClick={logout}>Log out</button>
			</div>
		</div>
	);
}


