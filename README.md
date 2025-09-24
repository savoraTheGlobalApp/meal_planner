# 🍽️ Meal Planner

A modern, responsive web application that helps busy professionals generate personalized 7-day meal plans based on their food preferences. No more context switching when your cook asks "What to cook today?"

## ✨ Features

### 🎯 Core Functionality
- **Personalized Meal Generation** - Create 7-day meal plans based on your preferences
- **Multi-Category Selection** - Choose from Breakfast, Dal, Vegetables, and Fruits/Salad
- **Custom Items** - Add your own food items not in the predefined list
- **Smart Menu Generation** - Automatically combines breakfast items with fruits for balanced meals
- **Regenerate Individual Meals** - Fine-tune specific meals without regenerating the entire week

### �� User Experience
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Progressive Web App (PWA)** - Install as a native app on your device
- **Smart Navigation** - Auto-hiding header on scroll, fixed bottom navigation on mobile
- **Persistent Data** - Your preferences and menu persist across sessions
- **PDF Export** - Download your meal plan as a professional PDF

### �� Modern UI/UX
- **Colorful & Aesthetic** - Beautiful gradient backgrounds and color-coded categories
- **Intuitive Interface** - Clean, modern design with smooth animations
- **Touch-Friendly** - Optimized for mobile interactions
- **Accessibility** - Screen reader friendly with proper ARIA labels

## �� Quick Start

### Prerequisites
- Node.js (v20.11.1 or higher)
- npm (v10.2.4 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meal_planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📱 Usage Guide

### Getting Started

1. **Sign Up** - Enter your name and email to create an account
2. **Set Preferences** - Go through the 4-step preference selection:
   - **Breakfast**: Choose from Poha, Daliya, Upma, Parathas, Dosa, etc.
   - **Dal**: Select your preferred lentils and beans
   - **Vegetables**: Pick your favorite vegetables
   - **Fruits/Salad**: Choose fruits and salad items
3. **Generate Menu** - Your 7-day meal plan will be automatically created
4. **Customize** - Use regenerate buttons to adjust individual meals
5. **Export** - Download your menu as a PDF

### Navigation

- **Desktop**: Use the header navigation (Home, Profile)
- **Mobile**: Use the fixed bottom navigation tabs
- **Weekly View**: See all 7 days in a grid layout
- **Daily View**: Focus on one day with swipe navigation

### Features in Detail

#### 🍳 Smart Breakfast Generation
- Combines main breakfast items with fruits
- Examples: "Cornflakes, Apple", "Poha, Banana", "Daliya, Grapes"

#### ��️ Balanced Meals
- **Lunch**: Dal + Vegetable + Fruit/Salad + Roti/Rice
- **Dinner**: Dal + Vegetable + Fruit/Salad + Roti/Rice
- **Breakfast**: Main item + Fruit

#### 📄 PDF Export
- Professional table format
- Color-coded meal categories
- Includes your name and generation date
- Print-ready layout

## ��️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas
- **PWA**: Vite PWA Plugin

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── AppShell.tsx    # Main layout with navigation
├── pages/              # Page components
│   ├── SignUp.tsx      # User registration
│   ├── Home.tsx        # Dashboard
│   ├── Profile.tsx     # User profile
│   ├── preferences/    # Preference selection flow
│   └── menu/           # Menu viewing pages
├── store/              # State management
│   ├── auth.ts         # Authentication state
│   ├── preferences.ts  # User preferences
│   └── menu.ts         # Menu generation
├── utils/              # Utility functions
│   └── pdfGenerator.ts # PDF export functionality
└── styles.css          # Global styles
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter (placeholder)

### Environment Variables

No environment variables required for basic functionality. The app uses localStorage for data persistence.

### Data Persistence

- **User Data**: Stored in localStorage
- **Preferences**: Automatically saved when selections are made
- **Menu**: Persists across browser sessions
- **Future**: Ready for Firebase integration

## 🚀 Deployment

### Netlify (Recommended)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy!

### Other Platforms

The app can be deployed to any static hosting service:
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 📱 PWA Features

- **Installable** - Add to home screen on mobile devices
- **Offline Ready** - Works without internet connection
- **App-like Experience** - Full-screen mode on mobile
- **Fast Loading** - Optimized for performance

##  Future Enhancements

- **Firebase Integration** - Cloud data synchronization
- **User Accounts** - Multi-device access
- **Recipe Integration** - Link to cooking instructions
- **Nutritional Info** - Calorie and nutrition tracking
- **Shopping Lists** - Generate grocery lists from meal plans
- **Social Features** - Share meal plans with family

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Mobile App (APK) Generation

This web app can be converted into a native Android APK using Capacitor and Android Studio. Follow these steps to generate an APK for Google Play Store.

### Prerequisites for APK Generation

- **Node.js** (v20.11.1 or higher)
- **Android Studio** (latest version)
- **Android SDK** (API level 33 or 34)
- **Java Development Kit (JDK)** (version 11 or higher)

### Step 1: Install Android Studio

1. **Download Android Studio** from: https://developer.android.com/studio
2. **Install Android Studio** with default settings
3. **Open Android Studio** and complete the setup wizard
4. **Install Android SDK** (API level 33 or 34 recommended)
5. **Set up Android SDK path** in your system environment variables

### Step 2: Install Capacitor (Mobile Framework)

```bash
# Install Capacitor core and CLI
npm install @capacitor/core @capacitor/cli

# Install Android platform
npm install @capacitor/android
```

### Step 3: Initialize Capacitor

```bash
# Initialize Capacitor (if not already done)
npx cap init "Meal Planner" "com.mealplanner.app"

# Add Android platform
npx cap add android
```

### Step 4: Build Web App for Production

```bash
# Build the web app for production
npm run build
```

### Step 5: Sync Web Build to the Android Project

```bash
# Sync web build, Capacitor config and native plugins to the Android project
# (runs copy under the hood and also updates native plugin versions)
npx cap sync android

# Open project in Android Studio
npx cap open android
```

### Step 6: Configure Android Project in Android Studio

#### 6.1: Set App Name & Package
- Go to `android/app/src/main/res/values/strings.xml`
- Update app name and package ID if needed

#### 6.2: Configure App Icon
- Replace `android/app/src/main/res/mipmap-*` folders with your app icons
- Use Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/
- Recommended sizes: 48dp, 72dp, 96dp, 144dp, 192dp

#### 6.3: Set Permissions
- Go to `android/app/src/main/AndroidManifest.xml`
- Internet permission is already included by default
- Add other permissions if needed (camera, storage, etc.)

#### 6.4: Configure Firebase for Android
- Download `google-services.json` from Firebase Console
- Place it in `android/app/` folder
- Firebase dependencies are already configured in `build.gradle`

### Step 7: Build APK

#### Debug APK (for testing):
1. In Android Studio: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. APK will be created in `android/app/build/outputs/apk/debug/`

#### Release APK (for Play Store):
1. **Build** → **Generate Signed Bundle / APK**
2. Choose **APK**
3. Create new keystore (for first time) or use existing
4. Fill in keystore details:
   - **Key store path**: Choose location for your keystore
   - **Key store password**: Create a strong password
   - **Key alias**: Create an alias name
   - **Key password**: Create a strong password
5. Build release APK
6. APK will be created in `android/app/build/outputs/apk/release/`

### Step 8: Test Your APK

1. **Install APK** on Android device
2. **Test all features:**
   - Sign up/Sign in
   - Set preferences
   - Generate menu
   - Data persistence
   - PDF generation

### Step 9: Prepare for Google Play Store

#### Required Files:
1. **App Icon** (512x512 PNG)
2. **Feature Graphic** (1024x500 PNG)
3. **Screenshots** (at least 2, different screen sizes)
4. **App Description** (4000 characters max)
5. **Privacy Policy URL**

#### Play Store Requirements:
1. **Target API Level 33+** (Android 13+)
2. **64-bit support** (arm64-v8a)
3. **App Bundle** (preferred over APK)
4. **Content Rating**
5. **Data Safety Form**

### Quick Commands Summary

```bash
# Build web app
npm run build

# Sync web build and native plugins to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Sync changes (after web updates)
npx cap sync
```

### Troubleshooting

#### Common Issues:

1. **"SDK location not found"**
   - Set `ANDROID_HOME` environment variable
   - Add Android SDK path to system PATH

2. **"Gradle sync failed"**
   - Update Android Studio to latest version
   - Update Gradle wrapper version

3. **"Build failed"**
   - Clean project: **Build** → **Clean Project**
   - Rebuild: **Build** → **Rebuild Project**

4. **"App not installing on device"**
   - Enable "Unknown sources" in device settings
   - Check if device supports the target API level

### Expected Timeline

- **Setup & Build:** 2-3 hours
- **Testing & Debugging:** 1-2 hours  
- **Play Store Preparation:** 2-4 hours
- **Total:** 5-9 hours

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- PDF generation with [jsPDF](https://github.com/parallax/jsPDF)

##  Support

For support, email your-email@example.com or create an issue in the repository.

---

**Made with ❤️ for busy professionals who want to eat well without the mental overhead of meal planning.**
