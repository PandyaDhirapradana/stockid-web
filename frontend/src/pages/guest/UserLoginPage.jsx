import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import Logo from '../../components/shared/Logo';

const UserLoginPage = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      return Swal.fire({ icon: 'warning', title: 'Input tidak lengkap', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
    setLoading(true);
    try {
      await login(identifier, password, loginMethod);
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Login gagal', text: err.response?.data?.message || 'Email/nomor HP atau password salah', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Logo size="xl" showText={false} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Login</h1>
          <p className="text-zinc-500 text-sm mt-1">Masuk ke akun Stock ID kamu</p>
        </div>

        <div className="card">
          {/* Toggle Login Method */}
          <div className="flex bg-surface-2 rounded-lg p-1 mb-5">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${loginMethod === 'email' ? 'bg-accent text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${loginMethod === 'phone' ? 'bg-accent text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Nomor HP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" method="post">
            <div>
              <label className="label">
                {loginMethod === 'email' ? 'Email' : 'Nomor WhatsApp'}
              </label>
              <input
                type={loginMethod === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="input-field"
                placeholder={loginMethod === 'email' ? 'nama@gmail.com' : '08xxxxxxxxxx'}
                autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
                name={loginMethod === 'email' ? 'email' : 'phone'}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  name="password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors" tabIndex={-1}>
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-zinc-500 hover:text-accent transition-colors">
                Lupa password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Masuk...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-4">
            Belum punya akun? <Link to="/register" className="text-accent hover:underline font-medium">Daftar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;