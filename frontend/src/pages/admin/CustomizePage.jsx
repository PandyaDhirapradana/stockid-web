import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/shared/Navbar';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const AutoResizeTextarea = ({ value, onChange, placeholder, className }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.max(80, ref.current.scrollHeight) + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={{ resize: 'none', overflow: 'hidden', minHeight: '80px', maxHeight: '200px', overflowY: 'auto' }}
    />
  );
};

const CustomizePage = () => {
  const [content, setContent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [gainPhotos, setGainPhotos] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('site');
  const gainFileRef = useRef();
  const mentorFileRef = useRef();

  // Module states
  const [moduleFile, setModuleFile] = useState(null);
  const [newModule, setNewModule] = useState({ title: '', description: '', order: 0 });
  const [moduleUploading, setModuleUploading] = useState(false);

  // Review states
  const [newReview, setNewReview] = useState({ name: '', positive: '', critique: '', suggestion: '', rating: 5 });

  // Mentor states
  const [newMentor, setNewMentor] = useState({ name: '', role: "Mentor of Stock's ID", equity: '', tradingStyle: '', contacts: [] });
  const [newContact, setNewContact] = useState({ type: 'whatsapp', label: 'WhatsApp', value: '' });
  const [mentorFile, setMentorFile] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, r, g, m, mod] = await Promise.all([
        api.get('/content/site'),
        api.get('/content/reviews/all'),
        api.get('/content/gain-photos/all'),
        api.get('/content/mentors/all'),
        api.get('/modules/all'),
      ]);
      setContent(c.data.data);
      setReviews(r.data.data);
      setGainPhotos(g.data.data);
      setMentors(m.data.data);
      setModules(mod.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      await api.put('/content/site', content);
      Swal.fire({ icon: 'success', title: 'Tersimpan!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally { setSaving(false); }
  };

  const handleAddReview = async () => {
    if (!newReview.name) return Swal.fire({ icon: 'warning', title: 'Nama wajib diisi', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    if (!newReview.positive && !newReview.critique && !newReview.suggestion) {
      return Swal.fire({ icon: 'warning', title: 'Isi minimal satu kolom ulasan', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
    
    const parts = [];
    // Menggunakan \n untuk memisahkan Judul Label dan Isinya ke bawah
    if (newReview.positive) parts.push(`Kesan:\n${newReview.positive}`);
    if (newReview.critique) parts.push(`Pesan:\n${newReview.critique}`);
    if (newReview.suggestion) parts.push(`Komentar:\n${newReview.suggestion}`);
    
    // Dipisahkan dengan 2 kali enter (\n\n) antar kategori ulasan
    const message = parts.join('\n\n');
    
    try {
      await api.post('/content/reviews', { name: newReview.name, message, rating: newReview.rating });
      setNewReview({ name: '', positive: '', critique: '', suggestion: '', rating: 5 });
      fetchAll();
      Swal.fire({ icon: 'success', title: 'Ulasan ditambahkan!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  const handleDeleteReview = async (id) => {
    const r = await Swal.fire({ title: 'Hapus ulasan?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46', background: '#1e1e1e', color: '#fff' });
    if (!r.isConfirmed) return;
    await api.delete(`/content/reviews/${id}`);
    fetchAll();
  };

  const handleToggleReview = async (review) => {
    await api.put(`/content/reviews/${review._id}`, { isVisible: !review.isVisible });
    fetchAll();
  };

  const handleUploadGain = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await api.post('/content/gain-photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchAll();
      Swal.fire({ icon: 'success', title: 'Foto diupload!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal upload', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
    e.target.value = '';
  };

  const handleDeleteGain = async (id) => {
    const r = await Swal.fire({ title: 'Hapus foto?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46', background: '#1e1e1e', color: '#fff' });
    if (!r.isConfirmed) return;
    await api.delete(`/content/gain-photos/${id}`);
    fetchAll();
  };

  const handleAddMentor = async () => {
    if (!newMentor.name) return Swal.fire({ icon: 'warning', title: 'Nama mentor wajib diisi', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    const formData = new FormData();
    Object.entries(newMentor).forEach(([k, v]) => {
      if (k === 'contacts') formData.append(k, JSON.stringify(v));
      else formData.append(k, v);
    });
    if (mentorFile) formData.append('image', mentorFile);
    try {
      await api.post('/content/mentors', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewMentor({ name: '', role: "Mentor of Stock's ID", equity: '', tradingStyle: '', contacts: [] });
      setMentorFile(null);
      fetchAll();
      Swal.fire({ icon: 'success', title: 'Mentor ditambahkan!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  const handleDeleteMentor = async (id) => {
    const r = await Swal.fire({ title: 'Hapus mentor?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46', background: '#1e1e1e', color: '#fff' });
    if (!r.isConfirmed) return;
    await api.delete(`/content/mentors/${id}`);
    fetchAll();
  };

  const addContact = () => {
    if (!newContact.value) return;
    setNewMentor(m => ({ ...m, contacts: [...m.contacts, { ...newContact }] }));
    setNewContact({ type: 'whatsapp', label: 'WhatsApp', value: '' });
  };

  const handleUploadModule = async () => {
    if (!moduleFile) return Swal.fire({ icon: 'warning', title: 'Pilih file PDF terlebih dahulu', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    if (!newModule.title) return Swal.fire({ icon: 'warning', title: 'Judul modul wajib diisi', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    setModuleUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', moduleFile);
      formData.append('title', newModule.title);
      formData.append('description', newModule.description);
      formData.append('order', newModule.order);
      await api.post('/modules', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewModule({ title: '', description: '', order: 0 });
      setModuleFile(null);
      fetchAll();
      Swal.fire({ icon: 'success', title: 'Modul diupload!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal upload', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    } finally { setModuleUploading(false); }
  };

  const handleDeleteModule = async (id, title) => {
    const r = await Swal.fire({ title: 'Hapus modul?', text: `"${title}" akan dihapus permanen.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46', background: '#1e1e1e', color: '#fff' });
    if (!r.isConfirmed) return;
    try {
      await api.delete(`/modules/${id}`);
      fetchAll();
      Swal.fire({ icon: 'success', title: 'Modul dihapus', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  const handleToggleModule = async (mod) => {
    try {
      await api.put(`/modules/${mod._id}`, { isVisible: !mod.isVisible });
      fetchAll();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
    }
  };

  const TABS = [
    { id: 'site', label: 'Konten Utama' },
    { id: 'slider', label: 'Slider' },
    { id: 'benefits', label: 'Benefit' },
    { id: 'reviews', label: 'Ulasan' },
    { id: 'gains', label: 'Foto Gain' },
    { id: 'mentors', label: 'Mentor' },
    { id: 'modules', label: 'Modul PDF' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex justify-center py-20"><LoadingSpinner text="Memuat..." /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Kustomisasi Halaman</h1>
          <p className="text-zinc-500 text-sm mt-1">Edit konten yang tampil di halaman publik</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-accent text-black' : 'bg-surface border border-zinc-700 text-zinc-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: KONTEN UTAMA ── */}
        {activeTab === 'site' && content && (
          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Hero Section</h2>
              <div><label className="label">Judul Hero</label><input value={content.heroTitle || ''} onChange={e => setContent({ ...content, heroTitle: e.target.value })} className="input-field" /></div>
              <div><label className="label">Subjudul Hero</label><textarea value={content.heroSubtitle || ''} onChange={e => setContent({ ...content, heroSubtitle: e.target.value })} className="input-field" rows={2} /></div>
              <div><label className="label">Teks Tombol</label><input value={content.heroButtonText || ''} onChange={e => setContent({ ...content, heroButtonText: e.target.value })} className="input-field" /></div>
            </div>
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Tentang Kelas</h2>
              <div><label className="label">Header</label><input value={content.aboutHeader || ''} onChange={e => setContent({ ...content, aboutHeader: e.target.value })} className="input-field" /></div>
              <div><label className="label">Paragraf 1</label><textarea value={content.aboutParagraph1 || ''} onChange={e => setContent({ ...content, aboutParagraph1: e.target.value })} className="input-field" rows={3} /></div>
              <div><label className="label">Paragraf 2</label><textarea value={content.aboutParagraph2 || ''} onChange={e => setContent({ ...content, aboutParagraph2: e.target.value })} className="input-field" rows={3} /></div>
            </div>
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Stats & Kelas Gratis</h2>
              <div><label className="label">Tanggal Mulai Kelas</label><input type="date" value={content.statsStartDate || ''} onChange={e => setContent({ ...content, statsStartDate: e.target.value })} className="input-field" /></div>
              <div><label className="label">Link Kelas Gratis WhatsApp</label><input value={content.freeClassLink || ''} onChange={e => setContent({ ...content, freeClassLink: e.target.value })} className="input-field" placeholder="https://chat.whatsapp.com/..." /></div>
              <div><label className="label">Label Tombol Kelas Gratis</label><input value={content.freeClassLabel || ''} onChange={e => setContent({ ...content, freeClassLabel: e.target.value })} className="input-field" /></div>
            </div>
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Footer</h2>
              <div><label className="label">Teks Footer</label><textarea value={content.footerText || ''} onChange={e => setContent({ ...content, footerText: e.target.value })} className="input-field" rows={2} /></div>
            </div>
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Ticker Saham</h2>
              <p className="text-xs text-zinc-500">Format: NAMA +/-PERSEN%</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(content.tickerStocks || []).map((stock, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-zinc-600 text-xs w-6 shrink-0">{i + 1}.</span>
                    <input
                      value={stock}
                      onChange={e => {
                        const list = [...content.tickerStocks];
                        list[i] = e.target.value;
                        setContent({ ...content, tickerStocks: list });
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const list = [...content.tickerStocks];
                          list.splice(i + 1, 0, '');
                          setContent({ ...content, tickerStocks: list });
                          setTimeout(() => {
                            const inputs = document.querySelectorAll('[data-ticker-input]');
                            if (inputs[i + 1]) inputs[i + 1].focus();
                          }, 50);
                        }
                        if (e.key === 'Backspace' && stock === '' && content.tickerStocks.length > 1) {
                          e.preventDefault();
                          const list = content.tickerStocks.filter((_, j) => j !== i);
                          setContent({ ...content, tickerStocks: list });
                        }
                      }}
                      data-ticker-input
                      className="input-field flex-1 text-sm font-mono"
                      placeholder="cth: BBRI +2.3%"
                    />
                    <button onClick={() => {
                      const list = content.tickerStocks.filter((_, j) => j !== i);
                      setContent({ ...content, tickerStocks: list.length > 0 ? list : [''] });
                    }} className="text-accent-red hover:text-red-400 text-lg leading-none px-1 shrink-0">✕</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setContent({ ...content, tickerStocks: [...(content.tickerStocks || []), ''] })} className="btn-secondary w-full text-sm">+ Tambah Saham</button>
            </div>
            <button onClick={handleSaveContent} disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</button>
          </div>
        )}

        {/* ── TAB: SLIDER ── */}
        {activeTab === 'slider' && content && (
          <div className="space-y-4">
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Slide Header Section 2</h2>
              {(content.sliderSlides || []).map((slide, i) => (
                <div key={i} className="bg-surface-2 rounded-xl p-4 space-y-3 border border-zinc-700">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500 font-medium">Slide {i + 1}</p>
                    <button onClick={() => {
                      const slides = content.sliderSlides.filter((_, j) => j !== i);
                      setContent({ ...content, sliderSlides: slides });
                    }} className="text-xs text-accent-red hover:bg-red-900/20 px-2 py-1 rounded transition-colors">🗑 Hapus Slide</button>
                  </div>
                  <div><label className="label">Header</label><input value={slide.header || ''} onChange={e => { const slides = [...content.sliderSlides]; slides[i] = { ...slides[i], header: e.target.value }; setContent({ ...content, sliderSlides: slides }); }} className="input-field" /></div>
                  <div><label className="label">Informasi</label><textarea value={slide.info || ''} onChange={e => { const slides = [...content.sliderSlides]; slides[i] = { ...slides[i], info: e.target.value }; setContent({ ...content, sliderSlides: slides }); }} className="input-field" rows={2} /></div>
                  {slide.imageUrl && <img src={slide.imageUrl} alt={`slide-${i}`} className="w-full h-32 object-cover rounded-lg" />}
                  <div>
                    <label className="label">Background Image</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      const formData = new FormData();
                      formData.append('image', file);
                      formData.append('slideIndex', i);
                      try {
                        const res = await api.post('/content/site/slider-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                        setContent(res.data.data);
                        Swal.fire({ icon: 'success', title: 'Gambar diupload!', background: '#1e1e1e', color: '#fff', timer: 1500, showConfirmButton: false });
                      } catch (err) {
                        Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, background: '#1e1e1e', color: '#fff', confirmButtonColor: '#22c55e' });
                      }
                      e.target.value = '';
                    }} className="input-field text-xs" />
                  </div>
                </div>
              ))}
              <button onClick={() => setContent({ ...content, sliderSlides: [...(content.sliderSlides || []), { header: 'Slide Baru', info: '', imageUrl: '', publicId: '' }] })} className="btn-secondary w-full text-sm">+ Tambah Slide</button>
            </div>
            <button onClick={handleSaveContent} disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Slider'}</button>
          </div>
        )}

        {/* ── TAB: BENEFITS ── */}
        {activeTab === 'benefits' && content && (
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">Daftar Benefit</h2>
            <div><label className="label">Header Section Benefit</label><input value={content.benefitsHeader || ''} onChange={e => setContent({ ...content, benefitsHeader: e.target.value })} className="input-field" /></div>
            <div>
              <label className="label">Daftar Benefit</label>
              <p className="text-xs text-zinc-600 mb-2">Tekan Enter untuk baris baru.</p>
              <div className="space-y-2">
                {(content.benefitsList || []).map((benefit, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-zinc-600 text-sm w-6 shrink-0">{i + 1}.</span>
                    <input value={benefit} onChange={e => { const list = [...content.benefitsList]; list[i] = e.target.value; setContent({ ...content, benefitsList: list }); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const list = [...content.benefitsList]; list.splice(i + 1, 0, ''); setContent({ ...content, benefitsList: list }); } }} className="input-field flex-1 text-sm" placeholder={`Benefit ${i + 1}`} />
                    <button onClick={() => { const list = content.benefitsList.filter((_, j) => j !== i); setContent({ ...content, benefitsList: list }); }} className="text-accent-red hover:text-red-400 text-lg leading-none px-1 shrink-0">✕</button>
                  </div>
                ))}
                <button onClick={() => setContent({ ...content, benefitsList: [...(content.benefitsList || []), ''] })} className="btn-secondary w-full text-sm mt-2">+ Tambah Benefit</button>
              </div>
            </div>
            <button onClick={handleSaveContent} disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Benefit'}</button>
          </div>
        )}

        {/* ── TAB: REVIEWS ── */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Tambah Ulasan</h2>
              <div><label className="label">Nama Member</label><input value={newReview.name} onChange={e => setNewReview({ ...newReview, name: e.target.value })} className="input-field" placeholder="Nama member" /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="label">Kesan Positif</label><AutoResizeTextarea value={newReview.positive} onChange={e => setNewReview({ ...newReview, positive: e.target.value })} placeholder="Hal positif..." className="input-field w-full" /></div>
                <div><label className="label">Pesan/Kritik</label><AutoResizeTextarea value={newReview.critique} onChange={e => setNewReview({ ...newReview, critique: e.target.value })} placeholder="Kritik..." className="input-field w-full" /></div>
                <div><label className="label">Saran/Komentar</label><AutoResizeTextarea value={newReview.suggestion} onChange={e => setNewReview({ ...newReview, suggestion: e.target.value })} placeholder="Saran..." className="input-field w-full" /></div>
              </div>
              <div><label className="label">Rating</label><select value={newReview.rating} onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} className="input-field w-32">{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}</select></div>
              <button onClick={handleAddReview} className="btn-primary w-full">+ Tambah Ulasan</button>
            </div>
            <div className="card space-y-3">
              <h2 className="text-lg font-semibold text-white">Daftar Ulasan ({reviews.length})</h2>
              {reviews.length === 0 && <p className="text-zinc-600 text-sm text-center py-4">Belum ada ulasan</p>}
              {reviews.map(r => (
                <div key={r._id} className="flex items-start justify-between gap-3 bg-surface-2 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-white text-sm font-medium">{r.name}</p><span className="text-accent-yellow text-xs">{'★'.repeat(r.rating)}</span></div>
                    {/* MODIFIKASI DISINI: Ditambahkan style inline whiteSpace */}
                    <p style={{ whiteSpace: 'pre-line' }} className="text-zinc-400 text-xs mt-1">
                      {r.message}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleToggleReview(r)} className={`text-xs px-2 py-1 rounded ${r.isVisible ? 'bg-accent/20 text-accent' : 'bg-zinc-700 text-zinc-500'}`}>{r.isVisible ? 'Tampil' : 'Tersembunyi'}</button>
                    <button onClick={() => handleDeleteReview(r._id)} className="text-xs px-2 py-1 bg-red-900/30 text-accent-red rounded">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: GAIN PHOTOS ── */}
        {activeTab === 'gains' && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Upload Foto Gain</h2>
              <input ref={gainFileRef} type="file" accept="image/*" onChange={handleUploadGain} className="input-field text-sm" />
              <p className="text-xs text-zinc-600 mt-2">Max 5MB. Format: JPG, PNG, WEBP</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gainPhotos.map(photo => (
                <div key={photo._id} className="relative group rounded-xl overflow-hidden border border-zinc-700">
                  <img src={photo.imageUrl} alt="gain" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDeleteGain(photo._id)} className="btn-danger text-xs py-1.5 px-3">Hapus</button>
                  </div>
                </div>
              ))}
              {gainPhotos.length === 0 && <div className="col-span-3 text-center py-8 text-zinc-600">Belum ada foto gain</div>}
            </div>
          </div>
        )}

        {/* ── TAB: MENTORS ── */}
        {activeTab === 'mentors' && (
          <div className="space-y-4">
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Tambah Mentor</h2>
              <div><label className="label">Nama</label><input value={newMentor.name} onChange={e => setNewMentor({ ...newMentor, name: e.target.value })} className="input-field" placeholder="Nama mentor" /></div>
              <div><label className="label">Role/Gelar</label><input value={newMentor.role} onChange={e => setNewMentor({ ...newMentor, role: e.target.value })} className="input-field" /></div>
              <div><label className="label">Equity</label><input value={newMentor.equity} onChange={e => setNewMentor({ ...newMentor, equity: e.target.value })} className="input-field" placeholder="cth: Rp 500.000.000" /></div>
              <div><label className="label">Trading Style</label><input value={newMentor.tradingStyle} onChange={e => setNewMentor({ ...newMentor, tradingStyle: e.target.value })} className="input-field" placeholder="cth: Swing Trading" /></div>
              <div><label className="label">Foto Profil</label><input type="file" accept="image/*" onChange={e => setMentorFile(e.target.files[0])} className="input-field text-sm" /></div>
              <div className="bg-surface-2 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-white">Tambah Kontak</p>
                <div className="grid grid-cols-3 gap-2">
                  <select value={newContact.type} onChange={e => setNewContact({ ...newContact, type: e.target.value, label: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) })} className="input-field text-sm">
                    {['whatsapp','instagram','tiktok','telegram','sms','youtube','twitter'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <input value={newContact.label} onChange={e => setNewContact({ ...newContact, label: e.target.value })} className="input-field text-sm" placeholder="Label" />
                  <input value={newContact.value} onChange={e => setNewContact({ ...newContact, value: e.target.value })} className="input-field text-sm" placeholder="Nilai/Link" />
                </div>
                <button onClick={addContact} className="btn-secondary w-full text-sm">+ Tambah Kontak</button>
                {newMentor.contacts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newMentor.contacts.map((c, i) => (
                      <span key={i} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full flex items-center gap-1">
                        {c.label}: {c.value}
                        <button onClick={() => setNewMentor(m => ({ ...m, contacts: m.contacts.filter((_, j) => j !== i) }))} className="text-accent-red ml-1">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleAddMentor} className="btn-primary w-full">+ Tambah Mentor</button>
            </div>
            <div className="card space-y-3">
              <h2 className="text-lg font-semibold text-white">Daftar Mentor ({mentors.length})</h2>
              {mentors.length === 0 && <p className="text-zinc-600 text-sm text-center py-4">Belum ada mentor</p>}
              {mentors.map(m => (
                <div key={m._id} className="flex items-center justify-between gap-3 bg-surface-2 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 shrink-0">
                      {m.imageUrl ? <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-accent font-bold">{m.name[0]}</div>}
                    </div>
                    <div><p className="text-white text-sm font-medium">{m.name}</p><p className="text-zinc-500 text-xs">{m.role}</p></div>
                  </div>
                  <button onClick={() => handleDeleteMentor(m._id)} className="text-xs px-2 py-1 bg-red-900/30 text-accent-red rounded shrink-0">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: MODUL PDF ── */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Upload Modul Baru</h2>
              <div><label className="label">Judul Modul <span className="text-accent-red">*</span></label><input value={newModule.title} onChange={e => setNewModule({ ...newModule, title: e.target.value })} className="input-field" placeholder="cth: Modul 1 - Dasar Analisa Teknikal" /></div>
              <div><label className="label">Deskripsi</label><textarea value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} className="input-field" rows={2} placeholder="Deskripsi singkat (opsional)" /></div>
              <div><label className="label">Urutan Tampil</label><input type="number" value={newModule.order} onChange={e => setNewModule({ ...newModule, order: parseInt(e.target.value) || 0 })} className="input-field w-28" min="0" /></div>
              <div>
                <label className="label">File PDF <span className="text-accent-red">*</span></label>
                <input type="file" accept="application/pdf,.pdf" onChange={e => setModuleFile(e.target.files[0])} className="input-field text-sm" />
                <p className="text-xs text-zinc-600 mt-1">Format: PDF. Maksimal 50MB.</p>
                {moduleFile && <p className="text-xs text-accent mt-1">✓ {moduleFile.name} ({(moduleFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
              </div>
              <button onClick={handleUploadModule} disabled={moduleUploading} className="btn-primary w-full">
                {moduleUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Mengupload...
                  </span>
                ) : 'Upload Modul'}
              </button>
            </div>

            <div className="card space-y-3">
              <h2 className="text-lg font-semibold text-white">Daftar Modul ({modules.length})</h2>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-zinc-600"><p className="text-3xl mb-2">📭</p><p className="text-sm">Belum ada modul</p></div>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => (
                    <div key={mod._id} className="bg-surface-2 rounded-xl p-4 border border-zinc-700">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center shrink-0"><span className="text-lg">📄</span></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{mod.title}</p>
                            {mod.description && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">{mod.description}</p>}
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-zinc-600 text-xs">Urutan: {mod.order}</span>
                              {mod.fileSize > 0 && <span className="text-zinc-600 text-xs">{(mod.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={mod.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 hover:text-white rounded transition-colors"
                            title="Preview"
                          >
                            👁
                          </a>
                          <button onClick={() => handleToggleModule(mod)} className={`text-xs px-2 py-1 rounded transition-colors ${mod.isVisible ? 'bg-accent/20 text-accent' : 'bg-zinc-700 text-zinc-500'}`}>
                            {mod.isVisible ? 'Tampil' : 'Tersembunyi'}
                          </button>
                          <button onClick={() => handleDeleteModule(mod._id, mod.title)} className="text-xs px-2 py-1 bg-red-900/30 text-accent-red rounded hover:bg-red-900/50 transition-colors">
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizePage;