import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@pramaan.gov.in');
  const [password, setPassword] = useState('DemoPass123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (roleEmail) => {
    setEmail(roleEmail);
    setPassword('DemoPass123!');
    setError('');
    setLoading(true);
    try {
      await login(roleEmail, 'DemoPass123!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed for demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#090d16] flex flex-col md:flex-row font-sans">
      {/* LEFT PANEL: Dark Navy Editorial Section */}
      <div className="md:w-1/2 bg-[#0b132b] text-slate-100 p-8 md:p-14 flex flex-col justify-between select-none">
        {/* Top Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">PramaanSync</span>
        </div>

        {/* Editorial Headline & Subtitle */}
        <div className="my-12 md:my-0 space-y-6 max-w-lg">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-slate-100">
            Evidence, sealed the moment it arrives.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every file is hashed on intake, timestamped, and tracked through every access, so its chain of custody holds up under scrutiny.
          </p>

          {/* Live Stats Row */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl md:text-3xl font-bold font-mono text-slate-100">142</p>
              <p className="text-xs text-slate-400 mt-0.5">records secured</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold font-mono text-amber-500">99.4%</p>
              <p className="text-xs text-slate-400 mt-0.5">integrity rate</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold font-mono text-emerald-400">0</p>
              <p className="text-xs text-slate-400 mt-0.5">custody gaps</p>
            </div>
          </div>
        </div>

        {/* Bottom Org Line */}
        <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          Karnataka State Police · Digital Evidence Division
        </div>
      </div>

      {/* RIGHT PANEL: Clean White Form Section */}
      <div className="md:w-1/2 bg-white dark:bg-[#0f172a] p-8 md:p-14 flex items-center justify-center border-l border-transparent dark:border-slate-800">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sign in</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your case-management credentials.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 rounded text-sm outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="officer@pramaan.gov.in"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact station IT administrator for password reset.'); }} className="text-xs text-amber-700 hover:text-amber-800 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 rounded text-sm outline-none transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Continue with demo account:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('admin@pramaan.gov.in')}
                className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Admin</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">admin@pramaan.gov.in</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('inspector@pramaan.gov.in')}
                className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Inspector</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">inspector@pramaan.gov.in</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('investigator@pramaan.gov.in')}
                className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Investigator</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">investigator@pramaan.gov.in</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('researcher@pramaan.gov.in')}
                className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Researcher</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">researcher@pramaan.gov.in</p>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono text-center pt-1">Default demo password: DemoPass123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
