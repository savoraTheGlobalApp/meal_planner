import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { SignUp } from './pages/SignUp';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { PreferencesStep } from './pages/preferences/PreferencesStep';
import { WeeklyView } from './pages/menu/WeeklyView';
import { DailyView } from './pages/menu/DailyView';

export default function App() {
	return (
		<Routes>
			<Route path="/signup" element={<SignUp />} />
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


