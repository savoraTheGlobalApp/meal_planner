import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Download } from 'lucide-react';
import { usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';
import { useAuthStore } from '@/store/auth';
import { generateMenuPDF } from '@/utils/pdfGenerator';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function WeeklyView() {
	const prefs = usePrefStore(s => s.selected);
	const { week, generate, regenerateMeal } = useMenuStore();
	const { user } = useAuthStore();
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	useEffect(() => {
		if (!week.length) generate(prefs);
	}, [week.length, generate, prefs]);

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
					<Link to="/menu/daily/0" className="btn btn-outline">Daily view</Link>
				</div>
			</div>
			<div className="overflow-x-auto">
				<div className="min-w-[720px] grid grid-cols-[120px_repeat(3,1fr)] gap-2 md:gap-4">
					<div></div>
					<div className="chip chip-rose">Breakfast</div>
					<div className="chip chip-amber">Lunch</div>
					<div className="chip chip-violet">Dinner</div>
					{days.map((d, i)=> (
						<>
							<div key={`day-${i}`} className="font-medium flex items-center">{d}</div>
							<div key={`b-${i}`} className="card flex items-center justify-between">
								<span className="text-sm md:text-base truncate pr-2">{week[i]?.breakfast ?? '-'}</span>
								<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'breakfast', prefs)} title="Regenerate breakfast">
									<RotateCcw size={16} />
								</button>
							</div>
							<div key={`l-${i}`} className="card flex items-center justify-between">
								<span className="text-sm md:text-base truncate pr-2">{week[i]?.lunch?.join(', ') ?? '-'}</span>
								<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'lunch', prefs)} title="Regenerate lunch">
									<RotateCcw size={16} />
								</button>
							</div>
							<div key={`d-${i}`} className="card flex items-center justify-between">
								<span className="text-sm md:text-base truncate pr-2">{week[i]?.dinner?.join(', ') ?? '-'}</span>
								<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'dinner', prefs)} title="Regenerate dinner">
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


