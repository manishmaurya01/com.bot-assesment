import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [simulation, setSimulation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSimulation(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await forgotPassword(email.trim());
      setSimulation(res.simulation);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process reset request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot password?</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email to receive simulated password reset instructions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {simulation ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Simulated Reset Email Generated!</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                In assessment mode, the email link is simulated below:
              </p>
              <div className="mt-3 p-2 bg-white rounded border border-emerald-200 font-mono text-xs break-all text-slate-800">
                Token: {simulation.resetToken}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(simulation.resetUrl)}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-lg transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to Reset Password</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition shadow-sm"
            >
              {submitting ? 'Generating instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
