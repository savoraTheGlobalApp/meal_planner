import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notifications';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { updateUserName } from '@/services/firebaseService';

export function Profile() {
    const { user, logout } = useAuthStore();
    const { scheduleTime, setScheduleTime } = useNotificationStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [time, setTime] = useState(scheduleTime || '20:00');
    const [menuOpen, setMenuOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [confirmLogout, setConfirmLogout] = useState(false);
	if (!user) return null;
	return (
		<div className="max-w-xl">
            <div className="card space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Profile</h2>
                    {/* Hamburger menu */}
                    <div className="relative">
                        <button className="btn btn-ghost" onClick={()=>setMenuOpen(v=>!v)} aria-label="Open menu">
                            <Menu />
                        </button>
                        {menuOpen && (
                            <>
                                {/* click-outside backdrop */}
                                <div className="fixed inset-0 z-10" onClick={()=>setMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20">
                                <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={async()=>{ setMenuOpen(false); setIsSettingsOpen(true); }}>Notification</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={()=>{ setMenuOpen(false); setEditOpen(true); }}>Edit Profile</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={()=>{ setMenuOpen(false); setConfirmLogout(true); }}>Log out</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
				<div>
					<div className="text-slate-300">Name</div>
					<div className="font-medium">{user.name}</div>
				</div>
				<div>
					<div className="text-slate-300">Email</div>
					<div className="font-medium">{user.email}</div>
				</div>
			</div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={()=>setIsSettingsOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Settings</h3>
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


