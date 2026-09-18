import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <Layers className="w-5 h-5 text-brand-600" />
          <span>FeedbackPortal</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/features" className="hover:text-brand-600 transition">Features</Link>
          <Link to="/roadmap" className="hover:text-brand-600 transition">Roadmap</Link>
          {user && (
            <Link to="/dashboard" className="hover:text-brand-600 transition">Dashboard</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-amber-600 font-semibold hover:text-amber-700">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {!user.isVerified && (
                <Link
                  to="/verify-email"
                  className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-medium hover:bg-amber-100 transition"
                  title="Click to verify your email"
                >
                  Verify Email
                </Link>
              )}
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-700 font-medium border">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 text-sm p-1 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link to="/login" className="px-3 py-1.5 text-slate-600 hover:text-slate-900">Login</Link>
              <Link to="/signup" className="px-3.5 py-1.5 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}