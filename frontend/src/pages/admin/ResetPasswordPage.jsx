import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return Swal.fire({ icon: 'warning', title: 'Password tidak cocok', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
    if (password.length < 8) {
      return Swal.fire({ icon: 'warning', title: 'Password terlalu pendek', text: 'Minimal 8 karakter', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Password berhasil direset. Silakan login.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
      navigate('/admin/login');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Token tidak valid atau kadaluarsa', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="card text-center"><p className="text-accent-red">Token tidak valid.</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Password Baru</h1>
          <p className="text-zinc-500 text-sm mt-1">Masukkan password baru kamu</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Password Baru</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Min. 8 karakter"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors" tabIndex={-1}>
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Ulangi password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors" tabIndex={-1}>
                  {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Menyimpan...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;