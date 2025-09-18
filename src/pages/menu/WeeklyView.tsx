import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function WeeklyView() {
	const prefs = usePrefStore(s => s.selected);
	const { week, generate, regenerateMeal } = useMenuStore();

	useEffect(() => {
		if (!week.length) generate(prefs);
	}, [week.length, generate, prefs]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Weekly Menu</h2>
				<Link to="/menu/daily/0" className="btn btn-outline">Daily view</Link>
			</div>
			<div className="overflow-x-auto">
				<div className="min-w-[720px] grid grid-cols-[120px_repeat(3,1fr)] gap-2">
					<div></div>
					<div className="chip chip-rose">Breakfast</div>
					<div className="chip chip-amber">Lunch</div>
					<div className="chip chip-violet">Dinner</div>
					{days.map((d, i)=> (
						<>
							<div key={`day-${i}`} className="font-medium flex items-center">{d}</div>
							<div key={`b-${i}`} className="card flex items-center justify-between">
								<span>{week[i]?.breakfast ?? '-'}</span>
								<button className="regen" onClick={()=>regenerateMeal(i,'breakfast', prefs)} title="Regenerate breakfast">
									<RotateCcw size={16} />
								</button>
							</div>
							<div key={`l-${i}`} className="card flex items-center justify-between">
								<span>{week[i]?.lunch?.join(', ') ?? '-'}</span>
								<button className="regen" onClick={()=>regenerateMeal(i,'lunch', prefs)} title="Regenerate lunch">
									<RotateCcw size={16} />
								</button>
							</div>
							<div key={`d-${i}`} className="card flex items-center justify-between">
								<span>{week[i]?.dinner?.join(', ') ?? '-'}</span>
								<button className="regen" onClick={()=>regenerateMeal(i,'dinner', prefs)} title="Regenerate dinner">
									<RotateCcw size={16} />
								</button>
							</div>
						</>
					))}
				</div>
			</div>
		</div>
	);
}


