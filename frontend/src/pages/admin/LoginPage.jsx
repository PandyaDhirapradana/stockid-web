import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import Logo from '../../components/shared/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return Swal.fire({ icon: 'warning', title: 'Input tidak lengkap', text: 'Email dan password wajib diisi.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Login gagal', text: err.response?.data?.message || 'Email atau password salah.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-white">Stock ID Admin</h1>
          <p className="text-zinc-500 text-sm mt-1">Masuk ke panel admin</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" method="post" action="#">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="admin@stockclass.com"
                autoComplete="email" name="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10" placeholder="••••••••"
                  autoComplete="current-password" name="password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Masuk...
                </span>
              ) : 'Masuk'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/admin/forgot-password" className="text-sm text-zinc-500 hover:text-accent transition-colors">Lupa password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;