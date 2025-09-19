/**
 * Converts Firebase authentication error codes to user-friendly messages
 */
export function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    // Sign In Errors
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    
    case 'auth/user-not-found':
      return 'No account found with this email address. Please sign up first.';
    
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    
    // Sign Up Errors
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
    
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    
    // Network Errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    
    case 'auth/timeout':
      return 'Request timed out. Please try again.';
    
    // Generic fallback
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Extracts error code from Firebase error message
 */
export function extractFirebaseErrorCode(errorMessage: string): string {
  // Firebase error messages typically contain the error code in parentheses
  const match = errorMessage.match(/\(([^)]+)\)/);
  return match ? match[1] : 'unknown';
}
