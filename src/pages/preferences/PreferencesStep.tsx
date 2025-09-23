import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Category, usePrefStore } from '@/store/preferences';
import { useMenuStore } from '@/store/menu';
import { X } from 'lucide-react';

const order: Category[] = ['breakfast','dal','veg'];
const nextLabel: Record<Category,string> = {
	breakfast: 'Select your Dal',
	dal: 'Select your Vegetable',
	veg: 'Generate 7-day Menu',
}

export function PreferencesStep() {
	const { step } = useParams();
	const navigate = useNavigate();
	const cat = (order.includes(step as Category) ? (step as Category) : 'breakfast');
    const { available, selected, addCustom, removeCustom, toggleSelected, saveSelected, loading } = usePrefStore();
    const { week, generate } = useMenuStore();
    const [custom, setCustom] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

	const items = useMemo(() => available[cat].slice().sort((a,b)=>a.localeCompare(b)), [available, cat]);
	const isLast = cat === 'veg';
	const nextPath = isLast ? '/menu/weekly' : `/preferences/${order[order.indexOf(cat)+1]}`;
	
	// Check if menu already exists
	const hasMenu = week.length > 0;
	
	// Handle the final button click (generate/regenerate menu)
    const handleFinalButtonClick = async () => {
        if (isLast) {
            if (week.length === 0) {
                await generate(selected);
                navigate('/menu/weekly');
                return;
            }
            setShowConfirm(true);
        } else {
            navigate(nextPath);
        }
    };

	return (
		<div className="max-w-2xl space-y-4">
			<div className="card">
				<h2 className="text-xl font-semibold capitalize mb-2">Select your {cat === 'veg' ? 'Vegetables' : cat === 'dal' ? 'Dal' : 'Breakfast'} preferences</h2>
				<p className="text-slate-300">Tap to toggle. Add custom items if missing.</p>
				<div className="mt-4 space-y-2 max-h-[50vh] overflow-auto pr-1">
					{items.map(item => {
						const checked = selected[cat].includes(item);
						const isCustomOnly = !initialBuiltIn[cat].includes(item);
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
					})}
				</div>
				<div className="mt-4 flex gap-2">
					<input className="input bg-white border-slate-300 text-slate-900 placeholder-slate-500" placeholder={`Add custom ${cat === 'veg' ? 'vegetable' : cat}`} value={custom} onChange={(e)=>setCustom(e.target.value)} disabled={loading} />
					<button className="btn btn-outline" onClick={()=>{ if(custom.trim()){ addCustom(cat, custom); setCustom(''); } }} disabled={loading}>Add</button>
				</div>
            <div className="mt-6 flex justify-between gap-2">
                <button 
                    onClick={async ()=>{ await saveSelected(); }}
                    disabled={loading}
                    className="btn btn-outline"
                >
                    Save
                </button>
					<button 
						onClick={handleFinalButtonClick}
						disabled={loading}
						className="btn btn-primary"
					>
						{isLast 
							? (hasMenu ? 'Regenerate Menu' : 'Generate 7-Day Menu')
							: nextLabel[cat]
						}
					</button>
				</div>
            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={()=>setShowConfirm(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Regenerate menu?</h3>
                            <p className="text-slate-600 text-sm mt-1">This will replace your current 7-day menu with a new one.</p>
                        </div>
                        <div className="p-5 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                            <button className="btn btn-outline w-full sm:w-auto" onClick={()=>setShowConfirm(false)}>No, keep current</button>
                            <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto disabled:opacity-50" onClick={async ()=>{ setShowConfirm(false); await generate(selected); navigate('/menu/weekly'); }}>
                                Yes, regenerate
                            </button>
                        </div>
                    </div>
                </div>
            )}
			</div>
			<div className="flex items-center justify-between">
				{cat !== 'breakfast' ? (
					<button className="btn btn-ghost" onClick={()=>navigate(`/preferences/${order[order.indexOf(cat)-1]}`)}>Back</button>
				): <div />}
				<Link to="/home" className="btn btn-outline">Skip for now</Link>
			</div>
		</div>
	);
}

const initialBuiltIn: Record<Category, string[]> = {
	breakfast: ['Poha','Daliya','Upma','Aloo Paratha','Paneer Paratha','Gobhi Paratha','Masala Dosa','Idli Sambhar','Veg Sandwich','Cornflakes'],
	dal: ['Moong Dal','Masoor Dal','Chana Dal','Toor (Arhar) Dal','Urad Dal','Rajma','Chhole','Lobia'],
	veg: ['Potato','Paneer','Mushroom','Spinach','Cauliflower','Broccoli','Cabbage','Beans','Peas','Brinjal','Okra (Bhindi)','Capsicum','Bottle Gourd (Lauki)'],
};

function catClass(cat: Category) {
	return cat === 'breakfast' ? 'accent-breakfast' : cat === 'dal' ? 'accent-dal' : cat === 'veg' ? 'accent-veg' : 'accent-salad';
}

function getSelectedStyle(cat: Category) {
	switch(cat) {
		case 'breakfast': return 'bg-pink-100 border border-pink-300 text-pink-900';
		case 'dal': return 'bg-amber-100 border border-amber-300 text-amber-900';
		case 'veg': return 'bg-emerald-100 border border-emerald-300 text-emerald-900';
		default: return 'bg-slate-100 border border-slate-300 text-slate-900';
	}
}


