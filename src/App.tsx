import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { PreferencesStep } from './pages/preferences/PreferencesStep';
import { WeeklyView } from './pages/menu/WeeklyView';
import { DailyView } from './pages/menu/DailyView';
import { useAuthStore } from './store/auth';

export default function App() {
	const { initialize } = useAuthStore();

	useEffect(() => {
		initialize();
	}, [initialize]);

	return (
		<Routes>
			<Route path="/signup" element={<SignUp />} />
			<Route path="/signin" element={<SignIn />} />
			<Route element={<AppShell />}>
				<Route index element={<Navigate to="/home" replace />} />
				<Route path="/home" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/preferences/:step" element={<PreferencesStep />} />
				<Route path="/menu/weekly" element={<WeeklyView />} />
				<Route path="/menu/daily/:dayIndex" element={<DailyView />} />
			</Route>
			<Route path="*" element={<Navigate to="/signup" replace />} />
		</Routes>
	);
}


