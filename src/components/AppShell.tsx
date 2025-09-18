import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, User, Salad } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export function AppShell() {
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();

	if (!user && location.pathname !== '/signup') {
		navigate('/signup');
	}

	return (
		<div className="min-h-full grid grid-rows-[auto_1fr_auto]">
			<header className="glass">
				<div className="container h-14 flex items-center justify-between">
					<Link to="/home" className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent">
						<Salad className="text-brand" /> Meal Planner
					</Link>
					<nav className="hidden md:flex items-center gap-2">
						<NavLink to="/home" className={({isActive})=>`pill ${isActive? 'ring-1 ring-sky-300 text-slate-900':'text-slate-600 hover:ring-1 hover:ring-slate-300'}`}><HomeIcon size={18}/> Home</NavLink>
						<NavLink to="/profile" className={({isActive})=>`pill ${isActive? 'ring-1 ring-fuchsia-300 text-slate-900':'text-slate-600 hover:ring-1 hover:ring-slate-300'}`}><User size={18}/> Profile</NavLink>
					</nav>
				</div>
			</header>
			<main className="container py-6">
				<Outlet />
			</main>
			<footer className="md:hidden glass">
				<div className="container h-16 grid grid-cols-2">
					<NavLink to="/home" className={({isActive})=>`flex items-center justify-center gap-2 ${isActive? 'text-brand':'text-slate-300'}`}>
						<HomeIcon /> Home
					</NavLink>
					<NavLink to="/profile" className={({isActive})=>`flex items-center justify-center gap-2 ${isActive? 'text-brand':'text-slate-300'}`}>
						<User /> Profile
					</NavLink>
				</div>
			</footer>
		</div>
	);
}


