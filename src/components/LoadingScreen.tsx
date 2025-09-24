import appLogo from '/logo.png';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* App Logo */}
      <div className="mb-8 animate-pulse">
        <img 
          src={appLogo} 
          alt="Meal Planner" 
          className="w-24 h-24 rounded-2xl shadow-lg"
        />
      </div>
      
      {/* App Name */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Meal Planner
      </h1>
      
      {/* Subtitle */}
      <p className="text-slate-600 text-lg mb-8">Planning your perfect meals</p>
      
      {/* Loading Animation */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
      </div>
      
      {/* Loading Text */}
      <p className="text-slate-500 text-sm mt-4">Loading your meal plans...</p>
    </div>
  );
}
