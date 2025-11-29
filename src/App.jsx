import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import ManageEventsPage from './pages/ManageEventsPage';
import ViewGroupsPage from './pages/ViewGroupsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/otp-verification" element={<OTPVerificationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="events" element={<ManageEventsPage />} />
              <Route path="groups" element={<ViewGroupsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

