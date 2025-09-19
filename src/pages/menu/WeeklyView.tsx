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

			{/* Desktop/Tablet View - Grid Layout */}
			<div className="hidden lg:block">
				<div className="grid grid-cols-[100px_1fr_1fr_1fr] gap-3">
					{/* Header Row */}
					<div></div>
					<div className="chip chip-rose text-center">Breakfast</div>
					<div className="chip chip-amber text-center">Lunch</div>
					<div className="chip chip-violet text-center">Dinner</div>
					
					{/* Data Rows */}
					{days.map((dayName, i) => (
						<>
							<div key={`day-${i}`} className="font-semibold text-slate-700 flex items-center py-2">
								{dayName}
							</div>
							<div key={`b-${i}`} className="card-compact">
								<div className="flex items-center justify-between">
									<span className="text-sm truncate pr-2">{week[i]?.breakfast ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'breakfast', prefs)} title="Regenerate breakfast">
										<RotateCcw size={14} />
									</button>
								</div>
							</div>
							<div key={`l-${i}`} className="card-compact">
								<div className="flex items-center justify-between">
									<span className="text-sm truncate pr-2">{week[i]?.lunch?.join(', ') ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'lunch', prefs)} title="Regenerate lunch">
										<RotateCcw size={14} />
									</button>
								</div>
							</div>
							<div key={`d-${i}`} className="card-compact">
								<div className="flex items-center justify-between">
									<span className="text-sm truncate pr-2">{week[i]?.dinner?.join(', ') ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'dinner', prefs)} title="Regenerate dinner">
										<RotateCcw size={14} />
									</button>
								</div>
							</div>
						</>
					))}
				</div>
			</div>

			{/* Mobile/Tablet View - Card Layout */}
			<div className="lg:hidden space-y-4">
				{days.map((dayName, i) => (
					<div key={dayName} className="card">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-semibold text-lg text-slate-800">{dayName}</h3>
							<Link to={`/menu/daily/${i}`} className="text-sm text-brand hover:underline font-medium">
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
									<span className="text-sm text-slate-600 leading-relaxed">{week[i]?.breakfast ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'breakfast', prefs)} title="Regenerate breakfast">
										<RotateCcw size={14} />
									</button>
								</div>
							</div>

							{/* Lunch */}
							<div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
								<div className="mb-2">
									<span className="text-sm font-semibold text-slate-700">Lunch</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 leading-relaxed">{week[i]?.lunch?.join(', ') ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'lunch', prefs)} title="Regenerate lunch">
										<RotateCcw size={14} />
									</button>
								</div>
							</div>

							{/* Dinner */}
							<div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
								<div className="mb-2">
									<span className="text-sm font-semibold text-slate-700">Dinner</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 leading-relaxed">{week[i]?.dinner?.join(', ') ?? '-'}</span>
									<button className="regen flex-shrink-0" onClick={()=>regenerateMeal(i,'dinner', prefs)} title="Regenerate dinner">
										<RotateCcw size={14} />
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}