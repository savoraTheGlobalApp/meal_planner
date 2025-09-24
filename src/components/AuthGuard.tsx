import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Onboarding } from '../pages/Onboarding';
import { LoadingScreen } from './LoadingScreen';

export function AuthGuard() {
  const { user, loading } = useAuthStore();

  // Show branded loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // If user is not authenticated, show onboarding
  return <Onboarding />;
}
