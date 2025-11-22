# Healthcare Management System - Frontend

React TypeScript frontend for the healthcare management system with Bootstrap UI and Chart.js analytics.

## Features

- **Authentication**: Login/Register with JWT tokens
- **Patient Dashboard**: Progress tracking, health tips, upcoming checkups
- **Provider Dashboard**: Patient management, goal assignment
- **Goal Tracking**: Visual progress with charts and streaks
- **Preventive Care**: Appointment scheduling and management
- **Profile Management**: Health information and emergency contacts
- **Responsive Design**: Bootstrap-based mobile-friendly UI

## Tech Stack

- React 18 with TypeScript
- React Router for navigation
- Bootstrap & React-Bootstrap for UI
- Chart.js & React-Chartjs-2 for analytics
- Axios for API calls
- Local storage for authentication

## Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm start
```

3. **Build for Production**
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.tsx      # Navigation bar
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Goals.tsx       # Patient goals page
│   ├── Patients.tsx    # Provider patients page
│   ├── PreventiveCare.tsx # Checkups page
│   └── Profile.tsx     # User profile page
├── services/           # API service layer
│   └── api.ts         # Axios API calls
├── types/             # TypeScript interfaces
│   └── index.ts       # Type definitions
├── utils/             # Utility functions
│   └── auth.ts        # Authentication helpers
└── App.tsx            # Main app component
```

## Key Features

### Patient Features
- View wellness goals and progress
- Log daily activities (steps, water, sleep, etc.)
- Track streaks and completion rates
- Schedule preventive care appointments
- View health tips and reminders
- Manage health information and allergies

### Provider Features
- View assigned patients
- Assign wellness goals to patients
- Monitor patient compliance and progress
- View patient health information
- Track goal completion rates

### Analytics & Charts
- Progress bar charts for daily goals
- Doughnut charts for goal status distribution
- Streak tracking and completion rates
- Historical progress visualization

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` with the following endpoints:

- **Auth**: `/auth/login`, `/auth/register`
- **Users**: `/users/profile`, `/users/give-consent`
- **Patients**: `/patients/dashboard`, `/patients/log-progress`
- **Providers**: `/providers/patients`, `/providers/assign-goals`
- **Preventive Care**: `/preventive-care/schedule`, `/preventive-care/book`

## Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token included in API requests via Axios interceptor
4. Protected routes check authentication status
5. Role-based access control for patient/provider features

## Usage Examples

### Patient Workflow
1. Register as patient
2. View dashboard with assigned goals
3. Log daily progress for wellness goals
4. Schedule preventive care appointments
5. Track progress with visual charts

### Provider Workflow
1. Register as healthcare provider
2. View assigned patients list
3. Assign wellness goals to patients
4. Monitor patient compliance and progress
5. View detailed patient health information

## Environment Variables

Create `.env` file in frontend root:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Development

- Uses Create React App with TypeScript template
- Bootstrap for responsive design
- Chart.js for data visualization
- Axios for HTTP requests
- React Router for client-side routing

## Production Deployment

1. Build the application: `npm run build`
2. Serve the `build` folder with a web server
3. Configure API URL for production environment
4. Enable HTTPS for secure authentication# frontend_hcl_wellness
