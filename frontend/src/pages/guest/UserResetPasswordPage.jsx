import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const UserResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return Swal.fire({ icon: 'warning', title: 'Password tidak cocok', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    setLoading(true);
    try {
      await api.post('/user/auth/reset-password', { token, password });
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Password berhasil direset.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
      navigate('/login');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Token tidak valid atau kadaluarsa', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally { setLoading(false); }
  };

  if (!token) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="card text-center"><p className="text-accent-red">Token tidak valid.</p></div></div>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Password Baru</h1>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Password Baru</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-10" placeholder="Min. 8 karakter" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Konfirmasi Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-field" placeholder="Ulangi password" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Menyimpan...' : 'Reset Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserResetPasswordPage;