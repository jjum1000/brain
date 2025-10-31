# YOLOSEUM - Decentralized Trading Platform

A cutting-edge decentralized trading platform built on Solana, allowing users to invest in automated trading strategies and earn passive income through copy trading.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Start development server
npm run dev

# Run tests
npm test
```

## 📋 Project Status

**Phase 4 - Testing, Optimization & Deployment**

### Completed Tasks ✅
- **Task 001-003**: Solana wallet, Jupiter DEX, Smart contracts
- **Task 004**: YouTube video integration
- **Task 005-008**: QR codes, fees, pagination, sorting
- **Task 009**: Unit tests (80+ tests, 80% coverage)
- **Task 010**: E2E tests (Playwright)
- **Task 011**: API retry logic with exponential backoff
- **Task 012**: Firestore security rules
- **Task 013**: Sentry error monitoring setup
- **Task 014**: i18n (English/Korean)
- **Task 015**: Comprehensive documentation

## 🏗️ Architecture

### Core Components
- **AuthProvider**: Firebase authentication + wallet connection
- **WalletContext**: Solana wallet state management
- **Strategy Management**: Real-time Firestore queries with filtering
- **Portfolio Tracking**: Aggregated earnings and P&L calculations
- **Deposit/Withdraw**: Jupiter DEX integration with smart contracts

### Data Flow
```
User Input → React Components → Hooks → Services → Blockchain/Firestore
      ↓                                      ↓
    UI Update ← State Management ← Cache/Real-time Listeners
```

## 🧪 Testing Suite

### Unit Tests (Vitest)
```bash
npm test                 # Run all tests
npm run test:coverage    # Generate coverage report
npm run test:ui          # Interactive test UI
```

**Coverage**: 80+ tests covering:
- Fee calculations
- Error handling  
- Retry logic
- Form validation
- Utility functions

### E2E Tests (Playwright)
```bash
npm run test:e2e         # Run E2E tests
npm run test:e2e:debug   # Debug mode
npm run test:e2e:ui      # Test UI
```

**Scenarios**:
- Authentication flows
- Strategy browsing
- Wallet connection
- Portfolio management
- Responsive design

## 🔐 Security

### Firestore Rules
- Users: Private (own data only)
- Strategies: Public read, admin write
- Transactions: Private per user
- Leaderboard: Public read

### Smart Contracts
- Vault ownership verification
- Balance validation
- Transaction signature checking
- Anchor framework safety

## 🌍 Internationalization

Supports English and Korean with automatic language detection and localStorage persistence.

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  return <h1>{t('common.appName')}</h1>;
}
```

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.1 | UI Framework |
| @solana/web3.js | 1.98.4 | Blockchain SDK |
| firebase | 12.4.0 | Backend Services |
| vite | 7.1.7 | Build Tool |
| tailwindcss | 3.4.1 | Styling |
| vitest | 4.0.6 | Unit Testing |
| @playwright/test | Latest | E2E Testing |

## 🚀 Deployment

### Build
```bash
npm run build        # Creates dist/ folder
npm run preview      # Test production build locally
```

### Environment Variables
```env
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_SOLANA_NETWORK=mainnet-beta
VITE_VAULT_PROGRAM_ID=your_program_id
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
# ... other vars
```

### Firebase Deployment
```bash
firebase deploy --only firestore:rules    # Deploy security rules
```

## 📊 Performance Metrics

- **Build Time**: ~5 seconds (development)
- **Bundle Size**: ~250KB gzipped
- **Test Coverage**: 80%+ on critical paths
- **LCP**: < 2.5s (production)

## 🛠️ Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Write tests first: `npm test`
3. Implement feature
4. Update documentation
5. Run full test suite: `npm test && npm run test:e2e`
6. Submit PR

## 📚 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design
- [API Reference](docs/API.md) - Hooks and utilities
- [Setup Guide](docs/SETUP.md) - Installation details
- [Deployment Guide](docs/DEPLOYMENT.md) - Production setup

## 🐛 Debugging

### Console Utilities
- Redux DevTools for state inspection
- React DevTools for component inspection
- Network tab for API debugging

### Error Tracking
- Sentry integration for production errors
- Breadcrumbs for session replay
- Source maps for stack traces

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Strategy creation tools
- [ ] Mobile native app
- [ ] DAO governance
- [ ] Multi-chain support

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: `docs/` folder
- **Examples**: `e2e/` and `src/components/`

---

**Built with React • Solana • Vite • Firebase**

Generated with Claude Code 🤖
