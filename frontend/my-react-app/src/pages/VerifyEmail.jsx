import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailCheck, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState(location.state?.email || user?.email || '');
  const [code, setCode] = useState(location.state?.simulationCode || '');
  const [simulationCode, setSimulationCode] = useState(location.state?.simulationCode || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !code.trim()) {
      setError('Please provide email and the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyEmail(email.trim(), code.trim());
      setSuccess(res.message || 'Email verified successfully!');
      setTimeout(() => {
        navigate('/features');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Email is required to resend verification code.');
      return;
    }

    try {
      setResending(true);
      setError('');
      const res = await resendVerification(email.trim());
      if (res.simulation?.verificationCode) {
        setSimulationCode(res.simulation.verificationCode);
        setCode(res.simulation.verificationCode);
      }
      setSuccess('A new simulated verification code has been generated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
            <MailCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h1>
          <p className="text-sm text-slate-500 mt-1">
            We simulate email delivery for this assessment demo
          </p>
        </div>

        {/* Simulation Banner */}
        {simulationCode && (
          <div className="mb-6 p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <div className="font-semibold mb-1 flex items-center gap-1.5">
              <span>📬 Simulated Inbox (Assessment Mode)</span>
            </div>
            <p className="text-slate-600">
              Your test verification code is:{' '}
              <strong className="text-blue-900 font-mono text-sm tracking-wider bg-white px-2 py-0.5 rounded border border-blue-200">
                {simulationCode}
              </strong>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-sm text-emerald-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">6-Digit Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder="123456"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-base font-mono text-center tracking-widest focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            Resend simulated code
          </button>
          <Link to="/features" className="hover:underline">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
