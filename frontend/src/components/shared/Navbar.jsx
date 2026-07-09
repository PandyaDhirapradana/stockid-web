import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, UsersIcon, CreditCardIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, XMarkIcon, ChartBarIcon, PaintBrushIcon,
} from '@heroicons/react/24/outline';
import Logo from './Logo';

const Navbar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/admin/members', label: 'Anggota', icon: UsersIcon },
    { path: '/admin/transactions', label: 'Transaksi', icon: CreditCardIcon },
    { path: '/admin/customize', label: 'Kustomisasi', icon: PaintBrushIcon },
    { path: '/member', label: 'Halaman Member', icon: ChartBarIcon, external: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin/dashboard" className="flex items-center">
            <Logo size="md" showText={true} />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} target={item.external ? '_blank' : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path) ? 'bg-accent/20 text-accent' : 'text-zinc-400 hover:text-white hover:bg-surface-2'}`}>
                <item.icon className="w-4 h-4" />{item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {admin && <span className="hidden sm:block text-xs text-zinc-500">{admin.name} · <span className="text-accent">{admin.role}</span></span>}
            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-sm text-zinc-400 hover:text-accent-red transition-colors duration-200"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-zinc-400 hover:text-white">
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-surface animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} target={item.external ? '_blank' : undefined} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path) ? 'bg-accent/20 text-accent' : 'text-zinc-400 hover:text-white hover:bg-surface-2'}`}>
                <item.icon className="w-5 h-5" />{item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent-red w-full">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;