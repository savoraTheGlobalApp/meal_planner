import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Category, usePrefStore, initialItems } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';
import { X, Search } from 'lucide-react';

const order: Category[] = ['breakfast','dal','curry','veg'];
const nextLabel: Record<Category,string> = {
	breakfast: 'Select your Dal',
	dal: 'Select your Curry',
	curry: 'Select your Sabzi/Dry Dish',
	veg: 'Generate 7-day Menu',
}

export function PreferencesStep() {
	const { step } = useParams();
	const navigate = useNavigate();
	const cat = (order.includes(step as Category) ? (step as Category) : 'breakfast');
    const { available, selected, addCustom, removeCustom, toggleSelected, saveSelected, loading } = usePrefStore();
    const { week, generate } = useMenuStore();
    const [custom, setCustom] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

	const items = useMemo(() => available[cat].slice().sort((a,b)=>a.localeCompare(b)), [available, cat]);
	
	// Filter items based on search term
	const filteredItems = useMemo(() => {
		if (!searchTerm.trim()) return items;
		const term = searchTerm.toLowerCase();
		return items.filter(item => item.toLowerCase().includes(term));
	}, [items, searchTerm]);
	
	const isLast = cat === 'veg';
	const nextPath = isLast ? '/menu/weekly' : `/preferences/${order[order.indexOf(cat)+1]}`;
	
	// Check if menu already exists
	const hasMenu = week.length > 0;
	

	return (
		<div className="max-w-2xl space-y-4">
			<div className="card">
				<h2 className="text-xl font-semibold capitalize mb-2">Select your {cat === 'veg' ? 'Sabzi/Dry Dish' : cat === 'dal' ? 'Dal' : cat === 'curry' ? 'Curry' : 'Breakfast'} preferences</h2>
				<p className="text-slate-300">Tap to toggle. Add custom items if missing.</p>
				
				{/* Search Bar */}
				<div className="mt-4 relative">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
						<input 
							type="text" 
							placeholder={`Search ${cat === 'veg' ? 'sabzi/dry dish' : cat === 'dal' ? 'dal' : cat === 'curry' ? 'curry' : 'breakfast'} items...`}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							disabled={loading}
						/>
						{searchTerm && (
							<button
								onClick={() => setSearchTerm('')}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
								disabled={loading}
								aria-label="Clear search"
								title="Clear search"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>
					{searchTerm && (
						<p className="text-sm text-slate-500 mt-1">
							Showing {filteredItems.length} of {items.length} items
						</p>
					)}
				</div>
				
				<div className="mt-4 space-y-2 max-h-[50vh] overflow-auto pr-1">
					{filteredItems.length > 0 ? (
						filteredItems.map(item => {
							const checked = selected[cat].includes(item);
							const isCustomOnly = !initialItems[cat].includes(item);
							return (
								<label key={item} className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 cursor-pointer transition ${checked? getSelectedStyle(cat) : 'hover:bg-slate-100'}`}>
									<div className="flex items-center gap-3">
										<input type="checkbox" className={catClass(cat)} checked={checked} onChange={()=>toggleSelected(cat,item)} disabled={loading} />
										<span>{item}</span>
									</div>
									{isCustomOnly && (
										<button className="btn btn-ghost" onClick={(e)=>{e.preventDefault(); removeCustom(cat,item);}} aria-label={`Remove ${item}`} disabled={loading}>
											<X />
										</button>
									)}
								</label>
							);
						})
					) : searchTerm ? (
						<div className="text-center py-8 text-slate-500">
							<Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
							<p className="text-sm">No items found matching "{searchTerm}"</p>
							<p className="text-xs text-slate-400 mt-1">Try a different search term</p>
						</div>
					) : (
						<div className="text-center py-6 text-slate-500">
							<Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
							<p className="text-sm">No items available</p>
						</div>
					)}
				</div>
				<div className="mt-4 flex gap-2">
					<input className="input bg-white border-slate-300 text-slate-900 placeholder-slate-500" placeholder={`Add custom ${cat === 'veg' ? 'sabzi/dry dish' : cat === 'dal' ? 'dal' : cat === 'curry' ? 'curry' : cat}`} value={custom} onChange={(e)=>setCustom(e.target.value)} disabled={loading} />
					<button className="btn btn-outline" onClick={()=>{ if(custom.trim()){ addCustom(cat, custom); setCustom(''); } }} disabled={loading}>Add</button>
				</div>
            <div className="mt-6 flex justify-between gap-2">
                {hasMenu ? (
                    // If menu exists, show only Save button on the right
                    <div className="flex justify-end w-full">
                        <button 
                            onClick={async ()=>{ await saveSelected(); }}
                            disabled={loading}
                            className="btn btn-outline"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    // If no menu exists, show back button on left and navigation button on right
                    <>
                        {cat !== 'breakfast' ? (
                            <button 
                                onClick={()=>navigate(`/preferences/${order[order.indexOf(cat)-1]}`)}
                                className="btn btn-ghost"
                            >
                                Back
                            </button>
                        ) : (
                            <div />
                        )}
                        <button 
                            onClick={async ()=>{
                                await saveSelected();
                                if (isLast) {
                                    await generate(selected);
                                    navigate('/menu/weekly');
                                } else {
                                    navigate(nextPath);
                                }
                            }}
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {isLast 
                                ? 'Generate 7-Day Menu'
                                : nextLabel[cat]
                            }
                        </button>
                    </>
                )}
				</div>
			</div>
			<div className="flex items-center justify-end">
				<Link to="/home" className="btn btn-outline">Skip for now</Link>
			</div>
		</div>
	);
}


function catClass(cat: Category) {
	return cat === 'breakfast' ? 'accent-breakfast' : cat === 'dal' ? 'accent-dal' : cat === 'curry' ? 'accent-curry' : cat === 'veg' ? 'accent-veg' : 'accent-salad';
}

function getSelectedStyle(cat: Category) {
	switch(cat) {
		case 'breakfast': return 'bg-pink-100 border border-pink-300 text-pink-900';
		case 'dal': return 'bg-amber-100 border border-amber-300 text-amber-900';
		case 'curry': return 'bg-purple-100 border border-purple-300 text-purple-900';
		case 'veg': return 'bg-emerald-100 border border-emerald-300 text-emerald-900';
		default: return 'bg-slate-100 border border-slate-300 text-slate-900';
	}
}


