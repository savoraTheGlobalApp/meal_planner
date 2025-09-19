import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, User, Salad, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useState, useEffect } from 'react';

export function AppShell() {
	const { user, loading, logout } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();
	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			
			// Show header when scrolling up or at the top
			if (currentScrollY < lastScrollY || currentScrollY < 10) {
				setIsHeaderVisible(true);
			} 
			// Hide header when scrolling down (but not at the very top)
			else if (currentScrollY > lastScrollY && currentScrollY > 100) {
				setIsHeaderVisible(false);
			}
			
			setLastScrollY(currentScrollY);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollY]);

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand"></div>
			</div>
		);
	}

	// Redirect to signup if not authenticated
	if (!user && !['/signup', '/signin'].includes(location.pathname)) {
		navigate('/signup');
		return null;
	}

	// Don't show shell for auth pages
	if (['/signup', '/signin'].includes(location.pathname)) {
		return <Outlet />;
	}

	const handleLogout = async () => {
		await logout();
		navigate('/signup');
	};

	return (
		<div className="min-h-screen flex flex-col">
			<header className={`glass sticky top-0 z-50 transition-transform duration-300 ${
				isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
			}`}>
				<div className="container h-14 flex items-center justify-between">
					<Link to="/home" className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent">
						<Salad className="text-brand" /> Meal Planner
					</Link>
					<nav className="hidden md:flex items-center gap-2">
						<NavLink to="/home" className={({isActive})=>`pill ${isActive? 'ring-1 ring-sky-300 text-slate-900':'text-slate-600 hover:ring-1 hover:ring-slate-300'}`}><HomeIcon size={18}/> Home</NavLink>
						<NavLink to="/profile" className={({isActive})=>`pill ${isActive? 'ring-1 ring-fuchsia-300 text-slate-900':'text-slate-600 hover:ring-1 hover:ring-slate-300'}`}><User size={18}/> Profile</NavLink>
						<button 
							onClick={handleLogout}
							className="pill text-slate-600 hover:ring-1 hover:ring-slate-300"
						>
							<LogOut size={18}/> Logout
						</button>
					</nav>
				</div>
			</header>
			<main className="flex-1 container py-6 pb-20 md:pb-6">
				<Outlet />
			</main>
			<footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-200">
				<div className="container h-16 grid grid-cols-2">
					<NavLink to="/home" className={({isActive})=>`flex items-center justify-center gap-2 transition-colors ${isActive? 'text-brand bg-slate-100':'text-slate-600 hover:text-slate-900'}`}>
						<HomeIcon size={20} /> Home
					</NavLink>
					<NavLink to="/profile" className={({isActive})=>`flex items-center justify-center gap-2 transition-colors ${isActive? 'text-brand bg-slate-100':'text-slate-600 hover:text-slate-900'}`}>
						<User size={20} /> Profile
					</NavLink>
				</div>
			</footer>
		</div>
	);
}