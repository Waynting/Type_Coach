# Intelligent Typing Training System
> Local-first intelligent typing game with weakness diagnosis and adaptive training features

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)](https://tailwindcss.com/)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation and Running
```bash
# Clone the repository
git clone <repository-url>
cd Hw2

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000) to get started!

### Production Build
```bash
# Build optimized version
npm run build

# Run production version locally
npm start
```

## 🚀 Core Features

### Gaming Experience
- **MonkeyType-style Interface**: Smooth text scrolling with cursor always at center line
- **Multiple Practice Modes**:
  - **Standard Test**: 60-second quick assessment
  - **Custom Timer**: Set any duration (10 seconds - 30 minutes) for timed or adaptive training
  - **Paragraph Mode**: Classic paragraph typing with natural line breaks
  - **Article Practice**: Practice with real article content
  - **Adaptive Training**: AI-generated practice content targeting personal weaknesses

### Advanced Analysis
- **Real-time Metrics**: Live display of WPM, accuracy, and reaction time
- **Weakness Diagnosis**:
  - Individual key performance analysis using EWMA algorithm for reaction time tracking
  - Bigram analysis to identify letter pairing weaknesses
  - Confusion matrix tracking common typing errors
- **Intelligent Scoring**: Comprehensive weakness scoring combining error rate, reaction time Z-score, and recent errors

### Adaptive Training System
- **Intelligent Text Generation**: Variable-length vocabulary (not just 3-character tokens)
- **Targeted Practice**: Generate training focused on weakest keys and bigrams
- **Progressive Difficulty**: Adapts to your skill level, targeting 675 CPM speed
- **Number Mode**: All practice modes can optionally include numbers (0-9)

### User Experience
- **Local-first**: All data stored locally using IndexedDB and localStorage
- **Instant Start**: Start typing immediately without clicking start button
- **Visual Feedback**: Real-time error highlighting with smooth transitions
- **Accessibility Design**: WCAG 2.1 AA compliant with screen reader support
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Technical Architecture

### Frontend Tech Stack
```
Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
```

### Data Storage
- **IndexedDB (via Dexie)**: Session history and typing analysis
- **localStorage**: User profiles and settings
- **No Server Required**: Fully offline-capable application

### Core Engine Components

#### 1. Keystroke Analysis (`/src/engine/keystats.ts`)
- Processes keyboard events into detailed performance metrics
- WPM calculation using standard 5-character word measurement
- Character-level accuracy tracking
- EWMA implementation for smoothed reaction time tracking
- Bigram statistics analysis updates

#### 2. Weakness Detection (`/src/engine/weakness.ts`)
- **Weakness Scoring Algorithm**: `0.6×error_rate + 0.3×rt_z_score + 0.1×recent_errors`
- Identifies weakest keys and letter combinations
- Generates confusion matrix for common typing mistakes
- Provides actionable improvement recommendations

#### 3. Adaptive Text Generation (`/src/engine/scheduler.ts`)
- Intelligent training generation based on weakness analysis
- Variable-length vocabulary library for rich practice content
- Character-to-keycode mapping ensures accurate input validation
- Supports content mixing and optional number inclusion

### UI/UX Features

#### MonkeyType-style Text Display
```typescript
// Smart text windowing with line refresh
const getTextWindow = () => {
  const charsPerLine = 65
  const currentGlobalLine = Math.floor(currentIndex / charsPerLine)
  const windowStartLine = Math.max(0, currentGlobalLine - 1)
  // Keep typing position at center line, smooth scrolling
}
```

#### Real-time Input Processing
- First keystroke immediately starts game
- Character-level validation with visual feedback
- Smooth error highlighting and recovery
- Backspace and correction support

## 🛠️ Development Guide

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build production version
npm start        # Run production version
npm run lint     # Run ESLint
npm run type-check # Run TypeScript compiler checks
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── page.tsx        # Dashboard homepage
│   ├── play/           # Main typing interface
│   └── review/         # Session results and analysis
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui base components
│   ├── CustomTimerDialog.tsx
│   ├── ArticleSelectionDialog.tsx
│   └── HelpButton.tsx
├── engine/            # Core typing game logic
│   ├── keystats.ts   # Performance metrics calculation
│   ├── weakness.ts   # Weakness analysis algorithms
│   ├── scheduler.ts  # Adaptive text generation
│   └── types.ts      # TypeScript type definitions
├── lib/              # Utility functions
│   ├── db.ts        # IndexedDB database layer
│   ├── articles.ts  # Article content management
│   └── utils.ts     # General utilities
└── styles/          # Global CSS and Tailwind configuration
```

## 🧠 Key Algorithms

### Weakness Scoring
The weakness detection system uses a sophisticated scoring algorithm:

```typescript
function weaknessScore(stat: KeyStat): number {
  const errorRate = stat.errors / Math.max(1, stat.attempts)
  const rtZScore = (stat.ewmaRt - globalMeanRt) / globalStdRt
  const recentErrorPenalty = stat.recentErrors * 0.1
  
  return 0.6 * errorRate + 0.3 * rtZScore + recentErrorPenalty
}
```

### Adaptive Text Generation
Content adapts in real-time to user performance:

1. **Weakness Analysis**: Identifies top 10 weakest keys and bigrams
2. **Content Mixing**: Balances targeted practice with vocabulary diversity
3. **Dynamic Length**: Generates content matching session duration (675 CPM target)
4. **Smart Vocabulary**: Uses diverse word lengths instead of repetitive short tokens

### Performance Metrics
- **WPM Calculation**: `(correct_chars / 5) / (minutes_elapsed)`
- **Accuracy**: `(correct_chars / total_chars) × 100`
- **Reaction Time**: EWMA smoothing with configurable alpha factor
- **Progress Tracking**: Session-to-session improvement analysis

## 🎯 Usage Guide

### Getting Started
1. **Dashboard Homepage**: View statistics and select practice mode
2. **Start Typing**: Begin immediately - no button clicks needed
3. **Real-time Feedback**: Watch WPM and accuracy update live
4. **Review Results**: Analyze performance and get personalized recommendations

### Practice Modes
- **Standard Test**: Quick 60-second assessment
- **Custom Timer**: Set preferred duration and options
- **Paragraph**: Extended practice with natural text flow
- **Article**: Practice with real-world content
- **Adaptive Training**: Targeted improvement for weaknesses

### Maximizing Improvement
1. Use **Adaptive Training** to focus on specific weaknesses
2. Enable **Number Mode** for comprehensive practice
3. Review **Confusion Matrix** to identify common mistakes
4. Practice regularly with varying content lengths

## 🔒 Privacy & Data

- **100% Local**: Data never leaves your device
- **No Analytics**: No tracking or telemetry
- **Offline Available**: Works without internet connection
- **Data Control**: Full control over your practice data

## 🤝 Contributing

This project follows modern React/Next.js best practices:
- Component composition over inheritance
- TypeScript for type safety
- Accessibility design patterns
- Performance-optimized rendering

## 📄 License

MIT License - Free for learning and personal use.

---

Crafted with ❤️ using Next.js 15, TypeScript, and modern web technologies