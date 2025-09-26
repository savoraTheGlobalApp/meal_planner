import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notifications';
import { useState, useEffect } from 'react';
import { updateUserName, saveUserFeedback, getUserFeedbackCount } from '@/services/firebaseService';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Menu as MenuIcon, Wand2, ListChecks, CalendarDays, RefreshCcw, Download, MessageSquare, Star } from 'lucide-react';

export function Profile() {
	const { user, logout } = useAuthStore();
    const { scheduleTime, setScheduleTime } = useNotificationStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [time, setTime] = useState(scheduleTime || '20:00');
    const [editOpen, setEditOpen] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [feedbackData, setFeedbackData] = useState({
        menuSatisfaction: 0,
        foodOptionsSatisfaction: 0,
        userExperience: 0,
        overallUsefulness: 0,
        message: ''
    });
    const [feedbackCount, setFeedbackCount] = useState(0);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
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

    // Load feedback count when component mounts
    useEffect(() => {
        const loadFeedbackCount = async () => {
            if (user) {
                const { count } = await getUserFeedbackCount(user.id);
                setFeedbackCount(count);
            }
        };
        loadFeedbackCount();
    }, [user]);

    // Handle feedback submission
    const handleFeedbackSubmit = async () => {
        if (!user) return;
        
        setFeedbackLoading(true);
        try {
            const { error } = await saveUserFeedback(user.id, feedbackData);
            if (error) {
                alert(error); // Show error message to user
                setFeedbackLoading(false);
                return;
            }
            
            setFeedbackCount(prev => prev + 1);
            setShowFeedback(false);
            setShowThankYou(true);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setFeedbackLoading(false);
        }
    };
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
                            <p>Add more preferences for better variety</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-500 font-semibold">•</span>
                            <p>Use "New Menu" button for fresh weekly menu</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-purple-500 font-semibold">•</span>
                            <p>Regenerate individual meals for specific days</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-orange-500 font-semibold">•</span>
                            <p>Download PDF to share or keep for reference</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-500 font-semibold">•</span>
                            <p>Change reminder time via Profile settings</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-rose-500 font-semibold">•</span>
                            <p>For concerns & feedback, please write to: <a href="mailto:hello@icurious.ai" className="text-blue-600 hover:underline">hello@icurious.ai</a> or <a href="mailto:inherentlycuriousai@gmail.com" className="text-blue-600 hover:underline">inherentlycuriousai@gmail.com</a></p>
				</div>
				</div>
			</div>
            </div>
		);
    }

    // Show feedback form if toggled
    if (showFeedback) {
	return (
		<div className="max-w-xl">
                <div className="flex items-center gap-3 mb-6">
                    <button 
                        onClick={() => { setShowFeedback(false); navigate('/profile'); }}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Profile</span>
                    </button>
                </div>
                
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Share Your Feedback</h3>
                    <p className="text-slate-600 text-sm mb-2">Help us improve your meal planning experience</p>
                    <p className="text-slate-500 text-xs mb-6">
                        You can submit up to 5 feedbacks. You have submitted {feedbackCount}/5 feedbacks.
                    </p>
                    
                    <div className="space-y-6">
                        {/* Question 1 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                How satisfactory is your Menu?
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setFeedbackData(prev => ({ ...prev, menuSatisfaction: rating }))}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                            feedbackData.menuSatisfaction === rating
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question 2 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                How satisfactory are the default food item options?
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setFeedbackData(prev => ({ ...prev, foodOptionsSatisfaction: rating }))}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                            feedbackData.foodOptionsSatisfaction === rating
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question 3 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                How seamless is the user experience?
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setFeedbackData(prev => ({ ...prev, userExperience: rating }))}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                            feedbackData.userExperience === rating
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question 4 */}
				<div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                How useful is the app overall?
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setFeedbackData(prev => ({ ...prev, overallUsefulness: rating }))}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                            feedbackData.overallUsefulness === rating
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
				</div>

                        {/* Optional message */}
				<div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Additional feedback (optional)
                            </label>
                            <textarea
                                value={feedbackData.message}
                                onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Share any additional thoughts or suggestions..."
                                className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {feedbackData.message.length}/500 characters
                            </p>
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleFeedbackSubmit}
                                disabled={feedbackLoading || feedbackCount >= 5}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                                    feedbackCount >= 5 
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                        : feedbackLoading
                                        ? 'bg-blue-400 text-white cursor-wait'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                {feedbackLoading ? 'Submitting...' : feedbackCount >= 5 ? 'Limit Reached' : 'Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show thank you page if toggled
    if (showThankYou) {
        return (
            <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-6">
                    <button 
                        onClick={() => { setShowThankYou(false); navigate('/profile'); }}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Profile</span>
                    </button>
                </div>
                
                <div className="card text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Thank you, {user.name.split(' ')[0]}!
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Your feedback helps us make the app better for everyone.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-500">
                            We appreciate you taking the time to share your thoughts with us.
                        </p>
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

            {/* Feedback card */}
            <div className="card mt-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <MessageSquare size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Share Feedback</h3>
                            <p className="text-sm text-slate-600">
                                {feedbackCount >= 5 
                                    ? 'Thank you for your feedback!' 
                                    : `Help us improve your experience (${feedbackCount}/5)`
                                }
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowFeedback(true)}
                        disabled={feedbackCount >= 5}
                        className={`px-6 py-3 sm:py-3 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                            feedbackCount >= 5 
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                    >
                        {feedbackCount >= 5 ? 'Limit Reached' : 'Give Feedback'}
                    </button>
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


