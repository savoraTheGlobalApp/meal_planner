import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Onboarding } from '../pages/Onboarding';

export function AuthGuard() {
  const { user, loading } = useAuthStore();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // If user is not authenticated, show onboarding
  return <Onboarding />;
}
