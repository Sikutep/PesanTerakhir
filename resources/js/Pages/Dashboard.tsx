import AppLayout from '@/Layouts/AppLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/Components/Icons';

type ContentBadge = "Teks" | "Audio" | "Dokumen" | "Foto" | "Video";

interface Message {
  id: string;
  recipient: string;
  relationship: string;
  phone: string;
  recipientEmail?: string;
  types: ContentBadge[];
  triggerDays: number;
  createdAt: string;
  status: "active" | "draft" | "dispatched";
  audioDuration?: string;
  messageText?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
  hasDocument?: boolean;
}

interface DashboardProps {
  auth: any;
  messages: Message[];
  stats: {
    totalMessages: number;
    activeCount: number;
    draftCount: number;
    totalRecipients: number;
    daysRemaining: number;
    totalCheckIns: number;
    firstCheckInDate: string;
    nextCheckIn: string;
    intervalDays: number;
  };
  guardian: {
    name: string;
    phone: string;
  };
  lastCheckIn: {
    status: string;
    checked_in_at: string;
  } | null;
  subscription: any;
}

export default function Dashboard({ auth, messages, stats, guardian, lastCheckIn, subscription }: DashboardProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleEdit = (msg: Message) => {
    setEditingMessage(msg);
    setShowWizard(true);
  };

  const closeWizard = () => {
    setShowWizard(false);
    setEditingMessage(null);
  };

  const checkIn = () => {
    setIsCheckingIn(true);
    router.post(route('dashboard.checkin'), {}, {
      onFinish: () => setIsCheckingIn(false)
    });
  };

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = today.toLocaleDateString('id-ID', options);

  return (
    <AppLayout activeScreen="dashboard" auth={auth} subscription={subscription}>
      <Head title="Brankas Pesan - Kotak Kenangan" />

      {!showWizard ? (
        <div className="space-y-6 fade-in pb-20">
          
          {/* Mobile Header */}
          <div className="md:hidden block mb-6">
            <h1 className="text-xl font-bold text-text-main flex items-center justify-between">
              PesanTerakhir
              <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center text-text-main relative">
                <Icon.Bell />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-alert rounded-full"></span>
              </div>
            </h1>
            <p className="text-text-muted text-sm mt-1">Halo, <span className="font-bold">{auth.user.name.split(" ")[0]}</span></p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-sage-600 text-xs font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-sage-500"></span>
              SAPAAN RUTIN AKTIF
            </div>
          </div>

          {/* Desktop Header */}
          <header className="hidden md:flex flex-col mb-8 relative">
            <p className="text-text-muted text-sm font-bold mb-2">{dateString}</p>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-text-main">Kotak Kenangan</h1>
              <div className="w-10 h-10 rounded-full bg-warm-200 flex items-center justify-center text-text-main cursor-pointer hover:bg-warm-300 transition-colors relative">
                <Icon.Bell />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-alert rounded-full"></span>
              </div>
            </div>
          </header>

          {/* Check-in Banner / Card */}
          <div className="glass-card rounded-2xl p-5 md:p-6 bg-sage-50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none md:block hidden">
              <Icon.Check />
            </div>
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center text-sage-600 flex-shrink-0">
                <Icon.Check />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-text-main mb-1">
                  {lastCheckIn ? 'Terima kasih atas sapaan Anda hari ini.' : 'Selamat datang. Mari beri kabar pertama Anda.'}
                </h3>
                {lastCheckIn && (
                  <p className="text-sm text-text-muted">Kami akan menunggu sapaan Anda berikutnya dalam {stats.intervalDays || 60} hari ({stats.nextCheckIn}).</p>
                )}
              </div>
            </div>
            <button onClick={checkIn} disabled={isCheckingIn} className="w-full md:w-auto btn-primary py-3 px-6 rounded-full font-bold text-sm whitespace-nowrap z-10 shadow-sm transition-all disabled:opacity-50">
              {isCheckingIn ? 'Menyapa...' : 'Beri Kabar Sekarang'}
            </button>
          </div>

          {/* Stats Desktop */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            <StatCard icon={<Icon.FileText />} title="Pesan Disimpan" value={stats.totalMessages} subtitle={`${stats.activeCount} aktif · ${stats.draftCount} draf`} color="sage" />
            <StatCard icon={<Icon.User />} title="Penerima" value={stats.totalRecipients} subtitle="Orang tersayang" color="sage" />
            <StatCard icon={<Icon.Clock />} title="Waktu Menunggu" value={stats.daysRemaining} subtitle="Hari hingga pengiriman" color="sage" />
            <StatCard icon={<Icon.Check />} title="Total Sapaan" value={stats.totalCheckIns} subtitle={`Sejak ${stats.firstCheckInDate}`} color="sage" />
          </div>

          {/* Stats Mobile */}
          <div className="grid grid-cols-3 gap-3 md:hidden">
            <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] text-text-muted font-bold mb-1">Menunggu</p>
              <p className="text-xl font-bold text-text-main">{stats.daysRemaining}</p>
              <p className="text-[10px] text-sage-600 font-medium mt-0.5">Hari</p>
            </div>
            <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] text-text-muted font-bold mb-1">Pesan</p>
              <p className="text-xl font-bold text-text-main">{stats.totalMessages}</p>
              <p className="text-[10px] text-sage-600 font-medium mt-0.5">Disimpan</p>
            </div>
            <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] text-text-muted font-bold mb-1">Sapaan</p>
              <p className="text-xl font-bold text-text-main">{stats.totalCheckIns}</p>
              <p className="text-[10px] text-sage-600 font-medium mt-0.5">Kali</p>
            </div>
          </div>

          {/* Messages Section */}
          <div className="mt-8 md:mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                Pesan untuk Mereka
              </h2>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-2xl border-dashed border-2 border-warm-200 cursor-pointer hover:bg-warm-100 transition-all" onClick={() => setShowWizard(true)}>
                <div className="w-12 h-12 rounded-full bg-warm-200 mx-auto mb-3 flex items-center justify-center text-sage-600">
                  <Icon.Plus />
                </div>
                <p className="text-text-main text-sm font-bold mb-1">Titipkan Pesan Baru</p>
                <p className="text-text-muted text-xs">Mulai tulis pesan pertama Anda untuk orang tersayang.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create New Card */}
                <div 
                  onClick={() => setShowWizard(true)}
                  className="glass-card rounded-2xl p-6 border-dashed border-2 border-warm-200 flex flex-col items-center justify-center cursor-pointer hover:bg-warm-100 transition-all group min-h-[200px]"
                >
                  <div className="w-12 h-12 rounded-full bg-warm-200 group-hover:bg-sage-200 mx-auto mb-3 flex items-center justify-center text-sage-600 transition-colors">
                    <Icon.Plus />
                  </div>
                  <p className="text-text-main text-sm font-bold mb-1">Titipkan Pesan Baru</p>
                  <p className="text-text-muted text-xs text-center">Simpan kenangan baru dengan aman</p>
                </div>

                {/* Message Cards */}
                {messages.map((msg: Message) => (
                  <MessageCard 
                    key={msg.id} 
                    msg={msg} 
                    onEdit={() => handleEdit(msg)}
                    onDelete={(id) => router.delete(route('messages.destroy', id))} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Kontak Wali Section */}
          <div className="mt-8">
            <h2 className="text-sm font-bold text-text-muted mb-3">KONTAK PENDAMPING (OPSIONAL)</h2>
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 rounded-full bg-warm-200 flex items-center justify-center text-text-muted">
                  <Icon.User />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">{guardian?.name || "Belum diatur"}</p>
                  <p className="text-xs text-text-muted mt-0.5">{guardian?.phone || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CreateWizard onCancel={closeWizard} initialData={editingMessage} />
      )}

      {/* FAB */}
      {!showWizard && (
        <button 
          onClick={() => setShowWizard(true)}
          className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-sage-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-sage-600 transition-transform z-40"
        >
          <Icon.Plus />
        </button>
      )}
    </AppLayout>
  );
}

function StatCard({ icon, title, value, subtitle, color }: { icon: any, title: string, value: string | number, subtitle: string, color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-center h-full">
      <div className={`w-10 h-10 rounded-xl bg-warm-200 flex items-center justify-center text-sage-600 mb-4`}>
        {icon}
      </div>
      <p className="text-xs text-text-muted font-bold mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-text-main leading-none">{value}</p>
      </div>
      <p className="text-xs text-text-muted mt-2">{subtitle}</p>
    </div>
  );
}

function MessageCard({ msg, onEdit, onDelete }: { msg: Message, onEdit: () => void, onDelete: (id: string) => void }) {
  const isActive = msg.status === 'active';
  
  const statusMap: Record<string, string> = { active: 'Tersimpan', draft: 'Draf', dispatched: 'Terkirim' };
  const statusText = statusMap[msg.status] || msg.status;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-4 group relative overflow-hidden transition-all h-full justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-sage-600 flex-shrink-0 mt-0.5">
              <Icon.User />
            </div>
            <div>
              <h4 className="text-sm text-text-main mb-0.5">
                <span className="text-text-muted">Untuk:</span> <span className="font-bold">{msg.recipient}</span>
              </h4>
              <p className="text-xs text-text-muted">{msg.relationship}</p>
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${isActive ? 'bg-sage-100 text-sage-700' : 'bg-warm-200 text-text-muted'}`}>
            {statusText}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {msg.types.map((type, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-warm-200 bg-warm-50 text-[10px] font-medium text-text-muted">
              {type === 'Audio' && msg.audioDuration ? `Audio (${msg.audioDuration})` : type}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-warm-200 flex items-center justify-between">
        <div className="flex flex-col gap-0.5 text-[10px]">
          <div className="flex items-center gap-1.5 text-text-main">
            <Icon.Clock />
            <span>Kirim jika tidak ada kabar: <span className="font-bold">{msg.triggerDays} hari</span></span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={route('recipient.preview', msg.id)} className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center text-sage-600 hover:bg-warm-200 transition-colors" title="Lihat Pratinjau">
            <Icon.LayoutGrid />
          </Link>
          <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center text-text-muted hover:bg-warm-200 transition-colors" title="Edit">
            <Icon.Edit />
          </button>
          <button onClick={() => { if(confirm('Hapus pesan ini?')) onDelete(msg.id) }} className="w-8 h-8 rounded-lg bg-rose-alert/10 flex items-center justify-center text-rose-alert hover:bg-rose-alert/20 transition-colors" title="Hapus">
            <Icon.Trash />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateWizard({ onCancel, initialData }: { onCancel: () => void, initialData?: Message | null }) {
  const isEdit = !!initialData;
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    messageText: initialData?.messageText || "",
    recipientName: initialData?.recipient || "",
    recipientRelationship: initialData?.relationship || "Keluarga",
    recipientPhone: initialData?.phone || "",
    recipientEmail: initialData?.recipientEmail || "",
    triggerDays: initialData?.triggerDays || 60,
    securityQuestion: initialData?.securityQuestion || "",
    securityAnswer: initialData?.securityAnswer || ""
  });
  
  const relationships = ["Istri", "Suami", "Anak", "Kakak", "Adik", "Orang Tua", "Sahabat", "Lainnya"];

  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startAudioRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (err) {
      alert("Gagal mengakses mikrofon.");
    }
  };

  const stopAudioRecord = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const initVideoRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert("Gagal mengakses kamera.");
    }
  };

  const startVideoRecord = () => {
    if (!videoStreamRef.current) return;
    const mediaRecorder = new MediaRecorder(videoStreamRef.current);
    videoRecorderRef.current = mediaRecorder;
    videoChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) videoChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
    };

    mediaRecorder.start();
    setIsRecordingVideo(true);
  };

  const stopVideoRecord = () => {
    if (videoRecorderRef.current) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
      setIsCameraActive(false);
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
    }
  };

  const cancelVideoRecord = () => {
    setIsCameraActive(false);
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);
  const handleSubmit = () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('messageText', data.messageText);
    formData.append('recipientName', data.recipientName);
    formData.append('recipientRelationship', data.recipientRelationship);
    formData.append('recipientPhone', data.recipientPhone);
    formData.append('recipientEmail', data.recipientEmail);
    formData.append('triggerDays', data.triggerDays.toString());
    formData.append('securityQuestion', data.securityQuestion);
    formData.append('securityAnswer', data.securityAnswer);
    
    if (audioBlob) {
      formData.append('audioFile', audioBlob, 'recording.webm');
    }
    if (videoBlob) {
      formData.append('videoFile', videoBlob, 'video.webm');
    }
    if (attachedFile) {
      formData.append('documentFile', attachedFile);
    }

    if (isEdit && initialData) {
      if (initialData.hasAudio === false && !audioBlob) formData.append('removeAudio', '1');
      if (initialData.hasVideo === false && !videoBlob) formData.append('removeVideo', '1');
      if (initialData.hasDocument === false && !attachedFile) formData.append('removeDocument', '1');
    }

    if (isEdit && initialData) {
      formData.append('_method', 'PUT');
      router.post(route('messages.update', initialData.id), formData, {
        onSuccess: () => onCancel(),
        onFinish: () => setIsSubmitting(false),
      });
    } else {
      router.post(route('messages.store'), formData, {
        onSuccess: () => onCancel(),
        onFinish: () => setIsSubmitting(false),
      });
    }
  };

  return (
    <div className="fade-in max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="text-text-muted hover:text-text-main transition-colors text-sm font-medium flex items-center gap-1">
          Batal
        </button>
        <div className="flex gap-1.5">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-sage-500" : i < step ? "w-2 bg-sage-300" : "w-2 bg-warm-200"}`} />
          ))}
        </div>
        <div className="text-xs text-text-muted w-12 text-right">Langkah {step}/3</div>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8">
        {step === 1 && (
          <div className="slide-up">
            <h3 className="text-xl font-bold text-text-main mb-1">{isEdit ? 'Edit Pesan' : 'Tulis Pesan'}</h3>
            <p className="text-sm text-text-muted mb-6">Sampaikan apa yang ada di hati Anda.</p>
            
            <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-sage-700 mb-2">💡 Inspirasi Pesan (Jika Anda bingung harus menulis apa):</p>
              <ul className="text-xs text-sage-600 space-y-1 ml-4 list-disc">
                <li>Adakah cerita, rahasia, atau permintaan maaf yang belum sempat tersampaikan?</li>
                <li>Apa harapan terbesar Anda untuk masa depannya?</li>
                <li>Pelajaran hidup apa yang ingin Anda wariskan?</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <textarea 
                className="w-full h-32 bg-white border border-warm-200 rounded-xl p-4 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none transition-all resize-none"
                placeholder="Tulis pesan atau surat Anda di sini..."
                value={data.messageText}
                onChange={e => setData({...data, messageText: e.target.value})}
              />

              <div className="bg-white border border-warm-200 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isRecordingAudio ? 'bg-rose-alert text-white' : 'bg-warm-100 text-text-muted'}`}>
                      <Icon.Mic />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main">{isRecordingAudio ? 'Sedang merekam...' : (audioBlob || initialData?.hasAudio ? 'Suara tersimpan' : 'Rekam Suara')}</p>
                    </div>
                  </div>
                  {!isRecordingAudio ? (
                    <div className="flex gap-2">
                      {(audioBlob || initialData?.hasAudio) && (
                        <button onClick={() => {setAudioBlob(null); if(initialData) initialData.hasAudio = false;}} className="px-3 py-2 text-xs font-bold bg-rose-alert/10 text-rose-alert rounded-lg">Hapus</button>
                      )}
                      <button onClick={startAudioRecord} className="px-4 py-2 text-xs font-bold bg-warm-100 hover:bg-warm-200 text-text-main rounded-lg">{audioBlob || initialData?.hasAudio ? 'Rekam Ulang' : 'Mulai'}</button>
                    </div>
                  ) : (
                    <button onClick={stopAudioRecord} className="px-4 py-2 text-xs font-bold bg-rose-alert text-white rounded-lg animate-pulse">Berhenti</button>
                  )}
                </div>
                {audioBlob && (
                  <audio controls className="w-full h-10" src={URL.createObjectURL(audioBlob)} />
                )}
              </div>

              {isCameraActive ? (
                <div className="bg-white border border-warm-200 rounded-xl overflow-hidden relative">
                  <video ref={videoRef} autoPlay muted className="w-full h-48 object-cover bg-black"></video>
                  <button onClick={cancelVideoRecord} className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors z-10">
                    <Icon.X />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    {!isRecordingVideo ? (
                      <button onClick={startVideoRecord} className="w-14 h-14 rounded-full bg-rose-alert border-4 border-white/80 hover:scale-105 transition-transform shadow-lg"></button>
                    ) : (
                      <button onClick={stopVideoRecord} className="w-14 h-14 rounded-full bg-rose-alert flex items-center justify-center animate-pulse border-4 border-white/20">
                        <div className="w-5 h-5 bg-white rounded-sm"></div>
                      </button>
                    )}
                  </div>
                </div>
              ) : videoBlob || initialData?.hasVideo ? (
                <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-sage-600">Video tersimpan</p>
                    <div className="flex gap-2">
                      <button onClick={() => {setVideoBlob(null); if(initialData) initialData.hasVideo = false;}} className="px-3 py-2 text-xs font-bold bg-rose-alert/10 text-rose-alert rounded-lg">Hapus</button>
                      <button onClick={initVideoRecord} className="px-3 py-2 text-xs font-bold bg-white border border-warm-200 text-text-muted rounded-lg hover:bg-warm-50">Rekam Ulang</button>
                    </div>
                  </div>
                  {videoBlob && (
                    <video controls className="w-full h-48 object-cover rounded-lg bg-black" src={URL.createObjectURL(videoBlob)} />
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={initVideoRecord} className="flex-1 py-4 bg-white border border-warm-200 hover:bg-warm-50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <Icon.Video />
                    <span className="text-xs text-text-muted font-medium">Rekam Video</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-white border border-warm-200 hover:bg-warm-50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <Icon.FileText />
                    <span className="text-xs text-text-muted font-medium">
                      {attachedFile || initialData?.hasDocument
                        ? ((attachedFile?.name || 'Dokumen Tersimpan').length > 15 ? (attachedFile?.name || 'Dokumen Tersimpan').substring(0, 15) + '...' : (attachedFile?.name || 'Dokumen Tersimpan')) 
                        : 'Unggah Dokumen'}
                    </span>
                  </button>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  {(attachedFile || initialData?.hasDocument) && (
                    <button onClick={() => {setAttachedFile(null); if(fileInputRef.current) fileInputRef.current.value=''; if(initialData) initialData.hasDocument = false;}} className="px-3 bg-rose-alert/10 text-rose-alert hover:bg-rose-alert/20 rounded-xl transition-colors" title="Hapus Dokumen">
                      <Icon.Trash />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleNext} 
              disabled={!data.messageText && !audioBlob && !videoBlob && !attachedFile && !initialData?.hasAudio && !initialData?.hasVideo && !initialData?.hasDocument} 
              className="w-full btn-primary py-3 rounded-full mt-8 disabled:opacity-50"
            >
              Lanjut
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="slide-up">
            <h3 className="text-xl font-bold text-text-main mb-1">Untuk Siapa?</h3>
            <p className="text-sm text-text-muted mb-6">Siapa yang berhak membaca pesan ini?</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none"
                  value={data.recipientName}
                  onChange={e => setData({...data, recipientName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Hubungan</label>
                <select 
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none"
                  value={data.recipientRelationship}
                  onChange={e => setData({...data, recipientRelationship: e.target.value})}
                >
                  {relationships.map(rel => (
                     <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Email (Opsional)</label>
                <input 
                  type="email" 
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none"
                  placeholder="email@contoh.com"
                  value={data.recipientEmail}
                  onChange={e => setData({...data, recipientEmail: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Nomor WhatsApp</label>
                <input 
                  type="tel" 
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none"
                  placeholder="0812..."
                  value={data.recipientPhone}
                  onChange={e => setData({...data, recipientPhone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button onClick={handlePrev} className="btn-ghost px-6 rounded-full font-bold">Kembali</button>
              <button onClick={handleNext} disabled={!data.recipientName || !data.recipientPhone} className="flex-1 btn-primary py-3 rounded-full disabled:opacity-50">Lanjut</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="slide-up">
            <h3 className="text-xl font-bold text-text-main mb-1">Pengaturan Privasi</h3>
            <p className="text-sm text-text-muted mb-4">Tentukan kapan dan bagaimana pesan ini dapat diakses.</p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">
                <Icon.Lock />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 mb-1">Di-enkripsi Tingkat Militer</p>
                <p className="text-xs text-amber-600 leading-relaxed">Pesan Anda sangat aman dan bahkan tidak bisa dibaca oleh sistem kami. Pesan ini hanya akan terbuka untuk penerima yang Anda tuju pada saat yang tepat.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-3">Waktu Pengiriman (Jika Anda tidak memberi kabar)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[30, 60, 90].map(days => (
                    <button 
                      key={days}
                      onClick={() => setData({...data, triggerDays: days as 30|60|90})}
                      className={`py-3 rounded-xl text-sm font-bold transition-all ${data.triggerDays === days ? 'bg-sage-100 text-sage-600 border border-sage-300' : 'bg-white border border-warm-200 text-text-muted hover:border-warm-300'}`}
                    >
                      {days} Hari
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Pertanyaan Personal (Opsional)</label>
                <p className="text-xs text-text-muted mb-3 leading-relaxed">Berikan pertanyaan yang hanya diketahui oleh Anda dan penerima sebagai kunci tambahan.</p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none"
                    placeholder="Contoh: Apa nama hewan peliharaan pertama kita?"
                    value={data.securityQuestion}
                    onChange={e => setData({...data, securityQuestion: e.target.value})}
                  />
                  {data.securityQuestion && (
                    <input 
                      type="text" 
                      className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none"
                      placeholder="Jawaban dari pertanyaan di atas"
                      value={data.securityAnswer}
                      onChange={e => setData({...data, securityAnswer: e.target.value})}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button onClick={handlePrev} className="btn-ghost px-6 rounded-full font-bold">Kembali</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 btn-primary py-3 rounded-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Icon.Lock /> {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Perbarui Pesan' : 'Simpan Pesan')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
