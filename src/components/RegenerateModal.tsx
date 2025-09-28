import { useEffect, useRef } from 'react';
import { useMenuStore } from '@/store/menu';
import { usePrefStore } from '@/store/preferences';
import { X } from 'lucide-react';

export function RegenerateModal() {
	const { 
		showRegenerateModal, 
		regenerateModalData, 
		hideRegenerateModal, 
		regenerateMealComponent,
		regeneratingMeal,
		week
	} = useMenuStore();
	const prefs = usePrefStore(s => s.selected);
	const modalRef = useRef<HTMLDivElement>(null);

	// Close modal when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
				hideRegenerateModal();
			}
		};

		if (showRegenerateModal) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showRegenerateModal, hideRegenerateModal]);

	if (!showRegenerateModal || !regenerateModalData) return null;

	const { dayIndex, mealType } = regenerateModalData;
	
	// Get current meal from the store (updated after regeneration)
	const currentMeal = week[dayIndex]?.[mealType] || [];
	const [dal, veg] = currentMeal;

	const handleRegenerate = async (component: 'dal' | 'veg' | 'both') => {
		await regenerateMealComponent(dayIndex, mealType, component, prefs);
		// Modal stays open so user can keep regenerating
	};

	// Check if specific components are being regenerated
	const isRegeneratingDal = regeneratingMeal === `${dayIndex}-${mealType}-dal`;
	const isRegeneratingVeg = regeneratingMeal === `${dayIndex}-${mealType}-veg`;
	const isRegeneratingBoth = regeneratingMeal === `${dayIndex}-${mealType}-both`;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div 
				ref={modalRef}
				className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200"
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-slate-800">
						Regenerate {mealType === 'lunch' ? 'Lunch' : 'Dinner'}
					</h3>
					<button
						onClick={hideRegenerateModal}
						className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
						disabled={isRegeneratingDal || isRegeneratingVeg || isRegeneratingBoth}
						title="Close modal"
						aria-label="Close modal"
					>
						<X className="w-5 h-5 text-slate-500" />
					</button>
				</div>

				{/* Current meal display */}
				<div className="mb-6 p-4 bg-slate-50 rounded-lg">
					<h4 className="text-sm font-medium text-slate-700 mb-2">Current meal:</h4>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="text-sm text-slate-600">Dal/Curry:</span>
							<span className="text-sm font-medium text-slate-800">{dal}</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-slate-600">Sabzi/Dry Dish:</span>
							<span className="text-sm font-medium text-slate-800">{veg}</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-slate-600">Roti/Rice:</span>
							<span className="text-sm font-medium text-slate-800">Roti/Rice</span>
						</div>
					</div>
				</div>

				{/* Regeneration options */}
				<div className="space-y-3">
					<button
						onClick={() => handleRegenerate('dal')}
						disabled={isRegeneratingDal || isRegeneratingVeg || isRegeneratingBoth}
						className="w-full flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg className={`w-4 h-4 text-amber-600 ${isRegeneratingDal ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<div className="text-left">
							<div className="font-medium text-slate-800">Regenerate only Dal</div>
						</div>
					</button>

					<button
						onClick={() => handleRegenerate('veg')}
						disabled={isRegeneratingDal || isRegeneratingVeg || isRegeneratingBoth}
						className="w-full flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg className={`w-4 h-4 text-emerald-600 ${isRegeneratingVeg ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<div className="text-left">
							<div className="font-medium text-slate-800">Regenerate only Sabzi</div>
						</div>
					</button>

					<button
						onClick={() => handleRegenerate('both')}
						disabled={isRegeneratingDal || isRegeneratingVeg || isRegeneratingBoth}
						className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg className={`w-4 h-4 text-blue-600 ${isRegeneratingBoth ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<div className="text-left">
							<div className="font-medium text-slate-800">Regenerate both</div>
						</div>
					</button>
				</div>

				{/* Loading indicator - reserved space to prevent jumping */}
				<div className="mt-4 h-6 flex items-center justify-center">
					{(isRegeneratingDal || isRegeneratingVeg || isRegeneratingBoth) && (
						<div className="flex items-center gap-2 text-slate-600">
							<svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<span className="text-sm">Regenerating...</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
