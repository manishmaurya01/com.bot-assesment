import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Projects from './pages/Projects';
import Home from './pages/Home';
import Features from './pages/Features';
import Roadmap from './pages/Roadmap';
import FeatureDetail from './pages/FeatureDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/projects/:projectId/features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
              <Route path="/projects/:projectId/features/:id" element={<ProtectedRoute><FeatureDetail /></ProtectedRoute>} />
              <Route path="/projects/:projectId/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}