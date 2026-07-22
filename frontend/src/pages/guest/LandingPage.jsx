import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import { playSelectSound, playSuccessSound } from '../../utils/sounds';
import { formatCurrency } from '../../utils/helpers';
import { useUserAuth } from '../../context/UserAuthContext';
import LandingNavbar from '../../components/shared/LandingNavbar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Logo from '../../components/shared/Logo';

const PRICING_INFO = {
  'Paket Screener': {
    price: 70000, originalPrice: 100000, discount: 30,
    durationDays: 0, color: 'blue', isScreener: true,
    features: ['Screener untuk analisa saham pilihan'],
  },
  'Paket Kelas 1 Bulan': {
    price: 130000, originalPrice: 200000, discount: 35,
    durationDays: 30, color: 'purple',
    features: ['Akses kelas 30 hari', 'Materi analisa teknikal & fundamental', 'Grup diskusi member', 'Sinyal trading harian'],
  },
  'Paket Kelas 2 Bulan': {
    price: 240000, originalPrice: 400000, discount: 40,
    durationDays: 60, color: 'orange',
    features: ['Akses kelas 60 hari', 'Materi analisa teknikal & fundamental', 'Grup diskusi member', 'Sinyal trading harian'],
  },
  'Paket Kelas 3 Bulan': {
    price: 330000, originalPrice: 600000, discount: 45,
    durationDays: 90, color: 'green', badge: 'TERPOPULER',
    features: ['Akses kelas 90 hari', 'Materi analisa teknikal & fundamental', 'Grup diskusi member', 'Sinyal trading harian'],
  },
  'Paket Kelas 6 Bulan': {
    price: 600000, originalPrice: 1200000, discount: 50,
    durationDays: 180, color: 'yellow',
    features: ['Akses kelas 180 hari', 'Materi analisa teknikal & fundamental', 'Grup diskusi member', 'Sinyal trading harian'],
  },
  'Paket Kelas 1 Tahun': {
    price: 1080000, originalPrice: 2400000, discount: 55,
    durationDays: 365, color: 'red',
    features: ['Akses kelas 365 hari', 'Materi analisa teknikal & fundamental', 'Grup diskusi member', 'Sinyal trading harian'],
  },
};

const colorMap = {
  blue:   { border: 'border-blue-700 hover:border-blue-500',     selected: 'border-blue-400 shadow-blue-500/20 shadow-xl',   badge: 'bg-blue-900/50 text-blue-300 border-blue-700',   discount: 'bg-blue-900/40 text-blue-300' },
  purple: { border: 'border-purple-700 hover:border-purple-500', selected: 'border-purple-400 shadow-purple-500/20 shadow-xl', badge: 'bg-purple-900/50 text-purple-300 border-purple-700', discount: 'bg-purple-900/40 text-purple-300' },
  orange: { border: 'border-orange-700 hover:border-orange-500', selected: 'border-orange-400 shadow-orange-500/20 shadow-xl', badge: 'bg-orange-900/50 text-orange-300 border-orange-700', discount: 'bg-orange-900/40 text-orange-300' },
  green:  { border: 'border-green-700 hover:border-green-500',   selected: 'border-green-400 shadow-green-500/20 shadow-xl',  badge: 'bg-green-900/50 text-green-300 border-green-700',  discount: 'bg-green-900/40 text-green-300' },
  yellow: { border: 'border-yellow-600 hover:border-yellow-400', selected: 'border-yellow-400 shadow-yellow-500/20 shadow-xl', badge: 'bg-yellow-900/50 text-yellow-300 border-yellow-700', discount: 'bg-yellow-900/40 text-yellow-300' },
  red:    { border: 'border-red-700 hover:border-red-500',       selected: 'border-red-400 shadow-red-500/20 shadow-xl',      badge: 'bg-red-900/50 text-red-300 border-red-700',       discount: 'bg-red-900/40 text-red-300' },
};

// ── COUNTDOWN COMPONENT ────────────────────────────────
const ClassCountdown = ({ startDate }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const start = new Date(startDate);
      const diff = now - start;
      if (diff < 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {[['Hari', time.days], ['Jam', time.hours], ['Menit', time.minutes], ['Detik', time.seconds]].map(([label, val]) => (
        <div key={label} className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-surface border border-zinc-700 rounded-xl flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-bold font-mono text-accent">{String(val).padStart(2, '0')}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
};

// ── SLIDER COMPONENT ───────────────────────────────────
const InfoSlider = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-2xl">
      {slides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === current ? 'opacity-100 translate-x-0' : i < current ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'}`}>
          {slide.imageUrl ? (
            <img src={slide.imageUrl} alt={slide.header} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-zinc-900 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">{slide.header}</h2>
            <p className="text-zinc-300 text-base md:text-lg max-w-xl">{slide.info}</p>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={() => { prev(); resetTimer(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all">‹</button>
      <button onClick={() => { next(); resetTimer(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all">›</button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); resetTimer(); }}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-accent w-6' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
};

// ── REVIEW SLIDER ──────────────────────────────────────
const ReviewSlider = ({ reviews }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => { setIsDragging(true); setStartX(e.pageX - trackRef.current.offsetLeft); setScrollLeft(trackRef.current.scrollLeft); };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - trackRef.current.offsetLeft; trackRef.current.scrollLeft = scrollLeft - (x - startX); };

  return (
    <div ref={trackRef} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
      className="flex gap-4 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {reviews.map((review, i) => (
        <div key={i} className="flex-shrink-0 w-80 h-[280px] bg-surface border border-zinc-700 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-1 mb-3 flex-shrink-0">
            {Array.from({ length: review.rating || 5 }).map((_, j) => <span key={j} className="text-accent-yellow text-sm">★</span>)}
          </div>
          {/* Area teks dengan scroll */}
          <div className="flex-1 overflow-y-auto mb-4 pr-1 custom-scroll">
            <p style={{ whiteSpace: 'pre-line' }} className="text-zinc-300 text-sm leading-relaxed">
              {review.message}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 border-t border-zinc-800 pt-4 mt-auto">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-sm font-bold">{review.name[0]}</span>
            </div>
            <p className="text-white text-sm font-medium truncate">{review.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── GAIN PHOTO SLIDER ──────────────────────────────────
// Ganti komponen GainSlider
const GainSlider = ({ photos, onImageClick }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setDragged(true);
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft - (x - startX);
  };

  return (
    <div
      ref={trackRef}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      className="flex gap-4 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {photos.map((photo, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-64 md:w-72 rounded-2xl overflow-hidden border border-zinc-700 cursor-pointer group"
          onClick={() => { if (!dragged) onImageClick(photo.imageUrl); }}
        >
          <div className="relative overflow-hidden">
            <img
              src={photo.imageUrl}
              alt={photo.caption || `Gain ${i + 1}`}
              className="w-full h-64 object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">🔍</span>
            </div>
          </div>
          {photo.caption && (
            <div className="p-3 bg-surface">
              <p className="text-xs text-zinc-400">{photo.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── MENTOR CARD ────────────────────────────────────────
// ── MENTOR CARD ────────────────────────────────────────
const MentorCard = ({ mentor }) => {
  const contactUrl = (type, value) => {
    const t = type.toLowerCase();
    if (t === 'whatsapp') { let n = value.replace(/\D/g, ''); if (n.startsWith('0')) n = '62' + n.slice(1); return `https://wa.me/${n}`; }
    if (t === 'instagram') return `https://instagram.com/${value.replace('@', '')}`;
    if (t === 'tiktok') return `https://tiktok.com/@${value.replace('@', '')}`;
    if (t === 'telegram') return `https://t.me/${value.replace('@', '')}`;
    if (t === 'sms') return `sms:${value}`;
    return value;
  };

  return (
    <div className="card max-w-sm mx-auto text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-accent/30">
        {mentor.imageUrl ? (
          <img src={mentor.imageUrl} alt={mentor.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-3xl font-bold">{mentor.name[0]}</span>
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
      <p className="text-accent text-sm mb-3">{mentor.role}</p>
      {mentor.equity && <p className="text-zinc-400 text-sm mb-1">Equity: <span className="text-white">{mentor.equity}</span></p>}
      {mentor.tradingStyle && <p className="text-zinc-400 text-sm mb-4">Trading Style: <span className="text-white">{mentor.tradingStyle}</span></p>}
      {mentor.contacts?.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {mentor.contacts.map((c, i) => (
            <a key={i} href={contactUrl(c.type, c.value)} target="_blank" rel="noopener noreferrer"
              className="flex items-center px-3 py-1.5 bg-surface-2 border border-zinc-600 rounded-full text-xs text-zinc-300 hover:text-white hover:border-accent transition-all">
              {c.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Komponen Lightbox — taruh sebelum LandingPage function
const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-2xl w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={src}
        alt="Full size"
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
};

// ── MAIN LANDING PAGE ──────────────────────────────────
const LandingPage = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [siteContent, setSiteContent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [gainPhotos, setGainPhotos] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [memberStats, setMemberStats] = useState({ total: 0, active: 0 });
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  // Tambahkan state di dalam LandingPage component
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = process.env.REACT_APP_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY || '');
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: user.name, phone: user.phone, email: user.email }));
  }, [user]);

  useEffect(() => {
    const fetchWithRetry = async (fn, retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try { return await fn(); }
        catch (err) {
          if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
          else throw err;
        }
      }
    };

    const fetchAll = async () => {
      try {
        const [contentRes, reviewsRes, gainsRes, mentorsRes, statsRes] = await Promise.all([
          fetchWithRetry(() => api.get('/content/site')),
          fetchWithRetry(() => api.get('/content/reviews')),
          fetchWithRetry(() => api.get('/content/gain-photos')),
          fetchWithRetry(() => api.get('/content/mentors')),
          fetchWithRetry(() => api.get('/members/stats')).catch(() => ({ data: { data: { total: 0, active: 0 } } })),
        ]);
        setSiteContent(contentRes.data.data);
        setReviews(reviewsRes.data.data);
        setGainPhotos(gainsRes.data.data);
        setMentors(mentorsRes.data.data);
        setMemberStats({
          total: statsRes.data.data?.total || 0,
          active: statsRes.data.data?.active || 0,
        });
      } catch (err) {
        console.error('Fetch gagal setelah retry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleSelectPackage = (pkg) => { setSelectedPackage(pkg); playSelectSound(); };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) {
      return Swal.fire({
        icon: 'info', title: 'Login Diperlukan', text: 'Silakan login atau daftar terlebih dahulu untuk melakukan pembayaran.',
        showCancelButton: true, confirmButtonText: 'Login', cancelButtonText: 'Daftar',
        confirmButtonColor: '#22c55e', cancelButtonColor: '#3f3f46', background: '#1e1e1e', color: '#fff',
      }).then(r => { if (r.isConfirmed) navigate('/login', { state: { from: '/' } }); else if (r.isDismissed && r.dismiss !== Swal.DismissReason.cancel) {} else navigate('/register'); });
    }
    if (!selectedPackage) return Swal.fire({ icon: 'warning', title: 'Pilih paket', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Data tidak lengkap', text: 'Nama, nomor HP, dan email wajib diisi.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }

    setPayLoading(true);
    try {
      const res = await api.post('/payment/create-transaction', {
        name: form.name.trim(), phone: form.phone.trim(),
        email: form.email.trim(), classCategory: selectedPackage,
      });
      const { snapToken } = res.data.data;

      window.snap.pay(snapToken, {
        onSuccess: () => {
          playSuccessSound();
          Swal.fire({
            icon: 'success', title: 'Pembayaran Berhasil!',
            html: `<p>Transaksi kamu sedang diproses.<br/>Cek email untuk bukti transaksi.<br/>Admin akan mengkonfirmasi dalam 1x24 jam.</p>`,
            background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e',
            confirmButtonText: 'Cek Status Pembayaran',
          }).then(r => { if (r.isConfirmed) navigate('/payment-status'); });
          setSelectedPackage(null);
        },
        onPending: () => Swal.fire({ icon: 'info', title: 'Pembayaran Pending', text: 'Selesaikan pembayaran kamu!', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' }),
        onError: () => Swal.fire({ icon: 'error', title: 'Pembayaran Gagal', text: 'Silakan coba lagi.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' }),
        onClose: () => {},
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Terjadi kesalahan.', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally { setPayLoading(false); }
  };

  const tickers = siteContent?.tickerStocks || ['BBRI +2.3%','BBCA +1.8%','TLKM -0.5%','ASII +3.1%','BMRI +2.7%','GOTO -1.2%','UNVR +0.9%','INDF +1.5%','PGAS +4.2%','KLBF +1.1%'];
  const tickerDouble = [...tickers, ...tickers, ...tickers];

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><LoadingSpinner size="lg" text="Memuat..." /></div>;

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* ── SECTION 1: HERO ── */}
      <section id="hero" className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Platform Edukasi Saham Terpercaya
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {siteContent?.heroTitle || 'Kuasai Pasar Saham'}<br /> <br />
            <span className="text-accent">Bersama Stock ID</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
            {siteContent?.heroSubtitle || 'Belajar analisa teknikal & fundamental dari mentor berpengalaman.'}
          </p>
          <button onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary inline-block px-10 py-4 text-base rounded-xl shadow-lg shadow-accent/30">
            {siteContent?.heroButtonText || 'Mulai Belajar'} 
          </button>
        </div>

        {/* Ticker */}
        <div className="border-y border-zinc-800 bg-surface py-2.5 overflow-hidden">
          <div className="flex gap-10 whitespace-nowrap animate-marquee">
            {tickerDouble.map((t, i) => (
              <span key={i} className={`text-sm font-mono font-medium shrink-0 ${t.includes('+') ? 'text-accent' : 'text-accent-red'}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: INFO SLIDER ── */}
      <section id="slider" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <InfoSlider slides={siteContent?.sliderSlides || []} />
      </section>

      {/* ── SECTION 3: ABOUT ── */}
      <section id="about" className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">{siteContent?.aboutHeader || 'Apa itu Stock ID VIP?'}</h2>
          <div className="space-y-4">
            {siteContent?.aboutParagraph1 && <p className="text-zinc-400 text-lg leading-relaxed">{siteContent.aboutParagraph1}</p>}
            {siteContent?.aboutParagraph2 && <p className="text-zinc-400 text-lg leading-relaxed">{siteContent.aboutParagraph2}</p>}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: BENEFITS ── */}
      <section id="benefits" className="py-16 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{siteContent?.benefitsHeader || 'Benefit apa saja yang didapat?'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(siteContent?.benefitsList || []).map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface border border-zinc-700 rounded-xl p-4 hover:border-accent/40 transition-colors">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-accent text-sm font-bold">{i + 1}</span>
                </div>
                <p className="text-zinc-300 text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: STATS ── */}
      <section id="stats" className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* Total Member — center vertikal di desktop */}
            <div className="card text-center md:flex md:flex-col md:items-center md:justify-center md:min-h-[160px]">
              <p className="text-4xl font-bold text-white mb-2">{memberStats.total}</p>
              <p className="text-zinc-500">Total Member</p>
            </div>

            {/* Total Member Aktif — center vertikal di desktop */}
            <div className="card text-center md:flex md:flex-col md:items-center md:justify-center md:min-h-[160px]">
              <p className="text-4xl font-bold text-accent mb-2">{memberStats.active}</p>
              <p className="text-zinc-500">Total Member Aktif</p>
            </div>

            {/* Countdown */}
            <div className="card text-center">
              <p className="text-sm text-zinc-500 mb-3">Kelas Sudah Berjalan Sejak</p>
              {siteContent?.statsStartDate && <ClassCountdown startDate={siteContent.statsStartDate} />}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 6: PRICING ── */}
      <section id="pricing" className="py-16 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Pilih Paket Membership</h2>
            <p className="text-zinc-500">Investasi terbaik untuk masa depan trading kamu</p>
          </div>

          {/* Grid 3 kolom untuk 6 paket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(PRICING_INFO).map(([key, pkg]) => {
              const colors = colorMap[pkg.color];
              const isSelected = selectedPackage === key;
              return (
                <div
                  key={key}
                  onClick={() => handleSelectPackage(key)}
                  className={`relative bg-surface border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200
                    ${isSelected ? colors.selected : colors.border}`}
                >
                  {/* Badge diskon di pojok kanan atas */}
                  <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${colors.discount}`}>
                    -{pkg.discount}%
                  </div>

                  {/* Centang jika dipilih */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-black text-xs">✓</span>
                    </div>
                  )}

                  <h3 className="text-base font-bold text-white mb-3 pr-12">{key}</h3>

                  {/* Harga */}
                  <div className="mb-1">
                    <p className="text-zinc-500 text-xs line-through">Harga Awal: {formatCurrency(pkg.originalPrice)}</p>
                    <p className="text-lg font-bold text-white">Harga Diskon: {formatCurrency(pkg.price)}</p>
                  </div>

                  {pkg.isScreener && (
                    <p className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-800 rounded px-2 py-1 mb-3">
                      Tanpa aktivasi membership
                    </p>
                  )}

                  {!pkg.isScreener && (
                    <p className="text-xs text-zinc-500 mb-3">{pkg.durationDays} hari akses</p>
                  )}

                  <ul className="space-y-1.5">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="text-accent mt-0.5 shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Free class button */}
          {siteContent?.freeClassLink && (
            <div className="text-center mb-8">
              <a href="https://chat.whatsapp.com/BpMVt0wI3v78aBYZWMau9p?s=cl&p=a&mlu=3" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent transition-colors border border-zinc-700 hover:border-accent/40 px-6 py-3 rounded-full">
                {siteContent.freeClassLabel || 'Atau mau join gratis? Klik disini!'}
              </a>
            </div>
          )}

          {/* Payment Form */}
          <div className="max-w-lg mx-auto">
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-5">Data Pendaftar</h3>
              {!user && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4 text-sm text-accent flex items-center gap-2">
                  <span>Silakan <Link to="/login" className="underline font-medium">login</Link> atau <Link to="/register" className="underline font-medium">daftar</Link> untuk melakukan pembayaran</span>
                </div>
              )}
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Nama lengkap" />
                </div>
                <div>
                  <label className="label">Nomor WhatsApp</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="08xxxxxxxxxx" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="email@kamu.com" />
                </div>
                {selectedPackage && (
                  <div className="bg-surface-2 rounded-lg p-4 border border-zinc-700 animate-fade-in">
                    <div className="flex justify-between"><span className="text-zinc-400 text-sm">Paket:</span><span className="text-white font-medium">{selectedPackage}</span></div>
                    <div className="flex justify-between mt-2"><span className="text-zinc-400 text-sm">Total:</span><span className="text-accent font-bold text-lg">{formatCurrency(PRICING_INFO[selectedPackage].price)}</span></div>
                  </div>
                )}
                <button type="submit" disabled={payLoading || !selectedPackage} className="btn-primary w-full py-3 text-base">
                  {payLoading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />Memproses...</span> : 'Bayar Sekarang'}
                </button>
                {!selectedPackage && <p className="text-center text-xs text-zinc-600">Pilih paket di atas terlebih dahulu</p>}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: REVIEWS ── */}
      {reviews.length > 0 && (
        <section id="reviews" className="py-16 px-4 sm:px-6" style={{ whiteSpace: 'pre-line' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10" style={{ whiteSpace: 'normal' }}>Ulasan Member</h2>
            <ReviewSlider reviews={reviews} />
          </div>
        </section>
      )}

      {/* ── SECTION 8: GAIN PHOTOS ── */}
      {gainPhotos.length > 0 && (
        <section id="gains" className="py-16 px-4 sm:px-6 bg-surface/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Gain Member</h2>
            
            <GainSlider photos={gainPhotos} onImageClick={(src) => setLightboxImg(src)} />
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxImg && <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}

      {/* ── SECTION 9: MENTOR ── */}
      {mentors.length > 0 && (
        <section id="mentor" className="py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Profil Mentor</h2>
            <div className={`grid gap-6 ${mentors.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {mentors.map(mentor => <MentorCard key={mentor._id} mentor={mentor} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 10: FOOTER ── */}
      <footer id="footer" className="border-t border-zinc-800 bg-surface py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-3">
                <Logo size="md" showText={true} />
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">{siteContent?.footerText || 'Platform edukasi saham terpercaya.'}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Navigasi</h4>
              <div className="space-y-2">
                {[['Beranda', '#hero'], ['Tentang', '#about'], ['Benefit', '#benefits'], ['Paket', '#pricing'], ['Ulasan', '#reviews'],  ['Gain Member', '#gains'], ['Mentor', '#mentor']].map(([label, href]) => (
                  <button key={href} onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
                    className="block text-zinc-500 hover:text-accent text-sm transition-colors">{label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Akun</h4>
              <div className="space-y-2">
                {user ? (
                  <>
                    <Link to="/profile" className="block text-zinc-500 hover:text-accent text-sm transition-colors">Profil Saya</Link>
                    <Link to="/payment-status" className="block text-zinc-500 hover:text-accent text-sm transition-colors">Status Pembayaran</Link>
                    <Link to="/member" className="block text-zinc-500 hover:text-accent text-sm transition-colors">Halaman Member</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block text-zinc-500 hover:text-accent text-sm transition-colors">Login</Link>
                    <Link to="/register" className="block text-zinc-500 hover:text-accent text-sm transition-colors">Daftar</Link>
                    <Link to="/login" className="block text-zinc-500 hover:text-accent text-sm transition-colors">Halaman Member</Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Stock ID. All rights reserved.</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-zinc-500 hover:text-accent transition-colors flex items-center gap-1">
              ↑ Kembali ke atas
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;