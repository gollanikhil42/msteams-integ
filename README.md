# Microsoft Teams Integration Web App

A professional TypeScript + React + Vite web application demonstrating Microsoft Teams integration feasibility.
## Project Structure
fdgfdg
```
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # App header with user info
│   │   ├── UserProfile.tsx  # User profile display
│   │   ├── TeamsList.tsx    # Teams and channels navigation
│   │   └── ChatView.tsx     # Chat interface for channels
│   ├── services/            # Business logic
│   │   ├── authService.ts   # Authentication (MSAL ready)
│   │   └── graphService.ts  # Graph API integration
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # CSS styling
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite configuration
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Fluent UI (Microsoft Design System)
- **Authentication**: MSAL Browser (ready for integration)
- **API**: Microsoft Graph REST API (ready for integration)

## Features

- ✅ Professional UI with Microsoft Fluent Design
- ✅ User authentication flow skeleton
- ✅ Teams and channels listing
- ✅ Chat/messaging interface
- ✅ User profile display with presence status
- ✅ Fully typed with TypeScript
- ✅ Ready for real MSAL integration

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at http://localhost:3000

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

```bash
npm run test:run
```

```bash
npm run test:coverage
```

```bash
npm run test:report
```

`test:report` creates:
- `reports/vitest-results.json`
- `reports/test-report.xlsx`

Excel report columns:
- Test About
- Status
- Reason
- Next Steps Triggered
- Suite
- File

## Testing Assets

- Manual checklist: `docs/testing/manual-test-checklist.md`
- Automation strategy: `docs/testing/automation-strategy.md`
- CI workflow: `.github/workflows/ci.yml`
- CI test report artifact: `test-reports` (download from GitHub Actions run)

## How to Integrate Real Microsoft Teams

When you have Azure AD access:

1. **Register App in Azure AD**
   - Go to Azure Portal → App Registrations
   - Create new app registration
   - Note the Client ID and Tenant ID

2. **Update MSAL Configuration** (in `authService.ts`)
   ```typescript
   const msalConfig = {
     auth: {
       clientId: 'YOUR_CLIENT_ID',
       authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
       redirectUri: 'http://localhost:3000'
     }
   };
   ```

3. **Replace Mock Implementations**
   - Uncomment real API calls in `graphService.ts`
   - Add MSAL PublicClientApplication initialization
   - Implement real token acquisition

4. **Add Graph API Permissions**
   - User.Read
   - Team.ReadBasic.All
   - ChannelMessage.Read.All

## Current Mock Data

The app currently uses mock data but is fully prepared for real integration:
- Mock user profile
- Mock teams and channels
- Mock chat messages

All Graph API calls are marked with TODO comments showing where real calls should go.

## Architecture Ready for Production

- **Service Layer**: Abstracts API calls (easy to swap mock for real)
- **Type Safety**: Full TypeScript types for Teams/Graph objects
- **Error Handling**: Structured error management
- **Component Isolation**: Reusable components

## Next Steps (When Azure Access Available)

1. Register application in Azure AD
2. Uncomment real MSAL initialization in auth service
3. Uncomment real Graph API fetch calls
4. Add required permissions to app registration
5. Test authentication flow
6. Deploy to Azure App Service
