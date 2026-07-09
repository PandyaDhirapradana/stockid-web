import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useUserAuth } from '../../context/UserAuthContext';
import { formatDate, formatCurrency, getCategoryColor, isActive } from '../../utils/helpers';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Swal from 'sweetalert2';

const ProfilePage = () => {
  const { user, refreshUser } = useUserAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/auth/profile');
      setProfile(res.data.data);
      const u = res.data.data.user;
      setForm({
        name: u.name,
        email: u.email,
        phone: u.phone,
        equity: u.equity || '',
        tradingExperience: u.tradingExperience || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/user/auth/profile', form);
      await refreshUser();
      await fetchProfile();
      setEditing(false);
      Swal.fire({ icon: 'success', title: 'Profil diperbarui!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Terjadi kesalahan', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const u = profile.user;
    setForm({ name: u.name, email: u.email, phone: u.phone, equity: u.equity || '', tradingExperience: u.tradingExperience || '' });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat profil..." />
      </div>
    );
  }

  const { user: userData, member, transactions } = profile;
  const memberActive = member && isActive(member.endDate);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-surface sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white transition-colors text-sm">
          Kembali
          </button>
          <h1 className="text-lg font-semibold text-white">Profil Saya</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Avatar & Nama */}
      <div className="card">
        {/* Baris atas: avatar + info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-accent text-xl font-bold">{userData.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-white truncate">{userData.name}</h2>
            <p className="text-zinc-500 text-xs sm:text-sm truncate">{userData.email}</p>
            <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full border ${
              memberActive ? 'badge-active' : member ? 'badge-expired' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}>
              {memberActive ? 'Member Aktif' : member ? 'Expired' : 'Belum Jadi Member'}
            </span>
          </div>
        </div>

        {/* Baris bawah: tombol — selalu di bawah, tidak tabrakan */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-secondary text-sm flex items-center gap-2 w-fit px-4 py-2"
          >
            <PencilIcon className="w-4 h-4" /> Edit Profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm flex items-center gap-2 px-4 py-2 justify-center"
            >
              <CheckIcon className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={handleCancel}
              className="btn-secondary text-sm flex items-center gap-2 px-4 py-2 justify-center"
            >
              <XMarkIcon className="w-4 h-4" /> Batal
            </button>
          </div>
        )}
      </div>

        {/* Data Diri */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Data Diri</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nama Lengkap</label>
              {editing ? (
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
              ) : (
                <p className="text-white text-sm py-2.5">{userData.name}</p>
              )}
            </div>
            <div>
              <label className="label">Email</label>
              {editing ? (
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
              ) : (
                <p className="text-white text-sm py-2.5">{userData.email}</p>
              )}
            </div>
            <div>
              <label className="label">Nomor WhatsApp</label>
              {editing ? (
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
              ) : (
                <p className="text-white text-sm py-2.5">{userData.phone}</p>
              )}
            </div>
            <div>
              <label className="label">Total Equity Saham</label>
              {editing ? (
                <input value={form.equity} onChange={e => setForm({ ...form, equity: e.target.value })} className="input-field" placeholder="cth: Rp 10.000.000" />
              ) : (
                <p className="text-white text-sm py-2.5">{userData.equity || <span className="text-zinc-600">Tidak ada</span>}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Pengalaman di Dunia Saham</label>
              {editing ? (
                <input value={form.tradingExperience} onChange={e => setForm({ ...form, tradingExperience: e.target.value })} className="input-field" placeholder="cth: 2 tahun, Pemula, 6 bulan" />
              ) : (
                <p className="text-white text-sm py-2.5">{userData.tradingExperience || <span className="text-zinc-600">Tidak ada</span>}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Membership */}
        {member && (
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Status Membership</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">Kelas</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(member.classCategory)}`}>{member.classCategory}</span>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">Mulai</p>
                <p className="text-white text-sm font-medium">{formatDate(member.startDate)}</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-3 col-span-2 sm:col-span-1">
                <p className="text-zinc-500 text-xs mb-1">Berakhir</p>
                <p className={`text-sm font-medium ${memberActive ? 'text-accent' : 'text-accent-red'}`}>{formatDate(member.endDate)}</p>
              </div>
            </div>
          </div>
        )}

        {/* History Join Kelas */}
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">History Join Kelas</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-zinc-600 text-sm mb-4">Kamu belum pernah bergabung ke kelas manapun.</p>
              <Link to="/#pricing" className="btn-primary text-sm inline-block">Lihat Paket Kelas</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div key={tx._id} className="flex items-center justify-between bg-surface-2 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.classCategory} Class</p>
                      <p className="text-zinc-500 text-xs">{formatDate(tx.approvedAt || tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-accent text-sm font-bold">{formatCurrency(tx.amount)}</p>
                    <span className="badge-active text-xs">Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aksi cepat */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/payment-status" className="card text-center hover:border-accent/40 transition-colors cursor-pointer">
            <p className="text-white text-sm font-medium">Status Pembayaran</p>
          </Link>
          <Link to="/member" className="card text-center hover:border-accent/40 transition-colors cursor-pointer">
            <p className="text-white text-sm font-medium">Halaman Member</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;