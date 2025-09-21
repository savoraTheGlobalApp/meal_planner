import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function DailyView() {
	const { dayIndex = '0' } = useParams();
	const i = Math.max(0, Math.min(6, parseInt(dayIndex))); 
	const prefs = usePrefStore(s => s.selected);
	const { week, generate, regenerateMeal } = useMenuStore();
	const navigate = useNavigate();

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
		<div className="space-y-4">
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
				<Link to="/menu/weekly" className="btn btn-outline">Weekly view</Link>
			</div>

			{/* Meals */}
			<div className="space-y-3">
				{/* Breakfast */}
				<div className="card bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-rose-600 text-sm font-semibold">Breakfast</div>
							<div className="text-lg font-medium text-slate-800">{day?.breakfast ?? '-'}</div>
						</div>
						<button 
							className="p-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 hover:text-rose-700 transition-all duration-200" 
							onClick={()=>regenerateMeal(i,'breakfast', prefs)} 
							title="Regenerate breakfast"
						>
							<RotateCcw size={16} />
						</button>
					</div>
				</div>

				{/* Lunch */}
				<div className="card bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-amber-600 text-sm font-semibold">Lunch</div>
							<div className="text-lg font-medium text-slate-800">{day?.lunch?.join(', ') ?? '-'}</div>
						</div>
						<button 
							className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-600 hover:text-amber-700 transition-all duration-200" 
							onClick={()=>regenerateMeal(i,'lunch', prefs)} 
							title="Regenerate lunch"
						>
							<RotateCcw size={16} />
						</button>
					</div>
				</div>

				{/* Dinner */}
				<div className="card bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-violet-600 text-sm font-semibold">Dinner</div>
							<div className="text-lg font-medium text-slate-800">{day?.dinner?.join(', ') ?? '-'}</div>
						</div>
						<button 
							className="p-2 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-600 hover:text-violet-700 transition-all duration-200" 
							onClick={()=>regenerateMeal(i,'dinner', prefs)} 
							title="Regenerate dinner"
						>
							<RotateCcw size={16} />
						</button>
					</div>
				</div>
			</div>

			{/* Navigation */}
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
	);
}


