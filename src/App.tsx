import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { AuthGuard } from './components/AuthGuard';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { Home } from './pages/Home';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Preferences } from './pages/Preferences';
import { PreferencesStep } from './pages/preferences/PreferencesStep';
import { WeeklyView } from './pages/menu/WeeklyView';
import { DailyView } from './pages/menu/DailyView';
import { useAuthStore } from './store/auth';
import { useNotificationStore } from './store/notifications';

export default function App() {
	const { initialize } = useAuthStore();
    const { init: initNotifications } = useNotificationStore();

	useEffect(() => {
		console.log('App: Initializing auth store');
		initialize();
        // Initialize notifications early so native listeners catch taps from cold start
        try { initNotifications(); } catch (e) { console.warn('Notifications init failed', e); }
	}, [initialize]);

	console.log('App: Rendering with routes');
	
	return (
		<Routes>
			<Route path="/" element={<AuthGuard />} />
			<Route path="/signup" element={<SignUp />} />
			<Route path="/signin" element={<SignIn />} />
			<Route element={<AppShell />}>
				<Route path="/home" element={<Home />} />
				<Route path="/notifications" element={<Notifications />} />
				<Route path="/preferences" element={<Preferences />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/preferences/:step" element={<PreferencesStep />} />
				<Route path="/menu/weekly" element={<WeeklyView />} />
				<Route path="/menu/daily/:dayIndex" element={<DailyView />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}


