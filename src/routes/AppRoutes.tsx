import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

// Lazy load pages for lightning-fast initial bundles
const LandingPage = React.lazy(() => import('../pages/LandingPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const SignupPage = React.lazy(() => import('../pages/SignupPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../pages/ResetPasswordPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('../pages/UnauthorizedPage'));
const KnowledgeBasePage = React.lazy(() => import('../pages/KnowledgeBasePage'));
const AiChatPage = React.lazy(() => import('../pages/AiChatPage'));
const SearchPage = React.lazy(() => import('../pages/SearchPage'));
const ViewerPage = React.lazy(() => import('../pages/ViewerPage').then(module => ({ default: module.ViewerPage })));
const AdminPage = React.lazy(() => import('../pages/AdminPage'));

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Guest/Public Route Guard (Redirects to profile if user already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Guest Only Pages */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Private Pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge-base"
          element={
            <ProtectedRoute>
              <KnowledgeBasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-chat"
          element={
            <ProtectedRoute>
              <AiChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewer/:id"
          element={
            <ProtectedRoute>
              <ViewerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
export default AppRoutes;
