import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/notifications';
import { ArrowLeft } from 'lucide-react';

export function Notifications() {
	const navigate = useNavigate();
	const { getLast7Days, markAllRead, init } = useNotificationStore();
	const items = getLast7Days();

	useEffect(() => {
		init();
		markAllRead();
	}, [init, markAllRead]);

	return (
		<div className="space-y-4">
			{/* Fixed page header */}
			<div className="glass sticky top-0 z-40 -mx-4 sm:mx-0">
				<div className="container h-14 flex items-center gap-3">
					<button onClick={() => navigate('/home')} className="btn btn-ghost px-2" title="Back to Home">
						<ArrowLeft className="w-5 h-5" />
					</button>
					<h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
				</div>
			</div>

			<div className="space-y-3 pt-2">
				{items.length === 0 ? (
					<div className="card">
						<p className="text-slate-600">No notifications in the last 7 days.</p>
					</div>
				) : (
					items.map(n => (
						<div key={n.id} className="card">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="font-semibold text-slate-800">{n.title}</h3>
									<p className="text-slate-600 text-sm mt-1">{n.body}</p>
								</div>
								<span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}


