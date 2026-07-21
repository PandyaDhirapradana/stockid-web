import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import Navbar from '../../components/shared/Navbar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDate, formatCurrency, getCategoryColor } from '../../utils/helpers';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      const res = await api.get(`/transactions?${params}`);
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleApprove = async (tx) => {
    // Cek apakah sudah settlement/capture
    const isReady = tx.midtransStatus === 'settlement' || tx.midtransStatus === 'capture';
    if (!isReady) {
      return Swal.fire({
        icon: 'warning',
        title: 'Pembayaran Belum Masuk',
        text: 'Transaksi ini belum dikonfirmasi oleh Midtrans. Tunggu hingga pembayaran user berhasil.',
        background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e',
      });
    }

    const result = await Swal.fire({
      title: 'Setujui transaksi?',
      html: `
        <p class="text-zinc-400">Nama: <strong class="text-white">${tx.name}</strong></p>
        <p class="text-zinc-400">Kelas: <strong class="text-white">${tx.classCategory}</strong></p>
        <p class="text-zinc-400">Jumlah: <strong class="text-green-400">${formatCurrency(tx.amount)}</strong></p>
      `,
      icon: 'question', showCancelButton: true,
      confirmButtonText: 'Ya, Setujui', cancelButtonText: 'Batal',
      confirmButtonColor: '#22c55e', cancelButtonColor: '#3f3f46',
      background: '#1e1e1e', color: '#fff',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await api.patch(`/transactions/${tx._id}/approve`);
      const { whatsappUrl } = res.data.data;
      await Swal.fire({
        icon: 'success', title: 'Transaksi disetujui!',
        html: `<p class="text-zinc-400">Membership berhasil diaktifkan untuk <strong class="text-white">${tx.name}</strong></p>`,
        showCancelButton: true,
        confirmButtonText: '💬 Kirim WA', cancelButtonText: 'Tutup',
        confirmButtonColor: '#22c55e', cancelButtonColor: '#3f3f46',
        background: '#1e1e1e', color: '#fff',
      }).then(r => { if (r.isConfirmed) window.open(whatsappUrl, '_blank'); });
      fetchTransactions();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  const handleReject = async (tx) => {
    const result = await Swal.fire({
      title: 'Tolak transaksi?', text: `Yakin ingin menolak transaksi dari ${tx.name}?`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Ya, Tolak', cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46',
      background: '#1e1e1e', color: '#fff',
    });
    if (!result.isConfirmed) return;
    try {
      await api.patch(`/transactions/${tx._id}/reject`);
      Swal.fire({ icon: 'success', title: 'Ditolak', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
      fetchTransactions();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  // Komponen card info status gabungan
  const StatusInfoCard = ({ tx }) => {
    const isSettled = tx.midtransStatus === 'settlement' || tx.midtransStatus === 'capture';
    const isWaiting = tx.midtransStatus === 'waiting';
    const isMidtransRejected = tx.midtransStatus === 'rejected';

    if (tx.status === 'approved') {
      return <span className="badge-active text-xs">Disetujui</span>;
    }

    if (tx.status === 'rejected') {
      return <span className="badge-expired text-xs">Ditolak</span>;
    }

    return (
      <div className="flex flex-col gap-1.5">
        {/* Status Midtrans */}
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border w-fit
          ${isSettled
            ? 'bg-green-900/30 border-green-800 text-green-400'
            : isMidtransRejected
            ? 'bg-red-900/30 border-red-800 text-red-400'
            : 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
          }`}>
          <span>{isSettled ? '💰' : isMidtransRejected ? '❌' : '⏳'}</span>
          <span>
            {isSettled ? 'Pembayaran Masuk'
              : isMidtransRejected ? 'Pembayaran Gagal'
              : 'Pending'}
          </span>
        </div>

        {/* Tombol simulasi settlement — untuk demo/sidang */}
        {isWaiting && (
          <button
            onClick={async () => {
              try {
                await api.patch(`/payment/dev/settle/${tx.orderId}`);
                fetchTransactions();
              } catch (err) {
                Swal.fire({
                  icon: 'error', title: 'Gagal simulasi',
                  text: err.response?.data?.message || 'Terjadi kesalahan',
                  background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e',
                });
              }
            }}
            className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-600 hover:border-zinc-400 transition-colors w-fit"
          >
            Konfirmasi
          </button>
        )}

        {/* Tombol approve/reject jika sudah settled */}
        {isSettled && (
          <div className="flex items-center gap-1">
            <button onClick={() => handleApprove(tx)}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-green-900/30 text-accent hover:bg-green-900/50 rounded-lg transition-colors border border-green-800">
              <CheckIcon className="w-3 h-3" /> Approve
            </button>
            <button onClick={() => handleReject(tx)}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-red-900/30 text-accent-red hover:bg-red-900/50 rounded-lg transition-colors border border-red-800">
              <XMarkIcon className="w-3 h-3" /> Tolak
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Manajemen Transaksi</h1>
          <p className="text-zinc-500 text-sm mt-1">{pagination.total || 0} total transaksi</p>
        </div>

        {/* Filter */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-field"
              placeholder="Cari nama / Order ID..."
            />
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field">
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Tabel */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner text="Memuat transaksi..." /></div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-zinc-600"><p>Tidak ada transaksi ditemukan</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th">Order ID</th>
                    <th className="th">Nama</th>
                    <th className="th hidden sm:table-cell">Kelas</th>
                    <th className="th hidden md:table-cell">Jumlah</th>
                    <th className="th hidden lg:table-cell">Tanggal</th>
                    <th className="th">Status & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {transactions.map(tx => (
                    <tr key={tx._id} className="tr-hover">
                      <td className="td font-mono text-xs text-zinc-400">{tx.orderId?.slice(0, 15)}...</td>
                      <td className="td">
                        <div>
                          <p className="font-medium text-white">{tx.name}</p>
                          <p className="text-xs text-zinc-500">{tx.phone}</p>
                        </div>
                      </td>
                      <td className="td hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(tx.classCategory)}`}>
                          {tx.classCategory}
                        </span>
                      </td>
                      <td className="td hidden md:table-cell text-accent font-medium">{formatCurrency(tx.amount)}</td>
                      <td className="td hidden lg:table-cell text-zinc-400">{formatDate(tx.createdAt)}</td>
                      <td className="td">
                        <StatusInfoCard tx={tx} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
    </div>
  );
};

export default TransactionsPage;