import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Preferences } from '../store/preferences';
import type { WeekMenu } from '../store/menu';

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      createdAt: new Date(),
      preferences: {
        breakfast: [],
        dal: [],
        veg: [],
        salad: []
      },
      menu: [],
      notificationTime: '20:00'
    });
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User data functions
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { data: userDoc.data(), error: null };
    } else {
      return { data: null, error: 'User document not found' };
    }
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateUserNotificationTime = async (userId: string, time: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      notificationTime: time
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const updateUserPreferences = async (userId: string, preferences: Preferences) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      preferences
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const updateUserMenu = async (userId: string, menu: WeekMenu) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      menu,
      lastUpdated: new Date()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const clearUserMenu = async (userId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      menu: [],
      lastUpdated: new Date()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const updateUserName = async (userId: string, name: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), { name });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const saveUserFeedback = async (userId: string, feedback: {
  menuSatisfaction: number;
  foodOptionsSatisfaction: number;
  userExperience: number;
  overallUsefulness: number;
  message: string;
}) => {
  try {
    // Check if user has already submitted 5 feedbacks
    const feedbackQuery = query(
      collection(db, 'feedback'),
      where('userId', '==', userId)
    );
    const feedbackSnapshot = await getDocs(feedbackQuery);
    
    if (feedbackSnapshot.size >= 5) {
      return { error: 'You have already submitted the maximum number of feedbacks (5). Thank you for your participation!' };
    }

    await setDoc(doc(db, 'feedback', `${userId}_${Date.now()}`), {
      userId,
      feedback,
      submittedAt: new Date(),
      userName: (await getUserData(userId)).data?.name || 'Unknown'
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserFeedbackCount = async (userId: string) => {
  try {
    const feedbackQuery = query(
      collection(db, 'feedback'),
      where('userId', '==', userId)
    );
    const feedbackSnapshot = await getDocs(feedbackQuery);
    return { count: feedbackSnapshot.size, error: null };
  } catch (error: any) {
    return { count: 0, error: error.message };
  }
};
