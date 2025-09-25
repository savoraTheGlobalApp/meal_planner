import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/store/notifications';
import { usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';
import { ArrowLeft, Wand2, ListChecks, CalendarDays, RefreshCcw, Download } from 'lucide-react';

export function Home() {
	const selected = usePrefStore(s => s.selected);
	const { week } = useMenuStore();
	const hasMenu = week.length > 0;
	const [showHelp, setShowHelp] = useState(false);
	
	// Get today's day index for navigation
	const today = new Date();
	const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday=0 to Sunday=6
	
	const { init } = useNotificationStore();
	useEffect(() => { init(); }, [init]);

	// Show help section if toggled
	if (showHelp) {
		return (
			<div className="max-w-xl">
				<div className="flex items-center gap-3 mb-6">
					<button 
						onClick={() => setShowHelp(false)}
						className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
					>
						<ArrowLeft size={20} />
						<span className="font-medium">Back to Home</span>
					</button>
				</div>
				
				{/* Visual Onboarding Summary */}
				<div className="card">
					<h3 className="text-lg font-semibold mb-3">How it works</h3>
					<div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-stretch">
						{/* Step 1 */}
						<div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-100">
							<div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2"><Wand2 size={18} /></div>
							<div className="text-sm font-semibold text-slate-800">Welcome</div>
							<div className="text-xs text-slate-500">Your personal meal planner</div>
						</div>

						{/* Step 2 */}
						<div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-pink-100">
							<div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-2"><ListChecks size={18} /></div>
							<div className="text-sm font-semibold text-slate-800">Pick Favorites</div>
							<div className="text-xs text-slate-500">Breakfast • Dal • Veg</div>
						</div>

						{/* Step 3 */}
						<div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
							<div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2"><CalendarDays size={18} /></div>
							<div className="text-sm font-semibold text-slate-800">7‑Day Menu</div>
							<div className="text-xs text-slate-500">Weekly & daily views</div>
						</div>

						{/* Step 4 */}
						<div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
							<div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2"><RefreshCcw size={18} /></div>
							<div className="text-sm font-semibold text-slate-800">Use & Share</div>
							<div className="text-xs text-slate-500">Regenerate meals • <span className="inline-flex items-center gap-1"><Download size={12}/> PDF</span></div>
						</div>
					</div>
				</div>

				{/* Tips */}
				<div className="card space-y-4 mt-4">
					<h2 className="text-xl font-semibold">Tips</h2>
					<div className="space-y-3 text-sm">
						<div className="flex items-start gap-3">
							<span className="text-blue-500 font-semibold">•</span>
							<p>Add more preferences for better variety</p>
						</div>
						<div className="flex items-start gap-3">
							<span className="text-blue-500 font-semibold">•</span>
							<p>Use "New Menu" button for fresh weekly menu</p>
						</div>
						<div className="flex items-start gap-3">
							<span className="text-purple-500 font-semibold">•</span>
							<p>Regenerate individual meals for specific days</p>
						</div>
						<div className="flex items-start gap-3">
							<span className="text-orange-500 font-semibold">•</span>
							<p>Download PDF to share or keep for reference</p>
						</div>
						<div className="flex items-start gap-3">
							<span className="text-green-500 font-semibold">•</span>
							<p>Change reminder time via Profile settings</p>
						</div>
						<div className="flex items-start gap-3">
							<span className="text-rose-500 font-semibold">•</span>
							<p>For concerns & feedback, please write to: <a href="mailto:hello@icurious.ai" className="text-blue-600 hover:underline">hello@icurious.ai</a> or <a href="mailto:inherentlycuriousai@gmail.com" className="text-blue-600 hover:underline">inherentlycuriousai@gmail.com</a></p>
						</div>
					</div>
				</div>
			</div>
		);
	}

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
			
			{/* Help card */}
			<div className="card mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-slate-800">Need Help?</h3>
						<p className="text-sm text-slate-600">Learn how to use the app and get useful tips</p>
					</div>
					<button 
						onClick={() => setShowHelp(true)}
						className="bg-indigo-500 text-white px-6 py-3 sm:py-3 py-2 rounded-xl font-semibold hover:bg-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
					>
						How to Use
					</button>
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
				
				{/* Help card */}
				<div className="card mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold text-slate-800">Need Help?</h3>
							<p className="text-sm text-slate-600">Learn how to use the app and get useful tips</p>
						</div>
						<button 
							onClick={() => setShowHelp(true)}
							className="bg-indigo-500 text-white px-6 py-3 sm:py-3 py-2 rounded-xl font-semibold hover:bg-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
						>
							How to Use
						</button>
					</div>
				</div>
				</div>
			)}

		</div>
	);
}


