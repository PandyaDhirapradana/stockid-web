import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const UserForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/user/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Terjadi kesalahan', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Lupa Password</h1>
          <p className="text-zinc-500 text-sm mt-1">Masukkan email akun kamu</p>
        </div>
        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-accent text-2xl">✓</span></div>
              <p className="text-white font-medium">Email terkirim!</p>
              <p className="text-zinc-400 text-sm mt-2">Cek inbox dan klik link reset password (berlaku 15 menit).</p>
              <Link to="/login" className="btn-secondary mt-4 inline-block text-sm">Kembali ke Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="email@kamu.com" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Mengirim...' : 'Kirim Link Reset'}</button>
              <Link to="/login" className="block text-center text-sm text-zinc-500 hover:text-accent">Kembali ke Login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserForgotPasswordPage;