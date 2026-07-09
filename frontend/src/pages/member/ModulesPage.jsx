import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useUserAuth } from '../../context/UserAuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Logo from '../../components/shared/Logo';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
};

const formatDate = (date) => new Intl.DateTimeFormat('id-ID', {
  day: '2-digit', month: 'long', year: 'numeric',
}).format(new Date(date));

const ModulesPage = () => {
  const { user } = useUserAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/modules');
      setModules(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Halaman ini hanya untuk member aktif.
          </p>
          <Link to="/#pricing" className="btn-primary inline-block">
            Lihat Paket Kelas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} />
              <div>
                <h1 className="text-lg font-bold text-white">Materi & Modul</h1>
                <p className="text-zinc-500 text-xs">Materi eksklusif untuk member</p>
              </div>
            </div>
            <Link
              to="/member"
              className="text-sm text-zinc-500 hover:text-accent transition-colors"
            >
              ← Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Memuat modul..." />
          </div>
        ) : modules.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">📚</p>
            <h3 className="text-lg font-semibold text-white mb-2">Belum ada modul</h3>
            <p className="text-zinc-500 text-sm">
              Admin belum mengupload materi. Pantau terus ya!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-zinc-500 text-sm">{modules.length} modul tersedia</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod, i) => (
                <div
                  key={mod._id}
                  className="card hover:border-accent/40 transition-all duration-200 group flex flex-col"
                >
                  {/* Icon PDF */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-900/50 transition-colors">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-600 font-mono">#{i + 1}</span>
                        <span className="text-xs bg-red-900/30 text-red-400 border border-red-800 px-1.5 py-0.5 rounded">PDF</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  {mod.description && (
                    <p className="text-zinc-500 text-xs mb-4 line-clamp-3 flex-1">
                      {mod.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-2">
                    {/* Info */}
                    <div className="flex items-center justify-between text-xs text-zinc-600">
                      <span>{formatDate(mod.createdAt)}</span>
                      {mod.fileSize > 0 && <span>{formatFileSize(mod.fileSize)}</span>}
                    </div>

                    {/* Tombol aksi */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPreviewUrl(mod.fileUrl);
                          setPreviewTitle(mod.title);
                        }}
                        className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        👁 Baca
                      </button>
                      <a
                        href={mod.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={true}
                        className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                      >  
                        ⬇ Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewUrl(null);
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-zinc-700 shrink-0">
            <h3 className="text-white font-medium text-sm truncate max-w-xs sm:max-w-md">
              {previewTitle}
            </h3>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Buka di Tab Baru
              </a>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={true}
                className="btn-primary text-xs py-1.5 px-3"
              >
                ⬇ Download
              </a>
              <button
                onClick={() => setPreviewUrl(null)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`}
              className="w-full h-full border-0"
              title={previewTitle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesPage;