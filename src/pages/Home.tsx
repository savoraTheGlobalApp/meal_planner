import { Link } from 'react-router-dom';
import { usePrefStore } from '@/store/preferences';

export function Home() {
	const selected = usePrefStore(s => s.selected);
	return (
		<div className="space-y-4">
			<div className="card">
				<h2 className="text-xl font-semibold">Tell your food choices</h2>
				<p className="text-slate-300">We will use your choices to generate a 7-day menu you can customize.</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Link to="/preferences/breakfast" className="btn btn-primary">Select preferences</Link>
					{(selected.breakfast.length + selected.dal.length + selected.veg.length + selected.salad.length) > 0 && (
						<>
							<Link to="/menu/weekly" className="btn btn-outline">Weekly view</Link>
							<Link to="/menu/daily/0" className="btn btn-outline">Daily view</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
}


