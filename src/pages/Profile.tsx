import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notifications';
import { useState } from 'react';
import { updateUserName } from '@/services/firebaseService';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Menu as MenuIcon, Wand2, ListChecks, CalendarDays, RefreshCcw, Download } from 'lucide-react';

export function Profile() {
	const { user, logout } = useAuthStore();
    const { scheduleTime, setScheduleTime } = useNotificationStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [time, setTime] = useState(scheduleTime || '20:00');
    const [editOpen, setEditOpen] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [params] = useSearchParams();
    const navigate = useNavigate();

    // Open modals based on query param provided by header hamburger
    const modal = params.get('modal');
    const help = params.get('help');
    
    if (modal === 'notification' && !isSettingsOpen) {
        setTimeout(() => {
            setIsSettingsOpen(true);
            navigate('/profile', { replace: true });
        }, 0);
    }
    if (modal === 'edit' && !editOpen) {
        setTimeout(() => {
            setEditOpen(true);
            navigate('/profile', { replace: true });
        }, 0);
    }
    if (modal === 'logout' && !confirmLogout) {
        setTimeout(() => {
            setConfirmLogout(true);
            navigate('/profile', { replace: true });
        }, 0);
    }
    if (help === 'true' && !showHelp) {
        setTimeout(() => {
            setShowHelp(true);
            navigate('/profile', { replace: true });
        }, 0);
    }
	if (!user) return null;

    // Show help section if toggled
    if (showHelp) {
	return (
		<div className="max-w-xl">
                <div className="flex items-center gap-3 mb-6">
                    <button 
                        onClick={() => { setShowHelp(false); navigate('/profile', { replace: true }); }}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Profile</span>
                    </button>
                </div>
                
                {/* Visual Onboarding Summary */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-3">How it works</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-stretch">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-100">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2"><Wand2 size={18} /></div>
                            <div className="text-sm font-semibold text-slate-800">Welcome</div>
                            <div className="text-xs text-slate-500">Your personal meal planner</div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-pink-100">
                            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-2"><ListChecks size={18} /></div>
                            <div className="text-sm font-semibold text-slate-800">Pick Favorites</div>
                            <div className="text-xs text-slate-500">Breakfast • Dal • Veg</div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2"><CalendarDays size={18} /></div>
                            <div className="text-sm font-semibold text-slate-800">7‑Day Menu</div>
                            <div className="text-xs text-slate-500">Weekly & daily views</div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2"><RefreshCcw size={18} /></div>
                            <div className="text-sm font-semibold text-slate-800">Use & Share</div>
                            <div className="text-xs text-slate-500">Regenerate meals • <span className="inline-flex items-center gap-1"><Download size={12}/> PDF</span></div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="card space-y-4 mt-4">
                    <h2 className="text-xl font-semibold">Tips</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-blue-500 font-semibold">•</span>
                            <p>If you see repeated meals on different days, consider adding more preferences to get better variety.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-500 font-semibold">•</span>
                            <p>You can change your daily reminder time from the hamburger icon in the upper right corner.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-500 font-semibold">•</span>
                            <p>Use the New Menu button present in weekly view to get a new menu for the same preferences.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-purple-500 font-semibold">•</span>
                            <p>Use the regenerate button on individual meals to get different options for specific days.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-orange-500 font-semibold">•</span>
                            <p>Download your weekly menu as PDF to share with family or keep for reference.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-rose-500 font-semibold">•</span>
                            <p>For any concern or feedback, please write to <a href="mailto:hello@icurious.ai" className="text-blue-600 hover:underline">hello@icurious.ai</a> or <a href="mailto:inherentlycuriousai@gmail.com" className="text-blue-600 hover:underline">inherentlycuriousai@gmail.com</a></p>
				</div>
				</div>
			</div>
            </div>
        );
    }

	return (
		<div className="max-w-xl">
            <div className="card space-y-6 -mt-2">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-800">Hey {user.name.split(' ')[0]}!</h2>
                        <p className="text-slate-500 text-sm">{user.email}</p>
                    </div>
                </div>
                <p className="text-slate-600 text-sm">Hope you’re enjoying your meals :)</p>
            </div>

            <div className="card mt-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                <div className="flex items-center gap-3 text-slate-700">
                    <div className="shrink-0 rounded-full bg-white p-2 shadow-sm">
                        <HelpCircle size={18} className="text-indigo-600" />
                    </div>
                    <p className="text-sm">
                        Check the Help button to see How it works and get some useful tips.
                    </p>
                </div>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={()=>setIsSettingsOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Notification Settings</h3>
                            <p className="text-slate-600 text-sm mt-1">Choose your daily notification time.</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label htmlFor="notif-time" className="text-sm font-medium text-slate-700">Notification time</label>
                                <input id="notif-time" type="time" value={time} onChange={e=>setTime(e.target.value)} className="input mt-1" aria-label="Notification time" />
                                <p className="text-xs text-slate-500 mt-1">Default is 20:00.</p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button className="btn btn-outline" onClick={()=>setIsSettingsOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={async ()=>{ await setScheduleTime(time); setIsSettingsOpen(false); }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={()=>setEditOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Edit Profile</h3>
                            <p className="text-slate-600 text-sm mt-1">Update your display name.</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-slate-700">Name</label>
                                <input id="name" className="input mt-1" value={name} onChange={e=>setName(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button className="btn btn-outline" onClick={()=>setEditOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={async ()=>{ if(name.trim()){ await updateUserName(user.id, name.trim()); useAuthStore.setState({ user: { ...user, name: name.trim() } }); } setEditOpen(false); }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation */}
            {confirmLogout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={()=>setConfirmLogout(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-rose-50 to-red-50 p-5 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Log out?</h3>
                            <p className="text-slate-600 text-sm mt-1">You will need to sign in again to continue.</p>
                        </div>
                        <div className="p-5 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                            <button className="btn btn-outline w-full sm:w-auto" onClick={()=>setConfirmLogout(false)}>No, stay</button>
                            <button className="btn btn-primary w-full sm:w-auto" onClick={async ()=>{ setConfirmLogout(false); await logout(); }}>Yes, log out</button>
                        </div>
                    </div>
                </div>
            )}
		</div>
	);
}


