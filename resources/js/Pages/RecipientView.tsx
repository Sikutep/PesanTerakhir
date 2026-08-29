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
    has_security: boolean;
    security_question?: string;
  };
  isOwnerPreview: boolean;
}

export default function RecipientView({ msg, isOwnerPreview }: RecipientViewProps) {
  const [answer, setAnswer] = useState('');
  const [unlocked, setUnlocked] = useState(!msg.has_security); // Auto-unlock if no security
  const [answerError, setAnswerError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlock = async () => {
    if (isOwnerPreview) {
      // Owner can bypass security for preview
      setUnlocked(true);
      return;
    }

    setIsVerifying(true);
    setAnswerError('');

    try {
      const response = await fetch(route('recipient.verifyPin', msg.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ answer }),
      });

      const data = await response.json();

      if (data.valid) {
        setUnlocked(true);
      } else {
        setAnswerError(data.message || 'Jawaban kurang tepat. Silakan coba lagi.');
      }
    } catch {
      setAnswerError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Ensure types is always an array
  const types = Array.isArray(msg.types) ? msg.types : Object.values(msg.types || {});

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50">
      <Head title="Kotak Kenangan" />
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-sage-100 border-4 border-sage-200 mx-auto flex items-center justify-center text-sage-600 mb-4 shadow-sm">
            <Icon.Heart />
          </div>
          <h1 className="text-3xl font-bold text-text-main mb-3">Halo, {msg.recipient.split(' ')[0]}</h1>
          <p className="text-text-muted text-base px-4">Seseorang yang sangat menyayangimu telah menitipkan sebuah pesan dan kenangan terakhir untukmu di sini.</p>
          {isOwnerPreview && (
            <div className="mt-4 px-3 py-1.5 bg-warm-200 border border-warm-300 rounded-lg inline-block">
              <span className="text-sm text-text-main font-bold uppercase tracking-wider">Mode Pratinjau Pemilik</span>
            </div>
          )}
        </div>

        {!unlocked ? (
          <div className="glass-card rounded-3xl p-8 text-center fade-in border border-warm-200 bg-white shadow-xl">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-sage-50 text-sage-600 mx-auto flex items-center justify-center mb-4">
                <Icon.Lock />
              </div>
              <h2 className="text-xl font-bold text-text-main">Satu Langkah Kecil</h2>
              <p className="text-base text-text-muted mt-2">Untuk memastikan kenangan ini sampai pada orang yang tepat, tolong jawab pertanyaan dari beliau:</p>
            </div>
            
            <div className="mb-6 p-5 bg-warm-50 rounded-2xl border border-warm-200 text-left shadow-inner">
              <p className="text-base font-bold text-text-main italic">"{msg.security_question || 'Masukkan PIN/Kata sandi'}"</p>
            </div>

            <input 
              id="answer-input"
              type="text" 
              className="w-full bg-white border-2 border-warm-200 rounded-xl px-4 py-4 text-text-main text-center font-bold focus:border-sage-400 focus:ring-0 outline-none mb-2 text-lg shadow-sm"
              placeholder="Ketik jawaban Anda di sini..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && answer && handleUnlock()}
            />
            {answerError && (
              <p className="text-rose-alert text-base mb-4 mt-2 font-bold">{answerError}</p>
            )}
            <button 
              onClick={handleUnlock} 
              disabled={!answer || isVerifying} 
              className="w-full btn-primary py-4 rounded-xl disabled:opacity-50 mt-4 font-bold text-lg shadow-md"
            >
              {isVerifying ? 'Membuka...' : 'Buka Pesan Kenangan'}
            </button>
            {isOwnerPreview && (
              <button 
                onClick={() => setUnlocked(true)} 
                className="w-full text-text-muted text-base mt-4 hover:text-text-main transition-colors font-bold"
              >
                Lewati Pertanyaan (Mode Pratinjau)
              </button>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 fade-in border border-warm-200 bg-white shadow-xl">
            {/* Recipient Info */}
            <div className="flex items-center gap-4 border-b border-warm-200 pb-6">
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center font-bold text-sage-700 text-lg uppercase shadow-inner">
                {msg.recipient.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">UNTUK:</p>
                <p className="text-lg font-bold text-text-main">
                  {msg.recipient}
                  {msg.relationship && <span className="text-text-muted font-normal text-sm block">({msg.relationship})</span>}
                </p>
              </div>
            </div>

            {/* Text Content */}
            {msg.content_text && (
              <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-sage-100 rounded-lg text-sage-600">
                    <Icon.FileText />
                  </div>
                  <span className="text-sm text-sage-700 font-bold">Pesan Tertulis</span>
                </div>
                <p className="text-text-main leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.content_text}
                </p>
              </div>
            )}

            {/* Audio Content */}
            {types.includes('Audio') && msg.content_audio_path && (
              <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Icon.Mic />
                  </div>
                  <span className="text-sm text-amber-700 font-bold">Pesan Suara</span>
                </div>
                <audio controls className="w-full rounded-full" style={{ height: '44px' }}>
                  <source src={`/storage/${msg.content_audio_path}`} />
                  Browser Anda tidak mendukung pemutaran audio.
                </audio>
              </div>
            )}

            {/* Video Content */}
            {types.includes('Video') && msg.content_video_path && (
              <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Icon.Video />
                  </div>
                  <span className="text-sm text-purple-700 font-bold">Pesan Video</span>
                </div>
                <video controls className="w-full rounded-xl shadow-sm bg-black" style={{ maxHeight: '400px' }}>
                  <source src={`/storage/${msg.content_video_path}`} />
                  Browser Anda tidak mendukung pemutaran video.
                </video>
              </div>
            )}

            {/* Document Content */}
            {types.includes('Dokumen') && msg.content_file_path && (
              <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Icon.FileText />
                  </div>
                  <span className="text-sm text-blue-700 font-bold">Lampiran Dokumen</span>
                </div>
                <a 
                  href={`/storage/${msg.content_file_path}`} 
                  download
                  className="flex items-center justify-between p-4 bg-white border border-warm-200 rounded-xl hover:bg-sage-50 transition-colors shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Icon.FileText />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main">Unduh Dokumen</p>
                      <p className="text-xs text-text-muted">Ketuk untuk menyimpan</p>
                    </div>
                  </div>
                  <div className="text-blue-500 bg-blue-50 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </a>
              </div>
            )}

            {/* No content fallback */}
            {!msg.content_text && types.length === 0 && (
              <div className="bg-warm-50 border border-warm-200 rounded-2xl p-8 text-center">
                <Icon.Heart className="w-8 h-8 text-sage-300 mx-auto mb-2" />
                <p className="text-sm text-text-muted font-medium">Pesan ini kosong.</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center space-y-3 pt-6 border-t border-warm-200 mt-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-50 text-sage-600 rounded-full text-xs font-bold">
                <Icon.Shield />
                <span>Pesan Pribadi & Aman</span>
              </div>
              <p className="text-xs text-text-muted">
                Dititipkan pada: <span className="font-bold">{msg.createdAt}</span>
              </p>
            </div>

            {/* Back button for owner preview */}
            {isOwnerPreview && (
              <button 
                onClick={() => window.history.back()} 
                className="w-full py-4 rounded-xl bg-warm-100 text-text-main font-bold hover:bg-warm-200 transition-colors text-sm mt-6 shadow-sm"
              >
                ← Kembali ke Kotak Kenangan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
