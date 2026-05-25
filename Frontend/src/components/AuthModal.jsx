import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../utils/apiConfig';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login', 'signup', 'verify', 'forgot', 'reset'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUsername('');
      setEmail('');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setError('');
      setMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const resetState = () => {
    setError('');
    setMessage('');
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    resetState();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        login(data.user, data.token);
      }
      else if (mode === 'login') {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        login(data.user, data.token);
      }
      else if (mode === 'forgot') {
        const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        if (data.devOtp) {
          console.log('🔑 [Vault Demo Mode] Reset OTP:', data.devOtp);
        }
        setMessage(data.message);
        setMode('reset');
      }
      else if (mode === 'reset') {
        const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage(data.message + '. You can now login.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl relative animate-fade-in border border-indigo-500/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'signup' && 'Join the Vault'}
          {mode === 'forgot' && 'Forgot Password'}
          {mode === 'reset' && 'Reset Password'}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">{message}</div>}

        <form onSubmit={handleAuth} className="space-y-4" autoComplete="off">
          {(mode === 'login' || mode === 'signup') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="input-field" 
                placeholder="Enter your username"
                autoComplete="off"
                required 
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input-field" 
                placeholder="name@example.com"
                autoComplete="off"
                required 
              />
            </div>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input-field" 
                placeholder="name@example.com"
                autoComplete="off"
                required 
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input-field" 
                placeholder="••••••••"
                autoComplete="new-password"
                required 
                minLength={6} 
              />
            </div>
          )}


          {mode === 'reset' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">6-Digit OTP</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="input-field text-center text-xl tracking-[10px]" 
                  placeholder="000000"
                  maxLength={6} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="input-field" 
                  placeholder="••••••••"
                  required 
                  minLength={6} 
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-4 flex justify-center items-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
              mode === 'login' ? 'Login' : 
              mode === 'signup' ? 'Sign Up' : 
              mode === 'forgot' ? 'Send Reset OTP' : 'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <button onClick={() => { setMode('forgot'); resetState(); }} className="text-xs text-slate-500 hover:text-indigo-400 block mx-auto">
              Forgot password?
            </button>
          )}

          <p className="text-sm text-slate-400">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); resetState(); }} className="text-indigo-400 hover:text-indigo-300 font-medium">
              {mode === 'login' ? 'Sign up here' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
