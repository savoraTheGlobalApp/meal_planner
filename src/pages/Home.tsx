import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notifications';
import { usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';

export function Home() {
	const selected = usePrefStore(s => s.selected);
	const { week } = useMenuStore();
	const hasMenu = week.length > 0;
	
	// Get today's day index for navigation
	const today = new Date();
	const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday=0 to Sunday=6
	
	const { init } = useNotificationStore();
	useEffect(() => { init(); }, [init]);

	return (
		<div className="space-y-6">
			{/* Show Preferences Card only if no menu has been generated */}
			{!hasMenu && (
				<div>
				<div className="card bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
				<div>
					<h2 className="text-xl font-bold text-slate-800 mb-2">Set Your Preferences</h2>
					<p className="text-slate-600 mb-4">Tell us about your food choices and dietary preferences to create your personalized meal plan.</p>
					<Link 
						to="/preferences/breakfast" 
						className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v2m0-6a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
						</svg>
						Select Preferences
					</Link>
				</div>
			</div>
			{/* Punchline card below preferences */}
			<div className="card mt-4 bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200">
				<div className="text-center py-4">
					<h3 className="text-lg font-bold text-orange-800 mb-1">Goodbye meal planning</h3>
					<p className="text-sm text-orange-600">Start cooking!!</p>
				</div>
			</div>
			</div>
			)}

			{/* Show Menu Viewing Card only if menu has been generated */}
			{hasMenu && (
				<div>
				<div className="card bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200">
					<div>
						<h2 className="text-xl font-bold text-slate-800 mb-2">View Your Menu</h2>
						<p className="text-slate-600 mb-4">Explore your personalized meal plan with weekly and daily views.</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Link 
								to="/menu/weekly" 
								className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								Weekly View
							</Link>
							<Link 
								to={`/menu/daily/${todayIndex}`} 
								className="w-full inline-flex items-center justify-center gap-2 bg-white text-emerald-600 border-2 border-emerald-200 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Daily View
							</Link>
						</div>
					</div>
				</div>
				{/* Punchline card below menu */}
				<div className="card mt-4 bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200">
					<div className="text-center py-4">
						<h3 className="text-lg font-bold text-orange-800 mb-1">Goodbye meal planning</h3>
						<p className="text-sm text-orange-600">Start cooking!!</p>
					</div>
				</div>
				</div>
			)}

		</div>
	);
}


