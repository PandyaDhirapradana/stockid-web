import React, { useEffect, useState } from 'react';
import { UsersIcon, CheckCircleIcon, XCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import StatCard from '../../components/shared/StatCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Navbar from '../../components/shared/Navbar';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-2 border border-zinc-700 rounded-lg p-3">
        <p className="text-zinc-400 text-xs">{label}</p>
        <p className="text-accent font-bold">{payload[0].value} anggota</p>
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, txRes] = await Promise.all([
          api.get('/members/stats'),
          api.get('/transactions?status=pending&limit=1'),
        ]);
        setStats(statsRes.data.data);
        setPendingCount(txRes.data.pagination?.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Selamat datang admin Stock ID</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Memuat data..." /></div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Anggota" value={stats?.total || 0} icon={UsersIcon} color="blue" />
              <StatCard title="Anggota Aktif" value={stats?.active || 0} icon={CheckCircleIcon} color="accent" subtitle="Membership aktif" />
              <StatCard title="Anggota Kadaluarsa" value={stats?.expired || 0} icon={XCircleIcon} color="red" />
              <StatCard title="Transaksi Pending" value={pendingCount} icon={CreditCardIcon} color="yellow" subtitle="Perlu persetujuan" />
            </div>

            {/* Chart */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-6">Pertumbuhan Anggota (6 Bulan Terakhir)</h2>
              {stats?.monthlyGrowth?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.monthlyGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-zinc-600">
                  <p className="text-sm">Belum ada data pertumbuhan</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;