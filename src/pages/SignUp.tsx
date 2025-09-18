import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function SignUp() {
	const navigate = useNavigate();
	const signUp = useAuthStore((s) => s.signUp);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		signUp({ name, email });
		navigate('/home');
	}

	return (
		<div className="container max-w-xl py-10">
			<div className="card">
				<h1 className="text-2xl font-bold mb-2">Welcome to Meal Planner</h1>
				<p className="text-slate-300 mb-6">Tell us what you usually eat and we will create a 7-day menu for you that you can customize anytime.</p>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label className="block mb-1">Name</label>
						<input className="input" value={name} onChange={(e)=>setName(e.target.value)} required />
					</div>
					<div>
						<label className="block mb-1">Email</label>
						<input type="email" className="input" value={email} onChange={(e)=>setEmail(e.target.value)} required />
					</div>
					<button className="btn btn-primary w-full" type="submit">Sign up</button>
				</form>
			</div>
		</div>
	);
}


