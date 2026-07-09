import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useUserAuth } from '../../context/UserAuthContext';
import { formatCurrency } from '../../utils/helpers';
import { playSelectSound, playSuccessSound } from '../../utils/sounds';
import Swal from 'sweetalert2';

const PRICING_INFO = {
  'Paket Screener':      { price: 70000,   originalPrice: 100000,  discount: 30, durationDays: 0,   isScreener: true },
  'Paket Kelas 1 Bulan': { price: 130000,  originalPrice: 200000,  discount: 35, durationDays: 30 },
  'Paket Kelas 2 Bulan': { price: 240000,  originalPrice: 400000,  discount: 40, durationDays: 60 },
  'Paket Kelas 3 Bulan': { price: 330000,  originalPrice: 600000,  discount: 45, durationDays: 90 },
  'Paket Kelas 6 Bulan': { price: 600000,  originalPrice: 1200000, discount: 50, durationDays: 180 },
  'Paket Kelas 1 Tahun': { price: 1080000, originalPrice: 2400000, discount: 55, durationDays: 365 },
};

const BuyClassDropdown = ({ onClose }) => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap
    const existing = document.getElementById('midtrans-snap');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'midtrans-snap';
      script.src = process.env.REACT_APP_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY || '');
      document.head.appendChild(script);
    }
  }, []);

  const handleBuy = async () => {
    if (!selectedPackage) return;
    if (!user) {
      Swal.fire({ icon: 'warning', title: 'Login diperlukan', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payment/create-transaction', {
        name: user.name,
        phone: user.phone,
        email: user.email,
        classCategory: selectedPackage,
      });
      const { snapToken } = res.data.data;

      window.snap.pay(snapToken, {
        onSuccess: () => {
          playSuccessSound();
          Swal.fire({
            icon: 'success', title: '🎉 Pembayaran Berhasil!',
            html: '<p>Transaksi sedang diproses. Admin akan konfirmasi dalam 1x24 jam.</p>',
            background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e',
            confirmButtonText: 'Cek Status',
          }).then(r => { if (r.isConfirmed) navigate('/payment-status'); });
          onClose();
        },
        onPending: () => Swal.fire({ icon: 'info', title: 'Pembayaran Pending', text: 'Selesaikan pembayaran kamu!', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' }),
        onError: () => Swal.fire({ icon: 'error', title: 'Pembayaran Gagal', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' }),
        onClose: () => {},
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Terjadi kesalahan', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-zinc-700 rounded-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-white">Perpanjang / Beli Kelas</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-3">
          {/* Pilih paket */}
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {Object.entries(PRICING_INFO).map(([key, pkg]) => (
              <button
                key={key}
                onClick={() => { setSelectedPackage(key); playSelectSound(); }}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200
                  ${selectedPackage === key ? 'border-accent bg-accent/10' : 'border-zinc-700 hover:border-zinc-500'}`}
              >
                <p className="text-white font-semibold text-xs leading-tight mb-1">{key}</p>
                <p className="text-zinc-500 text-xs line-through">{formatCurrency(pkg.originalPrice)}</p>
                <p className="text-accent font-bold text-sm">{formatCurrency(pkg.price)}</p>
                {pkg.isScreener && <p className="text-yellow-400 text-xs mt-1">Tanpa membership</p>}
                {!pkg.isScreener && <p className="text-zinc-600 text-xs">{pkg.durationDays} hari</p>}
              </button>
            ))}
          </div>

          {/* Info user */}
          {user && (
            <div className="bg-surface-2 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
              <p>{user.name}</p>
              <p>{user.phone}</p>
              <p>{user.email}</p>
            </div>
          )}

          {/* Ringkasan */}
          {selectedPackage && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex justify-between items-center animate-fade-in">
              <span className="text-zinc-300 text-sm">Total:</span>
              <span className="text-accent font-bold text-lg">{formatCurrency(PRICING_INFO[selectedPackage].price)}</span>
            </div>
          )}

          <button onClick={handleBuy} disabled={!selectedPackage || loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyClassDropdown;