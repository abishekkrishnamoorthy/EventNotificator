# EventNotificator

EventNotificator is a React-based calendar and event management application built with Firebase. With EventNotificator, you can create and manage group calendars, add events, collaborate with groups, and seamlessly notify participants. The application features user authentication, a comprehensive dashboard, and real-time synchronization.

## Features

### 1. User Authentication
- **Email/Password Registration**: Create an account with email and password
- **Email Verification**: Automatic email verification upon signup
- **Password Reset**: Reset forgotten passwords via email
- **OAuth Login**: Sign in with Google for quick access
- **Secure Logout**: Secure session management

### 2. Dashboard
- **User Overview**: Personalized welcome message with user information
- **Quick Stats**: View total events, today's events, groups, and upcoming events at a glance
- **Recent Events**: Preview of today's and upcoming events
- **Quick Actions**: Fast access to create events, view groups, chat, and manage profile
- **Navigation**: Easy access to all application features

### 3. Calendar Management
- **Visual Calendar**: Interactive calendar view with month navigation
- **Create Events**: Add new events to your calendar with details
- **Edit Events**: Update existing events with ease
- **Delete Events**: Remove events you no longer need
- **Event Notifications**: Stay informed about upcoming events
- **Day View**: Click on any day to see events scheduled for that date

### 4. Events Management
- **List All Events**: View all your events in a organized list
- **Filter and Search**: Filter events by date, type, or group
- **Event CRUD Operations**: Full create, read, update, and delete functionality
- **Event Details**: View comprehensive event information including description, time, and assigned groups
- **Event Types**: Organize events by type (event, todo, group task)

### 5. Groups
- **View Groups**: See all groups you're part of
- **Create Groups**: Create new groups for collaborative event management
- **Manage Group Members**: Add and manage members in your groups
- **Group Events**: Associate events with specific groups
- **Group Statistics**: View group activity and member count

### 6. Chat
- **Group Chat Functionality**: Real-time messaging within groups
- **Group Selection**: Switch between different group chats
- **Message History**: View conversation history
- **Real-time Messaging**: Instant message delivery using Firebase Realtime Database
- **User Identification**: See who sent each message

### 7. Profile Management
- **View Profile**: Display your account information
- **Edit Profile**: Update display name and profile information
- **Profile Photo**: Upload and manage profile pictures using Firebase Storage
- **Change Password**: Update your account password securely
- **Account Information**: View email verification status, account creation date, and last sign-in
- **Account Settings**: Manage all account preferences in one place

## Technology Stack

- **Frontend**: React 18
- **Routing**: React Router DOM v6
- **Backend**: Firebase
  - Authentication (Email/Password, OAuth)
  - Realtime Database
  - Storage (for profile photos)
- **Email Service**: Firebase Cloud Functions with SMTP (Nodemailer)
- **Styling**: Custom CSS with modern design patterns
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project configured

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a `.env` file in the root directory (copy from `.env.example` if available)
   - Add your Firebase configuration to `.env`:
     ```
     VITE_FIREBASE_API_KEY=your-api-key-here
     VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
     VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
     ```
   - Enable Authentication methods (Email/Password, Google) in Firebase Console
   - Deploy Realtime Database security rules (see Security Rules section below)
   - Configure Storage rules for profile photos

4. Set up Firebase Cloud Functions for Email:
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Initialize Functions (if not already): `firebase init functions`
   - Navigate to functions directory: `cd functions`
   - Install dependencies: `npm install`
   - Configure SMTP credentials in Firebase Functions:
     ```bash
     firebase functions:config:set smtp.host="smtp.gmail.com"
     firebase functions:config:set smtp.port="587"
     firebase functions:config:set smtp.user="your-email@gmail.com"
     firebase functions:config:set smtp.pass="your-app-password"
     firebase functions:config:set sender.email="noreply@yourdomain.com"
     firebase functions:config:set sender.name="EventNotificator"
     ```
   - Deploy functions: `firebase deploy --only functions`
   - **Note**: For Gmail, use App Password (not regular password)
   - For other SMTP providers, update the configuration accordingly

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── Calendar/      # Calendar-related components
│   ├── Modals/        # Modal dialogs
│   ├── Navigation.jsx # Left sidebar navigation
│   ├── Layout.jsx     # Main layout wrapper
│   └── ProtectedRoute.jsx # Route protection
├── contexts/          # React contexts
│   ├── AuthContext.jsx    # Authentication state
│   └── AppContext.jsx     # Application state
├── pages/             # Page components
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── VerifyEmailPage.jsx
│   ├── DashboardPage.jsx
│   ├── CalendarPage.jsx
│   ├── ManageEventsPage.jsx
│   ├── ViewGroupsPage.jsx
│   ├── ChatPage.jsx
│   └── ProfilePage.jsx
├── config/            # Configuration files
│   └── firebase.js    # Firebase initialization
├── services/          # API services
│   ├── api.js         # Firebase API calls
│   └── emailService.js # Email notification service (Firebase Functions)
├── functions/         # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.js      # Functions entry point
│   │   ├── emailFunctions.js # Email sending logic
│   │   └── emailTemplates.js # Email HTML templates
│   └── package.json   # Functions dependencies
├── styles/            # Stylesheets
│   └── styles.css     # Main stylesheet
└── App.jsx            # Main application component
```

## Features in Detail

### Authentication Flow
1. User signs up with email/password or uses OAuth (Google)
2. Email verification link is sent (for email/password signup)
3. User verifies email and gains full access
4. User can login anytime with credentials or OAuth
5. All routes are protected and require authentication

### Dashboard Features
- **Statistics Cards**: Visual representation of events and groups
- **Today's Events**: Quick view of events scheduled for today
- **Upcoming Events**: Preview of next 5 upcoming events
- **Quick Actions**: One-click access to common tasks

### Calendar Features
- Month view with navigation
- Color-coded events
- Event indicators on days with events
- Sidebar with todos, groups, and upcoming events

### Profile Features
- Upload profile photos (max 5MB)
- Update display name
- Change password with re-authentication
- View account metadata

### Email Notifications
- **Event Created**: Assigned members receive email notifications when events are created
- **Event Updated**: Assigned members receive email notifications when events are updated
- **Todo Created**: Assigned members receive email notifications when todos are created
- **Group Invitation**: Group members receive email notifications when added to a group
- **Professional Templates**: HTML email templates with event/todo/group details
- **Graceful Degradation**: Application works even if email service is not configured

## Email Notification Setup

### Using Firebase Cloud Functions with SMTP

1. **Set up Firebase Cloud Functions**:
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Initialize Functions: `firebase init functions`
   - Select your Firebase project when prompted
   - Choose JavaScript as the language
   - Install dependencies in functions directory: `cd functions && npm install`

2. **Configure SMTP Credentials**:
   
   **Option A: Using Firebase Functions Config (Recommended)**
   ```bash
   firebase functions:config:set smtp.host="smtp.gmail.com"
   firebase functions:config:set smtp.port="587"
   firebase functions:config:set smtp.user="your-email@gmail.com"
   firebase functions:config:set smtp.pass="your-app-password"
   firebase functions:config:set sender.email="noreply@yourdomain.com"
   firebase functions:config:set sender.name="EventNotificator"
   ```
   
   **Option B: Using Environment Variables (for local development)**
   - Create `.env` file in `functions/` directory:
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     SENDER_EMAIL=noreply@yourdomain.com
     SENDER_NAME=EventNotificator
     ```

3. **SMTP Provider Configuration**:
   
   **For Gmail:**
   - Enable 2-Factor Authentication
   - Generate App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use the app password in `SMTP_PASS`
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587` (TLS) or `465` (SSL)
   
   **For Other Providers:**
   - Update SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS accordingly
   - Common providers: Outlook (smtp-mail.outlook.com:587), Yahoo (smtp.mail.yahoo.com:587)

4. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```
   
   Or deploy specific function:
   ```bash
   firebase deploy --only functions:sendEventCreatedEmail
   ```

5. **Test Email Notifications**:
   - Create a test event with assigned members
   - Check email inboxes for notification emails
   - Check Firebase Functions logs: `firebase functions:log`
   - Verify email formatting and content

**Note**: 
- The application will continue to function normally even if Cloud Functions are not deployed
- Email sending failures are logged in Firebase Functions logs
- SMTP credentials are stored securely in Firebase Functions config (not exposed to client)

## Security Features

- Protected routes requiring authentication
- Email verification for new accounts
- Secure password management
- Firebase Security Rules for data protection
- OAuth integration for trusted authentication
- User-based data filtering and access control
- Input sanitization and validation
- XSS protection
- Environment variable configuration for sensitive data

## Security Rules Setup

The project includes Firebase Realtime Database security rules in `database.rules.json`. To deploy these rules:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project (if not already): `firebase init`
4. Deploy security rules: `firebase deploy --only database`

The security rules ensure:
- Users can only read/write their own events or events they're assigned to
- Users can only access groups they're members of
- Users can only access chat messages for groups they belong to
- All data operations require authentication

## Code Quality & Best Practices

### Security
- All Firebase credentials are stored in environment variables
- User-based data filtering prevents unauthorized access
- Input sanitization prevents XSS attacks
- Email validation ensures data integrity
- Firebase Security Rules enforce server-side access control

### Performance
- React.memo for expensive components
- useMemo and useCallback for optimized re-renders
- Debounced search inputs
- Pagination for large data sets
- Optimized Firebase queries

### Error Handling
- Error boundaries for graceful error recovery
- Comprehensive error logging with logger utility
- User-friendly error messages
- Loading states for all async operations

### Code Organization
- Centralized logging system
- Reusable utility functions
- Custom hooks for common patterns
- Consistent error handling patterns

## Future Enhancements

- Calendar sharing and permissions
- Event reminders
- Recurring events
- Mobile app support
- Advanced group management features
- Export calendar (iCal format)
- Dark mode
- Advanced search and filtering

## License

ISC

## Author

abishekkrishnamoorthy
