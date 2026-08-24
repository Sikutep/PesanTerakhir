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
  pin?: string;
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

  // Get current date string for desktop header
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = today.toLocaleDateString('id-ID', options).toUpperCase();

  return (
    <AppLayout activeScreen="dashboard" auth={auth}>
      <Head title="Brankas Pesan" />

      {!showWizard ? (
        <div className="space-y-6 fade-in pb-20">
          
          {/* Mobile Header */}
          <div className="md:hidden block mb-6">
            <h1 className="text-xl font-serif text-white flex items-center justify-between">
              PesanTerakhir.id
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white relative">
                <Icon.Bell />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              </div>
            </h1>
            <p className="text-[#94A3B8] text-sm mt-1">Halo, <span className="text-white font-medium">{auth.user.name.split(" ")[0]}</span></p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 radar-ping"></span>
              SISTEM BERJAGA AKTIF
            </div>
          </div>

          {/* Desktop Header */}
          <header className="hidden md:flex flex-col mb-8 relative">
            <p className="font-mono text-[#94A3B8] text-xs font-bold tracking-widest mb-2">{dateString}</p>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-serif text-white">Brankas Pesan</h1>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors relative">
                <Icon.Bell />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </div>
            </div>
          </header>

          {/* Check-in Banner / Card */}
          <div className="glass-card rounded-2xl p-4 md:p-6 border border-emerald-500/20 bg-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none md:block hidden">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Icon.Check />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                  {lastCheckIn ? 'Check-in berhasil!' : 'Belum pernah check-in. Lakukan check-in pertama Anda!'}
                </h3>
                {lastCheckIn && (
                  <p className="text-xs text-[#94A3B8]">Timer direset. Check-in berikutnya: {stats.intervalDays || 60} hari lagi ({stats.nextCheckIn}).</p>
                )}
              </div>
            </div>
            <button onClick={checkIn} disabled={isCheckingIn} className="w-full md:w-auto btn-primary py-3 md:py-2.5 px-6 rounded-xl font-bold text-sm whitespace-nowrap z-10 heartbeat-dot shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isCheckingIn ? 'Memproses...' : 'Check-in Sekarang'}
            </button>
          </div>

          {/* Stats Desktop */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            <StatCard icon={<Icon.Lock />} title="PESAN TERSIMPAN" value={stats.totalMessages} subtitle={`${stats.activeCount} aktif · ${stats.draftCount} draf`} color="indigo" />
            <StatCard icon={<Icon.User />} title="PENERIMA TERDAFTAR" value={stats.totalRecipients} subtitle="Terverifikasi" color="emerald" />
            <StatCard icon={<Icon.Clock />} title="MASA AKTIF" value={stats.daysRemaining} subtitle="hari tersisa" color="amber" />
            <StatCard icon={<Icon.Check />} title="CHECK-IN DILAKUKAN" value={stats.totalCheckIns} subtitle={`Sejak ${stats.firstCheckInDate}`} color="blue" />
          </div>

          {/* Stats Mobile */}
          <div className="grid grid-cols-3 gap-3 md:hidden">
            <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-wider mb-1">Interval</p>
              <p className="text-xl font-bold text-white">{stats.intervalDays}</p>
              <p className="text-[9px] text-emerald-400 font-medium mt-0.5">Hari</p>
            </div>
            <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-wider mb-1">Pesan Aktif</p>
              <p className="text-xl font-bold text-white">{stats.activeCount}</p>
              <p className="text-[9px] text-indigo-400 font-medium mt-0.5">Tersimpan</p>
            </div>
            <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-wider mb-1">Masa Aktif</p>
              <p className="text-xl font-bold text-white">{stats.daysRemaining}</p>
              <p className="text-[9px] text-amber-400 font-medium mt-0.5">Hari Tersisa</p>
            </div>
          </div>

          {/* Messages Section */}
          <div className="mt-8 md:mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Daftar Brankas Pesan
              </h2>
              <span className="text-[#94A3B8] text-sm">{stats.totalMessages} pesan</span>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-2xl border-dashed border-2 border-white/10 cursor-pointer hover:border-emerald-500/30 hover:bg-white/5 transition-all" onClick={() => setShowWizard(true)}>
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-3 flex items-center justify-center text-[#94A3B8]">
                  <Icon.Plus />
                </div>
                <p className="text-white text-sm font-medium mb-1">Titipkan Pesan Baru</p>
                <p className="text-[#94A3B8] text-xs">Mulai tulis pesan rahasia pertama Anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create New Card */}
                <div 
                  onClick={() => setShowWizard(true)}
                  className="glass-card rounded-2xl p-6 border-dashed border-2 border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group min-h-[200px]"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-emerald-500/20 mx-auto mb-3 flex items-center justify-center text-[#94A3B8] group-hover:text-emerald-400 transition-colors">
                    <Icon.Plus />
                  </div>
                  <p className="text-white text-sm font-bold mb-1">Titipkan Pesan Baru</p>
                  <p className="text-[#94A3B8] text-xs">Enkripsi pesan untuk orang tersayang</p>
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
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-[#94A3B8]">Kontak Wali</h2>
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none w-32 h-32 flex items-center justify-center">
                <Icon.Shield />
              </div>
              <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon.User />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{guardian?.name || "Belum diatur"}</p>
                  <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{guardian?.phone || "-"}</p>
                </div>
              </div>
              <div className="z-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                <Icon.Shield />
                <span className="hidden md:inline">Verifikasi Lapis 2</span>
                <span className="md:hidden">Lapis 2</span>
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
          className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-transform z-40"
        >
          <Icon.Plus />
        </button>
      )}
    </AppLayout>
  );
}

function StatCard({ icon, title, value, subtitle, color }: { icon: any, title: string, value: string | number, subtitle: string, color: string }) {
  const colorMap: Record<string, { bg: string, text: string }> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  };
  
  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-center h-full">
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} mb-4`}>
        {icon}
      </div>
      <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white leading-none">{value}</p>
      </div>
      <p className="text-xs text-[#94A3B8] mt-2">{subtitle}</p>
    </div>
  );
}

function MessageCard({ msg, onEdit, onDelete }: { msg: Message, onEdit: () => void, onDelete: (id: string) => void }) {
  const isActive = msg.status === 'active';
  
  const getBadgeColor = (type: ContentBadge) => {
    switch(type) {
      case 'Teks': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Audio': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Dokumen': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'Foto': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Video': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      default: return 'text-white border-white/30 bg-white/10';
    }
  };

  const getIcon = (type: ContentBadge) => {
    switch(type) {
      case 'Teks': return <Icon.FileText />;
      case 'Audio': return <Icon.Mic />;
      case 'Video': return <Icon.Video />;
      case 'Dokumen': return <Icon.FileText />;
      case 'Foto': return <Icon.FileText />; // Normally Icon.Image, using FileText fallback
      default: return <Icon.FileText />;
    }
  };

  const statusMap: Record<string, string> = { active: 'AKTIF', draft: 'DRAF', dispatched: 'TERKIRIM' };
  const statusText = statusMap[msg.status] || msg.status.toUpperCase();

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-4 group relative overflow-hidden transition-all h-full justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#94A3B8] flex-shrink-0 mt-0.5">
              <Icon.Lock />
            </div>
            <div>
              <h4 className="text-sm text-white mb-0.5">
                <span className="text-[#94A3B8]">Untuk:</span> <span className="font-bold">{msg.recipient}</span> <span className="text-[#94A3B8]">({msg.relationship})</span>
              </h4>
              <p className="text-[11px] text-[#94A3B8] font-mono">{msg.phone}</p>
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-white'}`}>
            {statusText}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {msg.types.map((type, i) => (
            <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium ${getBadgeColor(type)}`}>
              <span className="scale-75">{getIcon(type)}</span>
              {type === 'Audio' && msg.audioDuration ? `Audio (${msg.audioDuration})` : type}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex flex-col gap-0.5 text-[10px]">
          <div className="flex items-center gap-1.5 text-white">
            <Icon.Clock />
            <span>Trigger: <span className="font-bold">{msg.triggerDays} hari</span> hening</span>
          </div>
          <span className="text-[#94A3B8] ml-4">{msg.createdAt}</span>
        </div>
        
        <div className="flex gap-2">
          <Link href={route('recipient.preview', msg.id)} className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20 transition-colors" title="Simulasi/Preview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </Link>
          <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors" title="Edit">
            <Icon.Edit />
          </button>
          <button onClick={() => { if(confirm('Hapus pesan ini?')) onDelete(msg.id) }} className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors" title="Hapus">
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
    pin: initialData?.pin || ""
  });
  
  const relationships = ["Istri", "Suami", "Anak", "Kakak", "Adik", "Orang Tua", "Sahabat", "Lainnya"];

  // Media States
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
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
    formData.append('pin', data.pin);
    
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
        <button onClick={onCancel} className="text-[#94A3B8] hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
          Batal
        </button>
        <div className="flex gap-1.5">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-emerald-500" : i < step ? "w-2 bg-emerald-500/40" : "w-2 bg-white/10"}`} />
          ))}
        </div>
        <div className="text-xs font-mono text-[#94A3B8] w-12 text-right">0{step}/03</div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        {step === 1 && (
          <div className="slide-up animation-delay-100">
            <h3 className="text-xl font-bold text-white mb-1">{isEdit ? 'Edit Pesan' : 'Tulis Pesan'}</h3>
            <p className="text-xs text-[#94A3B8] mb-6">Apa yang ingin Anda sampaikan?</p>
            
            <div className="space-y-4">
              <textarea 
                className="w-full h-32 bg-[#0B0F19] border border-white/10 rounded-xl p-4 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none placeholder-[#94A3B8]/50"
                placeholder="Tulis pesan rahasia Anda di sini..."
                value={data.messageText}
                onChange={e => setData({...data, messageText: e.target.value})}
              />

              {/* Audio Record Widget */}
              <div className="bg-[#0B0F19] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${isRecordingAudio ? 'bg-rose-500 pulse-glow' : 'bg-white/5'}`}>
                    <Icon.Mic />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{isRecordingAudio ? 'Merekam Suara...' : (audioBlob ? 'Audio Terekam' : 'Pesan Suara')}</p>
                    <p className="text-[10px] text-[#94A3B8]">{audioBlob ? 'Siap dikirim' : 'Tekan mulai untuk merekam'}</p>
                  </div>
                </div>
                {!isRecordingAudio ? (
                  <button onClick={startAudioRecord} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white rounded-lg">Mulai</button>
                ) : (
                  <button onClick={stopAudioRecord} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg">Berhenti</button>
                )}
              </div>

              {/* Video Record Widget */}
              {videoStreamRef.current ? (
                <div className="bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden relative">
                  <video ref={videoRef} autoPlay muted className="w-full h-40 object-cover opacity-80"></video>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    {!isRecordingVideo ? (
                      <button onClick={startVideoRecord} className="w-12 h-12 rounded-full bg-rose-500 border-4 border-white/20 hover:scale-105 transition-transform"></button>
                    ) : (
                      <button onClick={stopVideoRecord} className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center pulse-glow">
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                      </button>
                    )}
                  </div>
                </div>
              ) : videoBlob ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold text-emerald-400">Video berhasil direkam</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={initVideoRecord} className="flex-1 py-3 bg-[#0B0F19] border border-white/10 hover:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white"><Icon.Video /></div>
                    <span className="text-[10px] text-[#94A3B8] font-medium">Rekam Video</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 bg-[#0B0F19] border border-white/10 hover:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white"><Icon.FileText /></div>
                    <span className="text-[10px] text-[#94A3B8] font-medium">
                      {attachedFile 
                        ? (attachedFile.name.length > 15 ? attachedFile.name.substring(0, 15) + '...' : attachedFile.name) 
                        : 'Upload File/Video'}
                    </span>
                  </button>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                </div>
              )}
            </div>
            
            <button 
              onClick={handleNext} 
              disabled={!data.messageText && !audioBlob && !videoBlob && !attachedFile && !initialData?.hasAudio && !initialData?.hasVideo && !initialData?.hasDocument} 
              className="w-full btn-primary py-3 rounded-xl mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="slide-up">
            <h3 className="text-xl font-bold text-white mb-1">Penerima Pesan</h3>
            <p className="text-xs text-[#94A3B8] mb-6">Siapa yang berhak membaca pesan ini?</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                  value={data.recipientName}
                  onChange={e => setData({...data, recipientName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Hubungan</label>
                <select 
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none appearance-none"
                  value={data.recipientRelationship}
                  onChange={e => setData({...data, recipientRelationship: e.target.value})}
                >
                  {relationships.map(rel => (
                     <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Email (Opsional)</label>
                <input 
                  type="email" 
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                  placeholder="email@contoh.com"
                  value={data.recipientEmail}
                  onChange={e => setData({...data, recipientEmail: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Nomor WhatsApp</label>
                <input 
                  type="tel" 
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none font-mono"
                  placeholder="+62"
                  value={data.recipientPhone}
                  onChange={e => setData({...data, recipientPhone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button onClick={handlePrev} className="btn-ghost px-5 rounded-xl font-medium">Kembali</button>
              <button onClick={handleNext} disabled={!data.recipientName || !data.recipientPhone} className="flex-1 btn-primary py-3 rounded-xl disabled:opacity-50">Lanjut</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="slide-up">
            <h3 className="text-xl font-bold text-white mb-1">Pengaturan Keamanan</h3>
            <p className="text-xs text-[#94A3B8] mb-6">Kapan pesan ini boleh dibuka?</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-3">Waktu Trigger (Tidak ada respon)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 60, 90].map(days => (
                    <button 
                      key={days}
                      onClick={() => setData({...data, triggerDays: days as 30|60|90})}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${data.triggerDays === days ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-[#0B0F19] border border-white/10 text-[#94A3B8] hover:border-white/20'}`}
                    >
                      {days} Hari
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">PIN Rahasia (Opsional)</label>
                <p className="text-[10px] text-[#94A3B8] mb-3 leading-relaxed">Penerima harus memasukkan PIN ini untuk membuka tautan pesan.</p>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-lg tracking-widest text-center font-mono focus:border-emerald-500 outline-none"
                  placeholder="••••"
                  maxLength={6}
                  value={data.pin}
                  onChange={e => setData({...data, pin: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button onClick={handlePrev} className="btn-ghost px-5 rounded-xl font-medium">Kembali</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                <Icon.Lock /> {isSubmitting ? 'Memproses...' : (isEdit ? 'Update Pesan' : 'Simpan & Enkripsi')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
