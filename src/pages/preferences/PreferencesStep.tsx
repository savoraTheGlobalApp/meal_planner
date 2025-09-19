import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Category, usePrefStore } from '@/store/preferences';
import { X } from 'lucide-react';

const order: Category[] = ['breakfast','dal','veg','salad'];
const nextLabel: Record<Category,string> = {
	breakfast: 'Click next to select your Dal',
	dal: 'Click next to select your Vegetable',
	veg: 'Click next to select your Fruits/Salad',
	salad: 'Generate 7-day Menu',
}

export function PreferencesStep() {
	const { step } = useParams();
	const navigate = useNavigate();
	const cat = (order.includes(step as Category) ? (step as Category) : 'breakfast');
	const { available, selected, addCustom, removeCustom, toggleSelected, loading } = usePrefStore();
	const [custom, setCustom] = useState('');

	const items = useMemo(() => available[cat].slice().sort((a,b)=>a.localeCompare(b)), [available, cat]);
	const isLast = cat === 'salad';
	const nextPath = isLast ? '/menu/weekly' : `/preferences/${order[order.indexOf(cat)+1]}`;

	return (
		<div className="max-w-2xl space-y-4">
			<div className="card">
				<h2 className="text-xl font-semibold capitalize mb-2">Select your {cat === 'veg' ? 'Vegetables' : cat === 'dal' ? 'Dal' : cat === 'salad' ? 'Fruits/Salad' : 'Breakfast'} preferences</h2>
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
				<div className="mt-6 flex justify-end">
					<Link to={nextPath} className="btn btn-primary">{nextLabel[cat]}</Link>
				</div>
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
	salad: ['Apple','Banana','Carrot','Beetroot','Papaya','Orange','Grapes','Mango','Pomegranate'],
};

function catClass(cat: Category) {
	return cat === 'breakfast' ? 'accent-breakfast' : cat === 'dal' ? 'accent-dal' : cat === 'veg' ? 'accent-veg' : 'accent-salad';
}

function getSelectedStyle(cat: Category) {
	switch(cat) {
		case 'breakfast': return 'bg-pink-100 border border-pink-300 text-pink-900';
		case 'dal': return 'bg-amber-100 border border-amber-300 text-amber-900';
		case 'veg': return 'bg-emerald-100 border border-emerald-300 text-emerald-900';
		case 'salad': return 'bg-violet-100 border border-violet-300 text-violet-900';
		default: return 'bg-slate-100 border border-slate-300 text-slate-900';
	}
}


