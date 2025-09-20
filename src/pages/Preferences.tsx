import { usePrefStore } from '@/store/preferences';
import { Link } from 'react-router-dom';

export function Preferences() {
	const { selected, available } = usePrefStore();
	
	const categories = [
		{ key: 'breakfast' as const, label: 'Breakfast', color: 'rose', icon: '🌅' },
		{ key: 'dal' as const, label: 'Dal', color: 'amber', icon: '🫘' },
		{ key: 'veg' as const, label: 'Vegetables', color: 'emerald', icon: '🥬' },
		{ key: 'salad' as const, label: 'Salad & Fruits', color: 'violet', icon: '🥗' }
	];

	const totalSelected = Object.values(selected).flat().length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
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

			{/* Quick Edit Button */}
			<div className="card bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-slate-800 mb-1">Want to make changes?</h3>
						<p className="text-slate-600 text-sm">Update your food preferences anytime</p>
					</div>
					<Link 
						to="/preferences/breakfast" 
						className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit Preferences
					</Link>
				</div>
			</div>

			{/* Categories */}
			<div className="space-y-4">
				{categories.map(({ key, label, color, icon }) => {
					const selectedItems = selected[key];
					const availableItems = available[key];
					
					return (
						<div key={key} className="card">
							<div className="flex items-center gap-3 mb-4">
								<span className="text-2xl">{icon}</span>
								<div>
									<h3 className="text-lg font-semibold text-slate-800">{label}</h3>
									<p className="text-slate-600 text-sm">
										{selectedItems.length} of {availableItems.length} items selected
									</p>
								</div>
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

			{/* Summary Stats */}
			{totalSelected > 0 && (
				<div className="card bg-gradient-to-r from-emerald-50 to-teal-100 border-emerald-200">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-slate-800 mb-2">Preference Summary</h3>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							{categories.map(({ key, label, color, icon }) => (
								<div key={key} className="text-center">
									<div className="text-2xl mb-1">{icon}</div>
									<div className={`chip chip-${color} justify-center`}>
										{selected[key].length}
									</div>
									<p className="text-xs text-slate-600 mt-1">{label}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
