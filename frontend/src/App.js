import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import UserProtectedRoute from './components/shared/UserProtectedRoute';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage';
import ResetPasswordPage from './pages/admin/ResetPasswordPage';
import DashboardPage from './pages/admin/DashboardPage';
import MembersPage from './pages/admin/MembersPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import CustomizePage from './pages/admin/CustomizePage';

// Guest pages
import LandingPage from './pages/guest/LandingPage';
import RegisterPage from './pages/guest/RegisterPage';
import UserLoginPage from './pages/guest/UserLoginPage';
import UserForgotPasswordPage from './pages/guest/UserForgotPasswordPage';
import UserResetPasswordPage from './pages/guest/UserResetPasswordPage';
import PaymentStatusPage from './pages/guest/PaymentStatusPage';
import ProfilePage from './pages/guest/ProfilePage';

// Member page
import LeaderboardPage from './pages/member/LeaderboardPage';
import ModulesPage from './pages/member/ModulesPage';

function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Guest */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/forgot-password" element={<UserForgotPasswordPage />} />
            <Route path="/reset-password" element={<UserResetPasswordPage />} />

            {/* User Protected */}
            <Route path="/payment-status" element={<UserProtectedRoute><PaymentStatusPage /></UserProtectedRoute>} />
            <Route path="/profile" element={<UserProtectedRoute><ProfilePage /></UserProtectedRoute>} />

            {/* Member (cek active membership di backend) */}
            <Route path="/member" element={<LeaderboardPage />} />
            <Route path="/modules" element={<ModulesPage />} />

            {/* Admin Auth */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

            {/* Admin Protected */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/admin/customize" element={<ProtectedRoute><CustomizePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UserAuthProvider>
    </AuthProvider>
  );
}

export default App;