import { Head, router } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';
import { useState } from 'react';

interface RecipientViewProps {
  msg: {
    id: string;
    recipient: string;
    relationship?: string;
    phone: string;
    types: string[];
    triggerDays: number;
    createdAt: string;
    status: string;
    audioDuration?: string;
    content_text?: string;
    content_audio_path?: string;
    content_video_path?: string;
    content_file_path?: string;
    has_pin: boolean;
  };
  isOwnerPreview: boolean;
}

export default function RecipientView({ msg, isOwnerPreview }: RecipientViewProps) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(!msg.has_pin); // Auto-unlock if no PIN
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlock = async () => {
    if (isOwnerPreview) {
      // Owner can bypass PIN for preview
      setUnlocked(true);
      return;
    }

    setIsVerifying(true);
    setPinError('');

    try {
      const response = await fetch(route('recipient.verifyPin', msg.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.valid) {
        setUnlocked(true);
      } else {
        setPinError(data.message || 'PIN salah. Silakan coba lagi.');
      }
    } catch {
      setPinError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Ensure types is always an array
  const types = Array.isArray(msg.types) ? msg.types : Object.values(msg.types || {});

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F19]">
      <Head title="Pesan Rahasia" />
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mx-auto flex items-center justify-center text-emerald-400 mb-4">
            <Icon.Lock />
          </div>
          <h1 className="text-2xl font-serif text-white mb-2">Seseorang Meninggalkan Pesan Untuk Anda</h1>
          <p className="text-[#94A3B8] text-sm">Pesan ini dikirim secara otomatis karena sistem mendeteksi pengirim tidak aktif selama {msg.triggerDays} hari.</p>
          {isOwnerPreview && (
            <div className="mt-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg inline-block">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Mode Preview Pemilik</span>
            </div>
          )}
        </div>

        {!unlocked ? (
          <div className="glass-card rounded-2xl p-6 text-center fade-in">
            <p className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider mb-4">Masukkan PIN Rahasia</p>
            <input 
              id="pin-input"
              type="password" 
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-4 text-white text-2xl tracking-[0.5em] text-center font-mono focus:border-emerald-500 outline-none mb-2"
              maxLength={6}
              placeholder="••••••"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && pin && handleUnlock()}
            />
            {pinError && (
              <p className="text-rose-400 text-xs mb-4 mt-2">{pinError}</p>
            )}
            <button 
              onClick={handleUnlock} 
              disabled={!pin || isVerifying} 
              className="w-full btn-primary py-3.5 rounded-xl disabled:opacity-50 mt-4"
            >
              {isVerifying ? 'Memverifikasi...' : 'Buka Brankas'}
            </button>
            {isOwnerPreview && (
              <button 
                onClick={() => setUnlocked(true)} 
                className="w-full text-[#94A3B8] text-xs mt-3 hover:text-white transition-colors"
              >
                Lewati PIN (Mode Preview)
              </button>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 space-y-6 fade-in">
            {/* Recipient Info */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white uppercase">
                {msg.recipient.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Untuk:</p>
                <p className="text-sm font-bold text-white">
                  {msg.recipient}
                  {msg.relationship && <span className="text-[#94A3B8] font-normal"> ({msg.relationship})</span>}
                </p>
              </div>
            </div>

            {/* Text Content */}
            {msg.content_text && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon.FileText />
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Pesan Teks</span>
                </div>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                  {msg.content_text}
                </p>
              </div>
            )}

            {/* Audio Content */}
            {types.includes('Audio') && msg.content_audio_path && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon.Mic />
                  <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Pesan Suara</span>
                </div>
                <audio controls className="w-full" style={{ height: '40px' }}>
                  <source src={`/storage/${msg.content_audio_path}`} />
                  Browser Anda tidak mendukung pemutaran audio.
                </audio>
              </div>
            )}

            {/* Video Content */}
            {types.includes('Video') && msg.content_video_path && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon.Video />
                  <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Pesan Video</span>
                </div>
                <video controls className="w-full rounded-lg" style={{ maxHeight: '300px' }}>
                  <source src={`/storage/${msg.content_video_path}`} />
                  Browser Anda tidak mendukung pemutaran video.
                </video>
              </div>
            )}

            {/* Document Content */}
            {types.includes('Dokumen') && msg.content_file_path && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon.FileText />
                  <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Lampiran Dokumen</span>
                </div>
                <a 
                  href={`/storage/${msg.content_file_path}`} 
                  download
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Icon.FileText />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Unduh Dokumen</p>
                    <p className="text-[10px] text-[#94A3B8]">Klik untuk mengunduh file</p>
                  </div>
                </a>
              </div>
            )}

            {/* No content fallback */}
            {!msg.content_text && types.length === 0 && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4 text-center">
                <p className="text-sm text-[#94A3B8]">Tidak ada konten pesan.</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center space-y-2 pt-4 border-t border-white/5">
              <p className="text-[10px] text-[#94A3B8] font-mono">
                Pesan ini dilindungi enkripsi end-to-end.
              </p>
              <p className="text-[10px] text-[#94A3B8]">
                Dibuat: {msg.createdAt} · Trigger: {msg.triggerDays} hari
              </p>
            </div>

            {/* Back button for owner preview */}
            {isOwnerPreview && (
              <button 
                onClick={() => window.history.back()} 
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                ← Kembali ke Brankas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
