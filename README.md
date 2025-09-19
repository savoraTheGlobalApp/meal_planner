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
