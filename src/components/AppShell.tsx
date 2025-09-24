import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, User, Heart, LogOut, Bell, Menu, HelpCircle } from 'lucide-react';
import { useNotificationStore } from '@/store/notifications';
import appLogo from '/logo.png';
import { useAuthStore } from '../store/auth';
import { useState, useEffect } from 'react';

export function AppShell() {
	const { user, loading, logout } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();
	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
    const unread = useNotificationStore(s => s.notifications.filter(n => !n.read).length);

	console.log('AppShell: Rendering with user:', user, 'loading:', loading, 'path:', location.pathname);

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

	const handleLogout = async () => {
		await logout();
		navigate('/');
	};

    const isNotifications = location.pathname.startsWith('/notifications');
    const isProfile = location.pathname.startsWith('/profile');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	return (
		<div className="min-h-screen flex flex-col">
            {profileMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={()=>setProfileMenuOpen(false)}></div>
            )}
            {!isNotifications && (
			<header 
                className={`glass sticky top-0 z-50 transition-transform duration-300 ${
				isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
			}`}
                onClick={() => profileMenuOpen && setProfileMenuOpen(false)}
            >
				<div className="container h-14 flex items-center justify-between">
                        {isProfile ? (
                            <button 
                                onClick={() => navigate('/profile?help=true')}
                                className="flex items-center gap-2 text-lg font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                                title="Help & Tips"
                            >
                                <HelpCircle size={24} />
                            </button>
                        ) : (
                            <Link to="/home" className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent">
                                <img src={appLogo} alt="Meal Planner" className="w-6 h-6 rounded" /> Meal Planner
                            </Link>
                        )}
                        <div className="flex items-center gap-2">
                            {location.pathname.startsWith('/profile') ? (
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(v=>!v); }}
                                        className="pill text-slate-600 hover:ring-1 hover:ring-slate-300 inline-flex"
                                        title="Menu"
                                    >
                                        <Menu size={18} />
                                    </button>
                                    {profileMenuOpen && (
                                        <>
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50" onClick={(e)=> e.stopPropagation()}>
                                                <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={() => { setProfileMenuOpen(false); navigate('/profile?modal=notification'); }}>Notification</button>
                                                <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={() => { setProfileMenuOpen(false); navigate('/profile?modal=edit'); }}>Edit Profile</button>
                                                <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={() => { setProfileMenuOpen(false); navigate('/profile?modal=logout'); }}>Log out</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="relative pill text-slate-600 hover:ring-1 hover:ring-slate-300 hidden md:inline-flex"
                                    title="Notifications"
                                >
                                    <Bell size={18} />
                                    {unread > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 text-center">
                                            {unread > 99 ? '99+' : unread}
                                        </span>
                                    )}
                                </button>
                            )}
					<nav className="hidden md:flex items-center gap-2">
						<NavLink to="/home" className={({isActive})=>`pill ${isActive? 'ring-1 ring-sky-300 text-slate-900':'text-slate-600 hover:ring-1 hover:ring-slate-300'}`}><HomeIcon size={18}/> Home</NavLink>
                            <NavLink to="/preferences" className={({isActive})=>`pill ${isActive? 'ring-1 ring-emerald-300 text-slate-900':'text-slate-600 hover:ring-1 hover:ring-slate-300'}`}><Heart size={18}/> Preferences</NavLink>
						<NavLink to="/profile" className={({isActive})=>`pill ${isActive? 'ring-1 ring-fuchsia-300 text-slate-900':'text-slate-600 hover:ring-1 hover:ring-slate-300'}`}><User size={18}/> Profile</NavLink>
						<button 
							onClick={handleLogout}
							className="pill text-slate-600 hover:ring-1 hover:ring-slate-300"
						>
							<LogOut size={18}/> Logout
						</button>
					</nav>
                        </div>
				</div>
			</header>
            )}
            <main className={`flex-1 container ${isNotifications ? 'pt-0' : 'py-6'} pb-16 md:pb-6`}>
				<Outlet />
			</main>
			<footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-200">
                <div className="container h-12 grid grid-cols-3">
                    <NavLink to="/home" className={({isActive})=>`relative flex items-center justify-center transition-colors ${isActive? 'text-blue-600':'text-slate-400 hover:text-slate-600'}`}>
                        <HomeIcon size={22} fill={location.pathname === '/home' ? 'currentColor' : 'none'} />
                        {location.pathname !== '/notifications' && unread > 0 && (
                            <span className="absolute top-1/4 left-1/2 translate-x-2 -translate-y-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[10px] leading-3.5 text-center">
                                {unread > 99 ? '99+' : unread}
                            </span>
                        )}
                    </NavLink>
                    <NavLink to="/preferences" className={({isActive})=>`flex items-center justify-center transition-colors ${isActive? 'text-emerald-600':'text-slate-400 hover:text-slate-600'}`}>
                        <Heart size={22} fill={location.pathname === '/preferences' ? 'currentColor' : 'none'} />
					</NavLink>
                    <NavLink to="/profile" className={({isActive})=>`flex items-center justify-center transition-colors ${isActive? 'text-purple-600':'text-slate-400 hover:text-slate-600'}`}>
                        <User size={22} fill={location.pathname === '/profile' ? 'currentColor' : 'none'} />
					</NavLink>
				</div>
			</footer>
		</div>
	);
}