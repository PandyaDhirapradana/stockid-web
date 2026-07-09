import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useUserAuth } from '../../context/UserAuthContext';
import { formatDate, formatCurrency, getCategoryColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const PaymentStatusPage = () => {
  const { user } = useUserAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/user/auth/payment-status');
        setTransactions(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statusBadge = (s) => {
    if (s === 'approved') return <span className="badge-active">Disetujui</span>;
    if (s === 'rejected') return <span className="badge-expired">Ditolak</span>;
    return <span className="badge-pending">Pending</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="text-zinc-500 hover:text-white text-sm">Kembali</Link>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Status Pembayaran</h1>
        <p className="text-zinc-500 text-sm mb-6">Halo <span className="text-white">{user?.name}</span>, berikut riwayat transaksi kamu</p>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner text="Memuat data..." /></div>
        ) : transactions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-zinc-500">Belum ada transaksi</p>
            <Link to="/#pricing" className="btn-primary mt-4 inline-block text-sm">Pilih Paket</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(tx => (
              <div key={tx._id} className="card border border-zinc-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{tx.classCategory} Class</p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{tx.orderId}</p>
                  </div>
                  {statusBadge(tx.status)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs">Jumlah</p>
                    <p className="text-accent font-bold">{formatCurrency(tx.amount)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Tanggal</p>
                    <p className="text-zinc-300">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Kelas</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(tx.classCategory)}`}>{tx.classCategory}</span>
                  </div>
                </div>
                {tx.status === 'approved' && (
                  <div className="mt-3 pt-3 border-t border-zinc-700">
                    <Link to="/member" className="text-sm text-accent hover:underline">Lihat status membership anda</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;