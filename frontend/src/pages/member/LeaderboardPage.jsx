import React, { useEffect, useState, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDateShort, getRemainingTime, getCategoryColor, truncatePhone } from '../../utils/helpers';
import { useUserAuth } from '../../context/UserAuthContext';
import BuyClassDropdown from '../../components/member/BuyClassDropdown';
import Logo from '../../components/shared/Logo';

const SORT_OPTIONS = [
  { value: 'longest', label: 'Terlama Aktif' },
  { value: 'shortest', label: '⏱ Hampir Expired' },
  { value: 'alphabetical', label: 'Sesuai Abjad' },
];

const PIE_COLORS = ['#22c55e', '#ef4444'];

const CountdownCell = ({ endDate }) => {
  const [remaining, setRemaining] = useState(getRemainingTime(endDate));
  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemainingTime(endDate)), 60000);
    return () => clearInterval(interval);
  }, [endDate]);
  if (remaining.expired) return <span className="text-accent-red font-mono text-xs">Expired</span>;
  return <span className="text-accent font-mono text-xs">{remaining.text}</span>;
};

const LeaderboardPage = () => {
  const { user, loading: userLoading } = useUserAuth();
  const navigate = useNavigate();

  // ✅ SEMUA useState harus di dalam komponen ini
  const [showBuyClass, setShowBuyClass] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('longest');
  const [page, setPage] = useState(1);
  const searchTimeout = useRef(null);

  const fetchData = useCallback(async (searchVal, sortVal, pageVal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: sortVal, page: pageVal, limit: 20 });
      if (searchVal) params.append('search', searchVal);
      const res = await api.get(`/leaderboard?${params}`);
      setMembers(res.data.data);
      setStats(res.data.stats);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err.response?.status === 403) setAccessDenied(true);
      if (err.response?.status === 401) navigate('/login', { state: { from: '/member' } });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (userLoading) return;
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    const hasToken = !!user || !!adminToken || !!userToken;
    if (!hasToken) {
      navigate('/login', { state: { from: '/member' } });
      return;
    }
    fetchData(search, sort, page);
  }, [userLoading, sort, page]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchData(val, sort, 1);
    }, 400);
  };

  const pieData = stats ? [
    { name: 'Aktif', value: stats.active },
    { name: 'Kadaluarsa', value: stats.expired },
  ] : [];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat..." />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak</h2>
          <p className="text-zinc-400 text-sm mb-6">Anda bukan member aktif atau masa aktif membership telah habis.</p>
          <a href="/#pricing" className="btn-primary inline-block">Perpanjang Membership</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            {/* Logo & Judul */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Logo size="sm" showText={false} />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-2xl font-bold text-white truncate">
                  Stock <span className="text-accent"> ID</span> - Halaman Member
                </h1>
                <p className="text-zinc-500 text-xs hidden sm:block">
                  Status membership anggota aktif
                </p>
              </div>
            </div>

            {/* Tombol — Teks tetap muncul di mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/modules"
                className="flex items-center gap-1 bg-surface-2 border border-zinc-600 hover:border-accent text-zinc-300 hover:text-accent rounded-lg transition-colors
                  text-[11px] sm:text-sm py-1.5 px-2 sm:py-2 sm:px-4"
              >
                <span>Materi</span>
              </Link>
              <button
                onClick={() => setShowBuyClass(true)}
                className="flex items-center gap-1 btn-primary
                  text-[11px] sm:text-sm py-1.5 px-2 sm:py-2 sm:px-4"
              >
                <span>Perpanjang</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BuyClass Modal */}
      {showBuyClass && <BuyClassDropdown onClose={() => setShowBuyClass(false)} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-zinc-500 mt-1">Total Anggota</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl md:text-3xl font-bold text-accent">{stats.active}</p>
              <p className="text-xs text-zinc-500 mt-1">Aktif</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl md:text-3xl font-bold text-accent-red">{stats.expired}</p>
              <p className="text-xs text-zinc-500 mt-1">Kadaluarsa</p>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Distribusi Status</h3>
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Legend formatter={(value) => <span className="text-zinc-400 text-xs">{value}</span>} />
                    <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-zinc-600 text-sm text-center py-8">Belum ada data</p>}
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Pertumbuhan Bulanan</h3>
              {stats.monthlyGrowth?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.monthlyGrowth} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-zinc-600 text-sm text-center py-8">Belum ada data</p>}
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field flex-1"
              placeholder="Cari nama anggota..."
            />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-field sm:w-48"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" text="Memuat leaderboard..." /></div>
        ) : members.length === 0 ? (
          <div className="card text-center py-12 text-zinc-600">
            <p className="text-4xl mb-3">🔍</p>
            <p>Tidak ada anggota ditemukan</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {members.map((member, i) => {
                const active = new Date() < new Date(member.endDate);
                return (
                  <div key={member._id} className={`card border-2 transition-all duration-200 animate-fade-in ${active ? 'glow-active' : 'glow-expired'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? 'bg-accent/20 text-accent' : 'bg-red-900/20 text-accent-red'}`}>
                          {i + 1 + (page - 1) * 20}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{member.name}</p>
                          <p className="text-xs text-zinc-500">{truncatePhone(member.phone)}</p>
                        </div>
                      </div>
                      <span className={active ? 'badge-active' : 'badge-expired'}>{active ? 'Aktif' : 'Expired'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-zinc-600">Kelas</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(member.classCategory)}`}>{member.classCategory}</span>
                      </div>
                      <div>
                        <p className="text-zinc-600">Sisa Waktu</p>
                        <CountdownCell endDate={member.endDate} />
                      </div>
                      <div className="col-span-2">
                        <p className="text-zinc-600">Berakhir</p>
                        <p className="text-zinc-300">{formatDateShort(member.endDate)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="card hidden md:block">
              <div className="table-responsive">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th className="th w-12">#</th>
                      <th className="th">Nama</th>
                      <th className="th">WhatsApp</th>
                      <th className="th">Kelas</th>
                      <th className="th">Berakhir</th>
                      <th className="th">Sisa Waktu</th>
                      <th className="th">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {members.map((member, i) => {
                      const active = new Date() < new Date(member.endDate);
                      return (
                        <tr key={member._id} className={`tr-hover ${active ? 'border-l-2 border-l-accent/30' : 'border-l-2 border-l-red-800/30'}`}>
                          <td className="td text-zinc-600 font-mono">{i + 1 + (page - 1) * 20}</td>
                          <td className="td font-medium text-white">{member.name}</td>
                          <td className="td text-zinc-400 font-mono text-xs">{truncatePhone(member.phone)}</td>
                          <td className="td">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(member.classCategory)}`}>{member.classCategory}</span>
                          </td>
                          <td className="td text-zinc-400">{formatDateShort(member.endDate)}</td>
                          <td className="td"><CountdownCell endDate={member.endDate} /></td>
                          <td className="td">
                            <span className={active ? 'badge-active' : 'badge-expired'}>{active ? 'Aktif' : 'Expired'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4">← Prev</button>
                <span className="text-zinc-400 text-sm">{page} / {pagination.pages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary text-sm py-2 px-4">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;