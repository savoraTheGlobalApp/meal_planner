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

	useEffect(() => {
		if (!week.length) generate(prefs);
	}, [week.length, generate, prefs]);

	const day = week[i];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">{days[i]}</h2>
				<Link to="/menu/weekly" className="btn btn-outline">Weekly view</Link>
			</div>
			<div className="space-y-3">
				<div className="card flex items-center justify-between card-gradient">
					<div>
						<div className="text-slate-300 text-sm">Breakfast</div>
						<div className="text-lg font-medium">{day?.breakfast ?? '-'}</div>
					</div>
					<button className="regen" onClick={()=>regenerateMeal(i,'breakfast', prefs)} title="Regenerate breakfast">
						<RotateCcw size={16} />
					</button>
				</div>
				<div className="card flex items-center justify-between card-gradient">
					<div>
						<div className="text-slate-300 text-sm">Lunch</div>
						<div className="text-lg font-medium">{day?.lunch?.join(', ') ?? '-'}</div>
					</div>
					<button className="regen" onClick={()=>regenerateMeal(i,'lunch', prefs)} title="Regenerate lunch">
						<RotateCcw size={16} />
					</button>
				</div>
				<div className="card flex items-center justify-between card-gradient">
					<div>
						<div className="text-slate-300 text-sm">Dinner</div>
						<div className="text-lg font-medium">{day?.dinner?.join(', ') ?? '-'}</div>
					</div>
					<button className="regen" onClick={()=>regenerateMeal(i,'dinner', prefs)} title="Regenerate dinner">
						<RotateCcw size={16} />
					</button>
				</div>
			</div>
			<div className="flex justify-between">
				<button className="btn btn-outline" onClick={()=>navigate(`/menu/daily/${(i+6)%7}`)}>Prev</button>
				<button className="btn btn-primary" onClick={()=>navigate(`/menu/daily/${(i+1)%7}`)}>Next</button>
			</div>
		</div>
	);
}


