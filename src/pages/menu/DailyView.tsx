import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';
import { sumNutrition, formatNutrition, sumNutritionWithUnknown } from '@/utils/nutrition';
import { NutritionDisplay } from '@/components/NutritionDisplay';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function DailyView() {
	const { dayIndex = '0' } = useParams();
	const i = Math.max(0, Math.min(6, parseInt(dayIndex))); 
	const prefs = usePrefStore(s => s.selected);
	const { week, generate, regenerateMeal, regeneratingMeal } = useMenuStore();
	const navigate = useNavigate();
	const [infoOpen, setInfoOpen] = useState(false);
	const infoWrapperRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClose = (e: Event) => {
			if (!infoWrapperRef.current) return;
			if (!infoWrapperRef.current.contains(e.target as Node)) {
				setInfoOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClose);
		document.addEventListener('touchstart', handleClose, { passive: true });
		return () => {
			document.removeEventListener('mousedown', handleClose);
			document.removeEventListener('touchstart', handleClose as any);
		};
	}, []);

	// Get today's date and calculate the date for the current day
	const today = new Date();
	const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday=0 to Sunday=6
	
	// Calculate the date for the current day index
	const getDateForDayIndex = (dayIndex: number) => {
		const date = new Date(today);
		const daysFromToday = dayIndex - todayIndex;
		
		// If the day is in the past (before today), add 7 days to get next week's date
		if (daysFromToday < 0) {
			date.setDate(today.getDate() + daysFromToday + 7);
		} else {
			date.setDate(today.getDate() + daysFromToday);
		}
		
		return date;
	};

	const currentDate = getDateForDayIndex(i);
	const isToday = i === todayIndex;

	useEffect(() => {
		if (!week.length) generate(prefs);
	}, [week.length, generate, prefs]);

	const day = week[i];

	return (
		<div className="space-y-4 pb-28 md:pb-0">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className={`text-xl font-semibold ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
						{days[i]}
					</h2>
					<p className="text-sm text-slate-500">
						{currentDate.getDate()}/{currentDate.getMonth() + 1}
						{isToday && <span className="ml-2 text-blue-600 font-medium">(Today)</span>}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{/* Global nutrition info */}
					<div className="relative" ref={infoWrapperRef}>
						<button
							className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200 text-sm font-semibold"
							onClick={() => setInfoOpen(prev => !prev)}
							title="Nutrition information"
						>
							ⓘ
						</button>
						{infoOpen && (
							<div className="fixed top-32 left-1/2 -translate-x-1/2 w-72 max-w-[90vw] bg-slate-800 text-white text-xs rounded-lg p-3 shadow-lg z-50">
								<div className="font-medium mb-1 text-center">Nutrition Data Notice</div>
								<p className="text-slate-300 leading-relaxed text-center">We're constantly expanding our nutrition database. The values shown are for items with available data.</p>
								<div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-slate-800"></div>
							</div>
						)}
					</div>
					<Link to="/menu/weekly" className="btn btn-outline">Weekly view</Link>
                </div>
			</div>

			{/* Meals */}
			<div className="space-y-3">
				{/* Breakfast */}
                <div className="card bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-rose-600 text-sm font-semibold">Breakfast</div>
                            <div className="text-lg font-medium text-slate-800">{day?.breakfast ?? '-'}</div>
                            {day?.breakfast && (() => {
                                const { total, unknown } = sumNutritionWithUnknown([day.breakfast]);
                                return (
                                    <NutritionDisplay total={total} unknown={unknown} className="mt-1" showInfoIcon={false} />
                                );
                            })()}
						</div>
						<button 
							className="p-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 hover:text-rose-700 transition-all duration-200 disabled:opacity-50" 
							onClick={()=>regenerateMeal(i,'breakfast', prefs)} 
							title="Regenerate breakfast"
							disabled={regeneratingMeal !== null}
						>
							{regeneratingMeal === `${i}-breakfast` ? (
								<svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							) : (
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							)}
						</button>
					</div>
				</div>

				{/* Lunch */}
                <div className="card bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-amber-600 text-sm font-semibold">Lunch</div>
                            <div className="text-lg font-medium text-slate-800">{day?.lunch?.join(', ') ?? '-'}</div>
                            {day?.lunch && day.lunch.length > 0 && (() => {
                                const { total, unknown } = sumNutritionWithUnknown(day.lunch);
                                return (
                                    <NutritionDisplay total={total} unknown={unknown} className="mt-1" showInfoIcon={false} />
                                );
                            })()}
						</div>
						<button 
							className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-600 hover:text-amber-700 transition-all duration-200 disabled:opacity-50" 
							onClick={()=>regenerateMeal(i,'lunch', prefs)} 
							title="Regenerate lunch"
							disabled={regeneratingMeal !== null}
						>
							{regeneratingMeal === `${i}-lunch` ? (
								<svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							) : (
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							)}
						</button>
					</div>
				</div>

				{/* Dinner */}
                <div className="card bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-violet-600 text-sm font-semibold">Dinner</div>
                            <div className="text-lg font-medium text-slate-800">{day?.dinner?.join(', ') ?? '-'}</div>
                            {day?.dinner && day.dinner.length > 0 && (() => {
                                const { total, unknown } = sumNutritionWithUnknown(day.dinner);
                                return (
                                    <NutritionDisplay total={total} unknown={unknown} className="mt-1" showInfoIcon={false} />
                                );
                            })()}
						</div>
						<button 
							className="p-2 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-600 hover:text-violet-700 transition-all duration-200 disabled:opacity-50" 
							onClick={()=>regenerateMeal(i,'dinner', prefs)} 
							title="Regenerate dinner"
							disabled={regeneratingMeal !== null}
						>
							{regeneratingMeal === `${i}-dinner` ? (
								<svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							) : (
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

		{/* Navigation */}
		{/* Desktop/Tablet inline nav */}
		<div className="hidden md:flex justify-between">
			<button 
				className="btn btn-outline flex items-center gap-2" 
				onClick={()=>navigate(`/menu/daily/${(i+6)%7}`)}
			>
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
				Prev
			</button>
			<button 
				className="btn btn-primary flex items-center gap-2" 
				onClick={()=>navigate(`/menu/daily/${(i+1)%7}`)}
			>
				Next
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
		{/* Mobile fixed nav above bottom bar */}
		<div className="md:hidden fixed inset-x-0 bottom-16 px-4 z-40">
			<div className="flex justify-between">
				<button 
					className="btn btn-outline flex items-center gap-2" 
					onClick={()=>navigate(`/menu/daily/${(i+6)%7}`)}
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Prev
				</button>
				<button 
					className="btn btn-primary flex items-center gap-2" 
					onClick={()=>navigate(`/menu/daily/${(i+1)%7}`)}
				>
					Next
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
		</div>
	);
}


