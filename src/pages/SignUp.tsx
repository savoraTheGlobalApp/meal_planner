import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { getFirebaseErrorMessage, extractFirebaseErrorCode } from '../utils/errorMessages';
import appLogo from '/logo.png';

export function SignUp() {
	const { signUp, loading, user } = useAuthStore();
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	// Redirect if user is already authenticated
	useEffect(() => {
		console.log('SignUp: User state changed:', user);
		if (user) {
			console.log('SignUp: User authenticated, redirecting to home');
			navigate('/home');
		}
	}, [user, navigate]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');

		if (!name || !email || !password) {
			setError('Please fill in all fields');
			return;
		}

		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}

		const result = await signUp({ name, email, password });
		
		if (!result.success) {
			const errorCode = extractFirebaseErrorCode(result.error || '');
			const userFriendlyMessage = getFirebaseErrorMessage(errorCode);
			setError(userFriendlyMessage);
		}
		// Navigation will be handled by useEffect when user state updates
	}

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<Link to="/" className="flex items-center justify-center gap-2 text-2xl font-bold bg-gradient-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent">
						<img src={appLogo} alt="Meal Planner" className="w-8 h-8 rounded" />
						Meal Planner
					</Link>
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						Create your account
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Already have an account?{' '}
						<Link to="/signin" className="font-medium text-brand hover:text-brand-dark">
							Sign in
						</Link>
					</p>
				</div>
				
				<form className="mt-8 space-y-6" onSubmit={onSubmit}>
					<div className="space-y-4">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700">
								Full Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="input mt-1"
								placeholder="Enter your full name"
							/>
						</div>
						
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="input mt-1"
								placeholder="Enter your email"
							/>
						</div>
						
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="input mt-1"
								placeholder="Create a password (min 6 characters)"
							/>
						</div>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-3">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary w-full"
						>
							{loading ? 'Creating account...' : 'Create account'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}


