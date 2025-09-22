import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';
import { useAuthStore } from '@/store/auth';
import { generateMenuPDF } from '@/utils/pdfGenerator';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function WeeklyView() {
	const prefs = usePrefStore(s => s.selected);
	const { week, generate, regenerateMeal, loading } = useMenuStore();
	const { user } = useAuthStore();
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	// No need for generation tracking - menu only generates on manual button click

	// Get today's date and calculate week dates
	const today = new Date();
	const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday=0 to Sunday=6
	
	// Create array of dates starting from today
	const getWeekDates = () => {
		const dates = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(today);
			date.setDate(today.getDate() + i);
			dates.push(date);
		}
		return dates;
	};

	const weekDates = getWeekDates();
	
	// Reorder days to start with today
	const getOrderedDays = () => {
		const orderedDays = [];
		const orderedDates = [];
		const orderedWeek = [];
		
		for (let i = 0; i < 7; i++) {
			const dayIndex = (todayIndex + i) % 7;
			orderedDays.push(days[dayIndex]);
			orderedDates.push(weekDates[i]);
			orderedWeek.push(week[dayIndex]);
		}
		
		return { orderedDays, orderedDates, orderedWeek };
	};

	const { orderedDays, orderedDates, orderedWeek } = getOrderedDays();

	// Check if user has preferences set
	const hasPreferences = prefs.breakfast.length > 0 || prefs.dal.length > 0 || prefs.veg.length > 0;

	const handleDownloadPDF = async () => {
		if (!week.length) return;
		
		setIsGeneratingPDF(true);
		try {
			await generateMenuPDF(week, user?.name || 'User');
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Failed to generate PDF. Please try again.');
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
				<h2 className="text-xl font-semibold">Weekly Menu</h2>
				<div className="flex flex-wrap gap-2">
					<button 
						onClick={handleDownloadPDF}
						disabled={isGeneratingPDF || !week.length}
						className="btn btn-primary flex items-center gap-2"
					>
						<Download size={16} />
						{isGeneratingPDF ? 'Generating...' : 'Download PDF'}
					</button>
					<Link to={`/menu/daily/${todayIndex}`} className="btn btn-outline">Daily view</Link>
				</div>
			</div>


			{/* Desktop/Tablet View - Grid Layout */}
			<div className="hidden lg:block">
				<div className="grid grid-cols-[100px_1fr_1fr_1fr] gap-3">
					{/* Header Row */}
					<div></div>
					<div className="chip chip-rose text-center">Breakfast</div>
					<div className="chip chip-amber text-center">Lunch</div>
					<div className="chip chip-violet text-center">Dinner</div>
					
					{/* Data Rows */}
					{orderedDays.map((dayName, i) => {
						const originalIndex = days.indexOf(dayName);
						const date = orderedDates[i];
						const isToday = i === 0;
						
						return (
							<>
								<div key={`day-${i}`} className={`font-semibold flex flex-col py-2 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
									<span>{dayName}</span>
									<span className="text-xs text-slate-500">
										{date.getDate()}/{date.getMonth() + 1}
										{isToday && <span className="ml-1 text-blue-600 font-medium">(Today)</span>}
									</span>
								</div>
								<div key={`b-${i}`} className={`card-compact ${isToday ? 'ring-2 ring-blue-200' : ''}`}>
									<div className="flex items-center justify-between">
										<span className="text-sm truncate pr-2">{orderedWeek[i]?.breakfast ?? '-'}</span>
										<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(originalIndex,'breakfast', prefs)} title="Regenerate breakfast">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
										</button>
									</div>
								</div>
								<div key={`l-${i}`} className={`card-compact ${isToday ? 'ring-2 ring-blue-200' : ''}`}>
									<div className="flex items-center justify-between">
										<span className="text-sm truncate pr-2">{orderedWeek[i]?.lunch?.join(', ') ?? '-'}</span>
										<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(originalIndex,'lunch', prefs)} title="Regenerate lunch">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
										</button>
									</div>
								</div>
								<div key={`d-${i}`} className={`card-compact ${isToday ? 'ring-2 ring-blue-200' : ''}`}>
									<div className="flex items-center justify-between">
										<span className="text-sm truncate pr-2">{orderedWeek[i]?.dinner?.join(', ') ?? '-'}</span>
										<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(originalIndex,'dinner', prefs)} title="Regenerate dinner">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
										</button>
									</div>
								</div>
							</>
						);
					})}
				</div>
			</div>

			{/* Mobile/Tablet View - Card Layout */}
			<div className="lg:hidden space-y-4">
				{orderedDays.map((dayName, i) => {
					const originalIndex = days.indexOf(dayName);
					const date = orderedDates[i];
					const isToday = i === 0;
					
					return (
						<div key={dayName} className={`card ${isToday ? 'ring-2 ring-blue-200 bg-blue-50' : ''}`}>
							<div className="flex items-center justify-between mb-4">
								<div>
									<h3 className={`font-semibold text-lg ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
										{dayName}
									</h3>
									<p className="text-sm text-slate-500">{date.getDate()}/{date.getMonth() + 1}</p>
								</div>
								<Link to={`/menu/daily/${originalIndex}`} className="text-sm text-brand hover:underline font-medium">
									View Details
								</Link>
							</div>
						
						<div className="space-y-3">
							{/* Breakfast */}
							<div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
								<div className="mb-2">
									<span className="text-sm font-semibold text-slate-700">Breakfast</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 leading-relaxed">{orderedWeek[i]?.breakfast ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(originalIndex,'breakfast', prefs)} title="Regenerate breakfast">
										<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
										</svg>
									</button>
								</div>
							</div>

							{/* Lunch */}
							<div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
								<div className="mb-2">
									<span className="text-sm font-semibold text-slate-700">Lunch</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 leading-relaxed">{orderedWeek[i]?.lunch?.join(', ') ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(originalIndex,'lunch', prefs)} title="Regenerate lunch">
										<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
										</svg>
									</button>
								</div>
							</div>

							{/* Dinner */}
							<div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
								<div className="mb-2">
									<span className="text-sm font-semibold text-slate-700">Dinner</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 leading-relaxed">{orderedWeek[i]?.dinner?.join(', ') ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(originalIndex,'dinner', prefs)} title="Regenerate dinner">
										<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
					);
				})}
			</div>

			{/* Regenerate Menu Card - Show at bottom when preferences are set */}
			{hasPreferences && (
				<div className="card bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
					<div className="text-center py-6">
						<h3 className="text-lg font-semibold text-slate-800 mb-2">
							{week.length > 0 ? 'Try a different menu?' : 'Generate 7-Day Menu'}
						</h3>
						<p className="text-slate-600 mb-4">
							{week.length > 0 
								? 'Get new meal combinations with your preferences.'
								: 'Your preferences are set! Click below to generate your personalized 7-day meal plan.'
							}
						</p>
						<button 
							onClick={() => {
								console.log('Generate Menu button clicked');
								console.log('Current preferences:', prefs);
								generate(prefs);
							}}
							disabled={loading}
							className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							{loading ? 'Generating...' : (week.length > 0 ? 'Regenerate Menu' : 'Generate 7-Day Menu')}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}