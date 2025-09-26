import { usePrefStore } from '@/store/preferences';
import { Link } from 'react-router-dom';

export function Preferences() {
	const { selected, available } = usePrefStore();
	
	const categories = [
		{ key: 'breakfast' as const, label: 'Breakfast', color: 'rose', icon: '🌅' },
		{ key: 'dal' as const, label: 'Dal', color: 'amber', icon: '🍲' },
		{ key: 'curry' as const, label: 'Curry', color: 'purple', icon: '🍛' },
		{ key: 'veg' as const, label: 'Sabzi/Dry Dish', color: 'emerald', icon: '🍅' }
	];

	// Only count items from the current categories (excluding any old salad data)
	const totalSelected = categories.reduce((total, category) => {
		return total + (selected[category.key]?.length || 0);
	}, 0);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold text-slate-800">Your Preferences</h1>
						<p className="text-slate-600">
							{totalSelected > 0 
								? `${totalSelected} items selected across all categories`
								: 'No preferences selected yet'
							}
						</p>
					</div>
				</div>
			</div>

			{/* Summary Stats */}
			{totalSelected > 0 && (
				<div className="card bg-gradient-to-r from-emerald-50 to-teal-100 border-emerald-200">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-slate-800 mb-4">Preference Summary</h3>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							{categories.map(({ key, label, color, icon }) => {
								const colorMap: Record<string, { bg: string; ring: string; text: string; chip: string }> = {
									rose: { bg: 'bg-rose-50', ring: 'ring-rose-200', text: 'text-rose-600', chip: 'chip-rose' },
									amber: { bg: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-600', chip: 'chip-amber' },
									purple: { bg: 'bg-purple-50', ring: 'ring-purple-200', text: 'text-purple-600', chip: 'chip-purple' },
									emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-600', chip: 'chip-emerald' },
								};
								const c = colorMap[color];
								return (
									<div key={key} className="flex flex-col items-center">
										<div className={`w-12 h-12 rounded-full flex items-center justify-center ${c.bg} ${c.text} ring-1 ${c.ring} mb-2`}>
											<span className="text-xl">{icon}</span>
										</div>
										<div className={`chip ${c.chip} justify-center mb-1`}>{selected[key].length}</div>
										<p className="text-xs text-slate-600">{label}</p>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Categories */}
			<div className="space-y-4">
				{categories.map(({ key, label, color, icon }) => {
					const selectedItems = selected[key];
					const availableItems = available[key];
					
						// Colorful edit button per category
						const colorClasses: Record<string, string> = {
							rose: 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200',
							amber: 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200',
							purple: 'bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200',
							emerald: 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200',
						};
						const editBtnBase = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm';
						const editBtnClass = `${editBtnBase} ${colorClasses[color]}`;

						return (
							<div key={key} className="card">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<span className="text-2xl">{icon}</span>
										<div>
											<h3 className="text-lg font-semibold text-slate-800">{label}</h3>
											<p className="text-slate-600 text-sm">
												{selectedItems.length} of {availableItems.length} items selected
											</p>
										</div>
									</div>
									<Link 
										to={`/preferences/${key}`}
										className={editBtnClass}
									>
										Edit
									</Link>
								</div>

							{selectedItems.length > 0 ? (
								<div className="space-y-3">
									<div className="flex flex-wrap gap-2">
										{selectedItems.map((item) => (
											<span 
												key={item} 
												className={`chip chip-${color} flex items-center gap-2`}
											>
												{item}
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</span>
										))}
									</div>
								</div>
							) : (
								<div className="text-center py-6 text-slate-500">
									<svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									<p className="text-sm">No items selected in this category</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
