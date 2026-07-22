import React, { useEffect, useState, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import Navbar from '../../components/shared/Navbar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDate, isActive, getCategoryColor } from '../../utils/helpers';

const CATEGORIES = [
  'Paket Screener',
  'Paket Kelas 1 Bulan',
  'Paket Kelas 2 Bulan',
  'Paket Kelas 3 Bulan',
  'Paket Kelas 6 Bulan',
  'Paket Kelas 1 Tahun',
  // Legacy (jika ada data lama)
  'Basic', 'Intermediate', 'Advanced', 'VIP',
];

const UserDataSection = ({ phone }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/admin/user-by-phone/${phone}`);
        setUserData(res.data.data);
      } catch {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [phone]);

  if (loading) return <div className="text-center py-2"><span className="text-zinc-600 text-xs">Memuat data akun...</span></div>;
  if (!userData) return <div className="bg-surface-2 rounded-lg p-3 text-xs text-zinc-600">Tidak ada akun user terdaftar untuk nomor ini.</div>;

  return (
    <div className="bg-surface-2 rounded-lg p-3 space-y-2">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Data Akun User</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><p className="text-zinc-600">Email</p><p className="text-white">{userData.email}</p></div>
        <div><p className="text-zinc-600">Equity</p><p className="text-white">{userData.equity || 'Tidak ada'}</p></div>
        <div className="col-span-2"><p className="text-zinc-600">Pengalaman Saham</p><p className="text-white">{userData.tradingExperience || 'Tidak ada'}</p></div>
      </div>
    </div>
  );
};

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', classCategory: 'Basic', startDate: new Date().toISOString().split('T')[0], durationDays: 30, reason: '' });
  const [extendData, setExtendData] = useState({ durationDays: 30, reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showBulkExtend, setShowBulkExtend] = useState(false);
  const [bulkExtendData, setBulkExtendData] = useState({ durationDays: 30, reason: '' });
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState(null);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      const res = await api.get(`/members?${params}`);
      setMembers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const openCreate = () => {
    setEditMember(null);
    setFormData({ name: '', phone: '', classCategory: 'Basic', startDate: new Date().toISOString().split('T')[0], durationDays: 30, reason: '' });
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditMember(member);
    setFormData({ name: member.name, phone: member.phone, classCategory: member.classCategory, startDate: '', durationDays: 0, reason: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editMember) {
        await api.put(`/members/${editMember._id}`, { name: formData.name, phone: formData.phone, classCategory: formData.classCategory });
        Swal.fire({ icon: 'success', title: 'Anggota diperbarui!', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/members', formData);
        Swal.fire({ icon: 'success', title: 'Anggota ditambahkan!', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e', timer: 2000, showConfirmButton: false });
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Terjadi kesalahan', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (member) => {
    const result = await Swal.fire({
      title: 'Hapus anggota?', text: `Yakin ingin menghapus ${member.name}?`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal', confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46',
      background: '#1e1e1e', color: '#fff',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/members/${member._id}`);
      Swal.fire({ icon: 'success', title: 'Dihapus!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
      fetchMembers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  const handleBulkExtend = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: 'Perpanjang semua member aktif?',
      text: `Semua member aktif akan diperpanjang ${bulkExtendData.durationDays} hari.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Ya, perpanjang semua',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#22c55e', cancelButtonColor: '#3f3f46',
      background: '#1e1e1e', color: '#fff',
    });
    if (!result.isConfirmed) return;

    setBulkSubmitting(true);
    try {
      const res = await api.patch('/members/extend-all', bulkExtendData);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res.data.message,
        background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e',
      });
      setShowBulkExtend(false);
      fetchMembers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/members/${selectedMember._id}/extend`, extendData);
      Swal.fire({ icon: 'success', title: 'Durasi diperpanjang!', background: '#1e1e1e', color: '#fff', timer: 2000, showConfirmButton: false });
      setShowExtendModal(false);
      fetchMembers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async (useFilter) => {
    try {
      let url = '/members/export';
      if (useFilter) url += `?month=${exportMonth}&year=${exportYear}`;

      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;

      const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
      const fileName = useFilter
        ? `members-${monthNames[exportMonth - 1]}-${exportYear}.xlsx`
        : `members-all-${Date.now()}.xlsx`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportModal(false);
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal export', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Manajemen Anggota</h1>
            <p className="text-zinc-500 text-sm mt-1">{pagination.total || 0} total anggota</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowExportModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export Excel
            </button>
            <button onClick={() => setShowBulkExtend(true)} className="btn-secondary flex items-center gap-2 text-sm">
              Perpanjang Semua
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
              <PlusIcon className="w-4 h-4" /> Tambah Anggota
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={search} onChange={handleSearch} className="input-field" placeholder="Cari nama / nomor HP..." />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field">
              <option value="">Semua Kelas</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="expired">Kadaluarsa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner text="Memuat anggota..." /></div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <UsersIconPlaceholder />
              <p className="mt-3">Tidak ada anggota ditemukan</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th">Nama</th>
                    <th className="th hidden sm:table-cell">WhatsApp</th>
                    <th className="th hidden md:table-cell">Kelas</th>
                    <th className="th">Berakhir</th>
                    <th className="th">Status</th>
                    <th className="th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {members.map((member) => {
                    const active = isActive(member.endDate);
                    return (
                      <tr key={member._id} className="tr-hover">
                        <td className="td font-medium">{member.name}</td>
                        <td className="td hidden sm:table-cell text-zinc-400">{member.phone}</td>
                        <td className="td hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(member.classCategory)}`}>
                            {member.classCategory}
                          </span>
                        </td>
                        <td className="td text-zinc-400">{formatDate(member.endDate)}</td>
                        <td className="td">
                          <span className={active ? 'badge-active' : 'badge-expired'}>
                            {active ? 'Aktif' : 'Kadaluarsa'}
                          </span>
                        </td>
                        <td className="td">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelectedMember(member); setShowHistoryModal(true); }} className="p-1.5 text-zinc-500 hover:text-accent transition-colors" title="Riwayat"><ClockIcon className="w-4 h-4" /></button>
                            <button onClick={() => { setDetailMember(member); setShowDetailModal(true); }}
                              className="p-1.5 text-zinc-500 hover:text-blue-400 transition-colors" title="Detail">
                              👁
                            </button>
                            <button onClick={() => { setSelectedMember(member); setExtendData({ durationDays: 30, reason: '' }); setShowExtendModal(true); }} className="p-1.5 text-zinc-500 hover:text-accent transition-colors" title="Perpanjang">+</button>
                            <button onClick={() => openEdit(member)} className="p-1.5 text-zinc-500 hover:text-accent transition-colors" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(member)} className="p-1.5 text-zinc-500 hover:text-accent-red transition-colors" title="Hapus"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-500">Halaman {pagination.page} dari {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3">← Prev</button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary text-sm py-1.5 px-3">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal title={editMember ? 'Edit Anggota' : 'Tambah Anggota'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nama Lengkap</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Nama anggota" required />
            </div>
            <div>
              <label className="label">No. WhatsApp</label>
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" placeholder="08xxxxxxxxxx" required />
            </div>
            <div>
              <label className="label">Kelas</label>
              <select value={formData.classCategory} onChange={(e) => setFormData({ ...formData, classCategory: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {!editMember && (
              <>
                <div>
                  <label className="label">Tanggal Mulai</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="label">Durasi (hari)</label>
                  <input type="number" value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })} className="input-field" min="1" required />
                </div>
                <div>
                  <label className="label">Keterangan</label>
                  <input value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="input-field" placeholder="Opsional" />
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Extend Modal */}
      {showExtendModal && selectedMember && (
        <Modal title={`Perpanjang: ${selectedMember.name}`} onClose={() => setShowExtendModal(false)}>
          <form onSubmit={handleExtend} className="space-y-4">
            <div>
              <label className="label">Tambah Durasi (hari)</label>
              <input type="number" value={extendData.durationDays} onChange={(e) => setExtendData({ ...extendData, durationDays: parseInt(e.target.value) })} className="input-field" min="1" required />
            </div>
            <div>
              <label className="label">Keterangan</label>
              <input value={extendData.reason} onChange={(e) => setExtendData({ ...extendData, reason: e.target.value })} className="input-field" placeholder="Alasan perpanjangan" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowExtendModal(false)} className="btn-secondary flex-1">Batal</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Menyimpan...' : 'Perpanjang'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedMember && (
        <Modal title={`Riwayat: ${selectedMember.name}`} onClose={() => setShowHistoryModal(false)}>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {selectedMember.durationHistory?.length > 0 ? selectedMember.durationHistory.map((h, i) => (
              <div key={i} className="bg-surface-2 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-accent font-medium">+{h.addedDays} hari</span>
                  <span className="text-zinc-500 text-xs">{formatDate(h.createdAt)}</span>
                </div>
                <p className="text-zinc-300 mt-1">Berakhir: {formatDate(h.newEndDate)}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{h.reason} · oleh {h.addedBy}</p>
              </div>
            )) : <p className="text-zinc-500 text-center py-4">Tidak ada riwayat</p>}
          </div>
          <button onClick={() => setShowHistoryModal(false)} className="btn-secondary w-full mt-4">Tutup</button>
        </Modal>
      )}

      {/*Detail Member Modal*/}
      {showDetailModal && detailMember && (
        <Modal title={`Detail: ${detailMember.name}`} onClose={() => setShowDetailModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">Nama</p>
                <p className="text-white font-medium">{detailMember.name}</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">WhatsApp</p>
                <p className="text-white font-medium">{detailMember.phone}</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">Kelas</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(detailMember.classCategory)}`}>
                  {detailMember.classCategory}
                </span>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">Status</p>
                <span className={isActive(detailMember.endDate) ? 'badge-active' : 'badge-expired'}>
                  {isActive(detailMember.endDate) ? 'Aktif' : 'Expired'}
                </span>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">Mulai</p>
                <p className="text-white text-xs">{formatDate(detailMember.startDate)}</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1">Berakhir</p>
                <p className={`text-xs font-medium ${isActive(detailMember.endDate) ? 'text-accent' : 'text-accent-red'}`}>
                  {formatDate(detailMember.endDate)}
                </p>
              </div>
            </div>

            {/* Data dari User account jika ada */}
            <UserDataSection phone={detailMember.phone} />

            <button onClick={() => setShowDetailModal(false)} className="btn-secondary w-full">Tutup</button>
          </div>
        </Modal>
      )}

      {showExportModal && (
        <Modal title="📥 Export Data Member" onClose={() => setShowExportModal(false)}>
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">Pilih metode export:</p>

            {/* Export semua data */}
            <button onClick={() => handleExport(false)}
              className="w-full bg-surface-2 border border-zinc-600 hover:border-accent rounded-xl p-4 text-left transition-colors group">
              <p className="text-white font-medium group-hover:text-accent">Semua Data</p>
              <p className="text-zinc-500 text-xs mt-1">Export seluruh member tanpa filter</p>
            </button>

            {/* Export per bulan */}
            <div className="bg-surface-2 border border-zinc-600 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-white font-medium mb-3">Filter per Bulan</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Bulan</label>
                    <select
                      value={exportMonth}
                      onChange={e => setExportMonth(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
                        .map((name, i) => (
                          <option key={i + 1} value={i + 1}>{name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tahun</label>
                    <select
                      value={exportYear}
                      onChange={e => setExportYear(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={() => handleExport(true)} className="btn-primary w-full">
                ⬇ Export Bulan Ini
              </button>
            </div>

            <button onClick={() => setShowExportModal(false)} className="btn-secondary w-full">Batal</button>
          </div>
        </Modal>
      )}

      {showBulkExtend && (
        <Modal title="Perpanjang Semua Member Aktif" onClose={() => setShowBulkExtend(false)}>
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 mb-4">
            <p className="text-yellow-400 text-xs">⚠️ Ini akan memperpanjang durasi SEMUA member yang saat ini masih aktif. Member expired tidak terpengaruh.</p>
          </div>
          <form onSubmit={handleBulkExtend} className="space-y-4">
            <div>
              <label className="label">Tambah Durasi (hari)</label>
              <input type="number" value={bulkExtendData.durationDays}
                onChange={e => setBulkExtendData({ ...bulkExtendData, durationDays: parseInt(e.target.value) })}
                className="input-field" min="1" required />
            </div>
            <div>
              <label className="label">Keterangan / Alasan</label>
              <textarea value={bulkExtendData.reason}
                onChange={e => setBulkExtendData({ ...bulkExtendData, reason: e.target.value })}
                className="input-field" rows={3}
                placeholder="cth: Bonus member aktif bulan ini, kompensasi downtime, dll" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowBulkExtend(false)} className="btn-secondary flex-1">Batal</button>
              <button type="submit" disabled={bulkSubmitting} className="btn-primary flex-1">
                {bulkSubmitting ? 'Memproses...' : 'Perpanjang Semua'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const UsersIconPlaceholder = () => (
  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
    <span className="text-zinc-600 text-xl">👥</span>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-surface border border-zinc-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
      <div className="flex items-center justify-between p-5 border-b border-zinc-700">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl leading-none">✕</button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default MembersPage;