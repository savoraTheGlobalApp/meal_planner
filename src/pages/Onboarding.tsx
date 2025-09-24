import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Utensils } from 'lucide-react';
import appLogo from '/logo.png';

const onboardingScreens = [
  {
    id: 1,
    title: "Welcome to Your Personal Meal Planner",
    subtitle: "Transform your eating habits with smart meal planning",
    description: "Say goodbye to meal prep stress and hello to delicious, personalized nutrition plans tailored just for you.",
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    bgPattern: "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50",
    features: [
      "Personalized meal recommendations",
      "Dietary preference tracking",
      "7-day meal planning"
    ]
  },
  {
    id: 2,
    title: "Set Your Food Preferences",
    subtitle: "Tell us what you love to eat",
    description: "Choose from a variety of breakfast options, dals, and vegetables. We'll create the perfect meal plan based on your preferences.",
    gradient: "from-pink-400 via-rose-500 to-red-500",
    bgPattern: "bg-gradient-to-br from-pink-50 via-rose-50 to-red-50",
    features: [
      "Breakfast favorites selection",
      "Dal and curry preferences", 
      "Vegetable choices"
    ]
  },
  {
    id: 3,
    title: "Get Your Weekly Menu",
    subtitle: "Personalized meal plans in seconds",
    description: "Our smart system creates a complete 7-day meal plan with breakfast, lunch, and dinner options that match your taste.",
    gradient: "from-blue-400 via-indigo-500 to-purple-500",
    bgPattern: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
    features: [
      "Smart meal combinations",
      "Weekly overview planning",
      "Daily detailed breakdown"
    ]
  },
  {
    id: 4,
    title: "Enjoy Delicious Meals",
    subtitle: "From planning to plate",
    description: "Download your meal plan as PDF, regenerate individual meals, and never run out of meal ideas again.",
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    bgPattern: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
    features: [
      "PDF download functionality",
      "Individual meal regeneration",
      "Easy navigation between days"
    ]
  }
];

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

    if (isLeftSwipe && currentScreen < onboardingScreens.length - 1) {
      nextScreen();
    }
    if (isRightSwipe && currentScreen > 0) {
      prevScreen();
    }
    
    setIsSwipeActive(false);
  };

  const nextScreen = () => {
    if (currentScreen < onboardingScreens.length - 1) {
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

  const currentData = onboardingScreens[currentScreen];
  const isLastScreen = currentScreen === onboardingScreens.length - 1;

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
            {/* Content */}
            <div className={`text-center space-y-4 ${currentData.bgPattern} p-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm`}>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  {currentData.title}
                </h1>
                <h2 className="text-base font-semibold text-slate-600 mb-3">
                  {currentData.subtitle}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {currentData.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {currentData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-2">
          {onboardingScreens.map((_, index) => (
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
