import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Wand2, ListChecks, CalendarDays, RefreshCcw, Download } from 'lucide-react';
import appLogo from '/logo.png';

// We will render visual cards that mirror the Profile's "How it works" subcards
const TOTAL_SCREENS = 4;

export function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  useEffect(() => {
    console.log('Onboarding: Component mounted');
    setIsLoaded(true);
  }, []);

  // Minimum distance for swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipeActive(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentScreen < TOTAL_SCREENS - 1) {
      nextScreen();
    }
    if (isRightSwipe && currentScreen > 0) {
      prevScreen();
    }
    
    setIsSwipeActive(false);
  };

  const nextScreen = () => {
    if (currentScreen < TOTAL_SCREENS - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentScreen(currentScreen + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentScreen(currentScreen - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goToScreen = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentScreen(index);
      setIsAnimating(false);
    }, 150);
  };

  const isLastScreen = currentScreen === TOTAL_SCREENS - 1;

  const renderScreen = (index: number) => {
    if (index === 0) {
      return (
        <div className="relative overflow-hidden text-center p-10 md:p-12 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm bg-gradient-to-br from-yellow-50 to-orange-50 min-h-[280px] md:min-h-[320px] flex items-center justify-center">
          {/* Decorative ring */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-200/40 blur-2xl"></div>
          <div className="flex flex-col items-center text-center relative">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3 shadow-sm">
              <img src={appLogo} alt="Meal Planner" className="w-10 h-10 rounded" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome</h1>
            <p className="text-base text-slate-600 mb-4">Your personal meal planner</p>
            {/* Visual chips */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-1">
              <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-orange-700 border border-orange-200">Stress‑free planning</span>
              <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-orange-700 border border-orange-200">Easy to use</span>
            </div>
          </div>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="relative overflow-hidden text-center p-10 md:p-12 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm bg-gradient-to-br from-rose-50 to-pink-50 min-h-[280px] md:min-h-[320px] flex items-center justify-center">
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-pink-200/40 blur-2xl"></div>
          <div className="flex flex-col items-center text-center relative">
            <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-3 shadow-sm"><ListChecks size={28} /></div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Pick Favorites</h1>
            <p className="text-base text-slate-600 mb-4">Breakfast • Dal • Veg</p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-rose-700 border border-rose-200">Choose from built‑in list</span>
              <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-rose-700 border border-rose-200">Add your own items</span>
            </div>
          </div>
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="relative overflow-hidden text-center p-10 md:p-12 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm bg-gradient-to-br from-indigo-50 to-purple-50 min-h-[280px] md:min-h-[320px] flex items-center justify-center">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-indigo-200/30 blur-2xl"></div>
          <div className="flex flex-col items-center text-center relative">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-sm"><CalendarDays size={28} /></div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Next 7‑Day Menu</h1>
            <p className="text-base text-slate-600 mb-4">Weekly & daily views</p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-indigo-700 border border-indigo-200">No consecutive repeats</span>
              <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-indigo-700 border border-indigo-200">Daily reminders</span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="relative overflow-hidden text-center p-12 md:p-14 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm bg-gradient-to-br from-emerald-50 to-teal-50 min-h-[320px] md:min-h-[380px] flex items-center justify-center">
        <div className="absolute -bottom-10 right-0 w-44 h-44 rounded-full bg-emerald-200/40 blur-2xl"></div>
        <div className="flex flex-col items-center text-center relative">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-sm"><RefreshCcw size={28} /></div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Use & Share</h1>
          <p className="text-base text-slate-600 mb-4">Regenerate meals • <span className="inline-flex items-center gap-1"><Download size={14}/> PDF</span></p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-1">
            <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-emerald-700 border border-emerald-200">Change anytime</span>
            <span className="px-3.5 py-1.5 rounded-full text-sm bg-white/80 text-emerald-700 border border-emerald-200">Share easily</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent">
            <img src={appLogo} alt="Meal Planner" className="w-6 h-6 rounded" />
            Meal Planner
          </div>
          <Link 
            to="/signup" 
            className="text-slate-600 hover:text-slate-800 font-medium transition-colors hover:scale-105"
          >
            Skip
          </Link>
        </div>
      </div>

      {/* Main Content - with proper spacing for fixed header and footer */}
      <div className="flex-1 flex flex-col pt-16 pb-20">
        {/* Screen Content */}
        <div 
          className="flex-1 flex items-center justify-center px-4 py-4 select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={`w-full max-w-sm transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'} ${isSwipeActive ? 'cursor-grabbing' : 'cursor-grab'}`}>
            {renderScreen(currentScreen)}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-2">
          {[...Array(TOTAL_SCREENS)].map((_, index) => (
            <button
              key={index}
              onClick={() => goToScreen(index)}
              title={`Go to step ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-500 hover:scale-125 ${
                index === currentScreen 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 scale-125 shadow-lg' 
                  : 'bg-slate-300 hover:bg-slate-400 hover:shadow-md'
              }`}
            />
          ))}
        </div>
        
        {/* Swipe hint */}
        <div className="text-center mb-2">
          <p className="text-xs text-slate-400">
            Swipe left or right to navigate
          </p>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-slate-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={prevScreen}
            disabled={currentScreen === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
              currentScreen === 0 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 hover:scale-105'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {isLastScreen ? (
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={nextScreen}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
