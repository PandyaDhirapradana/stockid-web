import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import Logo from '../../components/shared/Logo';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    equity: '', tradingExperience: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useUserAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;

    if (form.name.trim().length < 2) return Swal.fire({ icon: 'warning', title: 'Nama terlalu pendek', text: 'Minimal 2 karakter.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    if (!emailRegex.test(form.email)) return Swal.fire({ icon: 'warning', title: 'Email tidak valid', text: 'Contoh: nama@gmail.com', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    if (!phoneRegex.test(form.phone)) return Swal.fire({ icon: 'warning', title: 'Nomor HP tidak valid', text: 'Gunakan format: 08xxxxxxxxxx', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    if (form.password.length < 8) return Swal.fire({ icon: 'warning', title: 'Password terlalu pendek', text: 'Minimal 8 karakter.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    if (form.password !== form.confirm) return Swal.fire({ icon: 'warning', title: 'Password tidak cocok', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });

    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password, form.equity, form.tradingExperience);
      Swal.fire({ icon: 'success', title: 'Registrasi berhasil!', background: '#1e1e1e', color: '#fff', timer: 2000, showConfirmButton: false });
      navigate('/');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Terjadi kesalahan', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Logo size="xl" showText={false} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Buat Akun</h1>
          <p className="text-zinc-500 text-sm mt-1">Daftar untuk mulai belajar saham</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            {/* Nama */}
            <div>
              <label className="label" htmlFor="reg-name">Nama Lengkap <span className="text-accent-red">*</span></label>
              <input id="reg-name" name="name" type="text" value={form.name} onChange={handleChange('name')}
                className="input-field" placeholder="Nama lengkap kamu" autoComplete="name" required />
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="reg-email">Email <span className="text-accent-red">*</span></label>
              <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange('email')}
                className="input-field" placeholder="nama@gmail.com" autoComplete="email" required />
              <p className="text-xs text-zinc-600 mt-1">Contoh: nama@gmail.com</p>
            </div>

            {/* Nomor HP */}
            <div>
              <label className="label" htmlFor="reg-phone">Nomor WhatsApp <span className="text-accent-red">*</span></label>
              <input id="reg-phone" name="phone" type="tel" value={form.phone} onChange={handleChange('phone')}
                className="input-field" placeholder="08xxxxxxxxxx" autoComplete="tel" required />
              <p className="text-xs text-zinc-600 mt-1">Format: 08xxxxxxxxxx</p>
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="reg-password">Password <span className="text-accent-red">*</span></label>
              <div className="relative">
                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange('password')}
                  className="input-field pr-10" placeholder="Min. 8 karakter" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" tabIndex={-1}>
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="label" htmlFor="reg-confirm">Konfirmasi Password <span className="text-accent-red">*</span></label>
              <div className="relative">
                <input id="reg-confirm" name="confirm-password" type={showConfirm ? 'text' : 'password'}
                  value={form.confirm} onChange={handleChange('confirm')}
                  className="input-field pr-10" placeholder="Ulangi password" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" tabIndex={-1}>
                  {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Divider opsional */}
            <div className="border-t border-zinc-700 pt-4">
              <p className="text-xs text-zinc-500 mb-3">Informasi tambahan <span className="text-zinc-600">(opsional)</span></p>

              {/* Equity */}
              <div className="mb-4">
                <label className="label" htmlFor="reg-equity">Total Equity Saham</label>
                <input id="reg-equity" type="text" value={form.equity} onChange={handleChange('equity')}
                  className="input-field" placeholder="cth: Rp 10.000.000" />
              </div>

              {/* Pengalaman */}
              <div>
                <label className="label" htmlFor="reg-experience">Pengalaman di Dunia Saham</label>
                <input id="reg-experience" type="text" value={form.tradingExperience} onChange={handleChange('tradingExperience')}
                  className="input-field" placeholder="cth: 2 tahun, Pemula, 6 bulan" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-4">
            Sudah punya akun? <Link to="/login" className="text-accent hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;