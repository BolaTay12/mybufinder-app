
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import MYBUFinderLogin from './MYBUFinderLogin';
import MYBUFinderRegister from './MYBUFinderRegister';
import Dashboard from './Dashboard';
import SearchResults from './SearchResults';
import ReportItem from './ReportItem';
import AdminDashboard from './admin/AdminDashboard';
import AllReports from './admin/AllReports';
import AdminItemReview from './admin/AdminItemReview';
import AllClaims from './admin/AllClaims';
import AdminLogin from './admin/AdminLogin';
import Notifications from './Notifications';
import FoundItemDetails from './FoundItemDetails';
import MatchAnalysis from './MatchAnalysis';
import MyReports from './MyReports';
import Claims from './Claims';
import Settings from './Settings';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    if (isLoading) {
      return <LoadingSpinner fullScreen />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    if (isLoading) {
      return <LoadingSpinner fullScreen />;
    }
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <MYBUFinderLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <MYBUFinderRegister />
          </PublicRoute>
        }
      />

      <Route
        path="/admin-login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/all-reports"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AllReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/review/:itemId"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminItemReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/claims"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AllClaims />
          </ProtectedRoute>
        }
      />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search-results"
        element={
          <ProtectedRoute>
            <SearchResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-item"
        element={
          <ProtectedRoute>
            <ReportItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <MyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/claims"
        element={
          <ProtectedRoute>
            <Claims />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/match-analysis"
        element={
          <ProtectedRoute>
            <MatchAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/found-item-details/:itemId"
        element={
          <ProtectedRoute>
            <FoundItemDetails />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect based on auth status */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}



function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <UIProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </UIProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
