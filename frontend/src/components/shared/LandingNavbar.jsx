import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Logo from '../shared/Logo';

const NAV_ITEMS = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Tentang', href: '#about' },
  { label: 'Benefit', href: '#benefits' },
  { label: 'Paket', href: '#pricing' },
  { label: 'Ulasan', href: '#reviews' },
  { label: 'Gain Member', href: '#gains' },
  { label: 'Mentor', href: '#mentor' },
];

const LandingNavbar = () => {
  const { user, logout } = useUserAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-zinc-800 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" showText={true} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button key={item.href} onClick={() => scrollTo(item.href)}
                className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg text-accent text-sm hover:bg-accent/20 transition-colors">
                  <UserCircleIcon className="w-4 h-4" />
                  {user.name.split(' ')[0]}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface border border-zinc-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white transition-colors">
                      Profil Saya
                    </Link>
                    <Link to="/payment-status" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white transition-colors border-t border-zinc-700">
                      Status Pembayaran
                    </Link>
                    <Link to="/member" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white transition-colors border-t border-zinc-700">
                      Halaman Member
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-accent-red w-full text-left hover:bg-surface-2 transition-colors border-t border-zinc-700">
                      <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Daftar</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-zinc-400 hover:text-white">
            {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-surface/95 backdrop-blur-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map(item => (
              <button key={item.href} onClick={() => scrollTo(item.href)}
                className="flex w-full px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded-lg transition-colors">
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-zinc-700 space-y-2">
              {user ? (
                <>
                  <p className="px-3 text-xs text-zinc-600">Login sebagai {user.name}</p>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex w-full px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded-lg transition-colors">Profil Saya</Link>
                  <Link to="/payment-status" onClick={() => setMobileOpen(false)} className="flex w-full px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded-lg transition-colors">Status Pembayaran</Link>
                  <Link to="/member" onClick={() => setMobileOpen(false)} className="flex w-full px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded-lg transition-colors">Halaman Member</Link>
                  <button onClick={handleLogout} className="flex w-full px-3 py-2.5 text-sm text-accent-red hover:bg-surface-2 rounded-lg transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-center text-sm block">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm block">Daftar</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;