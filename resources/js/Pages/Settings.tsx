import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';

interface User {
    name: string;
    email: string;
    wa_number?: string;
    guardian_contact?: string;
    ping_schedule?: string;
    grace_period_enabled?: boolean;
    default_trigger_days?: number;
}

interface Props {
    auth: {
        user: User;
    };
}

export default function Settings({ auth }: Props) {
    const { user } = auth;
    const { errors, flash } = usePage<any>().props;
    
    const [data, setData] = useState({
        wa_number: user.wa_number || '',
        guardian_contact: user.guardian_contact || '',
        ping_schedule: user.ping_schedule || 'pagi',
        grace_period_enabled: user.grace_period_enabled ?? true,
        default_trigger_days: user.default_trigger_days || 7,
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [showWaInput, setShowWaInput] = useState(!user.wa_number);
    const [showGuardianInput, setShowGuardianInput] = useState(!user.guardian_contact);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        router.patch(route('settings.update'), data, {
            onFinish: () => setIsProcessing(false),
            onError: () => setIsProcessing(false),
            preserveScroll: true,
        });
    };

    const runEmergency = () => {
        if (confirm('Apakah Anda yakin ingin menguji coba pengiriman pesan? Ini tidak akan mengirim pesan sungguhan ke penerima.')) {
            router.post(route('settings.emergency'));
        }
    };

    const pingSchedules = [
        { label: 'Pagi', value: 'pagi' },
        { label: 'Siang', value: 'siang' },
        { label: 'Malam', value: 'malam' }
    ];

    return (
        <AppLayout activeScreen="settings" auth={auth}>
            <Head title="Pengaturan - Kotak Kenangan" />
            
            <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Pengaturan Akun & Kontak</h1>
                    <p className="text-text-muted mt-1">Kelola informasi pribadi, kontak pendamping, dan jadwal sapaan Anda.</p>
                </div>

                {flash.success && (
                    <div className="bg-sage-100 border border-sage-200 text-sage-600 px-4 py-3 rounded-xl mb-6 font-bold">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="bg-rose-alert/10 border border-rose-alert/20 text-rose-alert px-4 py-3 rounded-xl mb-6 font-bold">
                        {flash.error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Section 1: KONEKSI WHATSAPP UTAMA */}
                    <div className="glass-card p-6 rounded-2xl border border-warm-200">
                        <h2 className="uppercase text-xs text-text-muted font-bold mb-4">
                            KONEKSI WHATSAPP UTAMA
                        </h2>
                        
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-sage-200 flex items-center justify-center border border-sage-300">
                                    <span className="text-sage-600 font-bold text-lg">{user.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <div className="text-text-main font-bold">{user.name}</div>
                                    <div className="text-text-muted text-sm flex items-center gap-2">
                                        {user.wa_number || 'Belum ada nomor WA'} 
                                        {user.wa_number ? (
                                            <span className="text-sage-600 font-bold">• Terverifikasi</span>
                                        ) : (
                                            <span className="text-rose-alert font-bold">• Belum terverifikasi</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-sage-100 text-sage-700 border border-sage-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-sage-500"></div>
                                Aktif
                            </div>
                        </div>

                        <div className="space-y-3">
                            {showWaInput ? (
                                <div>
                                    <label htmlFor="wa_number" className="sr-only">Nomor WhatsApp</label>
                                    <input 
                                        id="wa_number"
                                        type="text" 
                                        value={data.wa_number} 
                                        onChange={e => setData({...data, wa_number: e.target.value})}
                                        className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main focus:outline-none focus:ring focus:ring-sage-200 focus:border-sage-400"
                                        placeholder="Contoh: 08123456789"
                                    />
                                    {errors.wa_number && <p className="text-rose-alert text-sm mt-1">{errors.wa_number}</p>}
                                </div>
                            ) : (
                                <button type="button" onClick={() => setShowWaInput(true)} className="w-full bg-warm-100 border border-warm-200 rounded-xl py-3 text-text-main text-sm font-bold hover:bg-warm-200 transition">
                                    Ubah Nomor
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section 2: KONTAK WALI / VERIFIKATOR SEKUNDER */}
                    <div className="glass-card p-6 rounded-2xl border border-warm-200">
                        <h2 className="uppercase text-xs text-text-muted font-bold mb-4">
                            KONTAK PENDAMPING (OPSIONAL)
                        </h2>
                        <p className="text-sm text-text-muted mb-6">Orang kepercayaan Anda yang bisa mengonfirmasi kabar jika kami tidak bisa menghubungi Anda.</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-warm-200">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-warm-200 flex items-center justify-center text-text-muted shrink-0">
                                    <Icon.User />
                                </div>
                                <div>
                                    <div className="text-text-main font-bold">Kontak Pendamping</div>
                                    <div className="text-text-muted text-sm mt-1">{user.guardian_contact || 'Belum diatur'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {showGuardianInput ? (
                                <div>
                                    <label htmlFor="guardian_contact" className="sr-only">Kontak Pendamping</label>
                                    <input 
                                        id="guardian_contact"
                                        type="text" 
                                        value={data.guardian_contact} 
                                        onChange={e => setData({...data, guardian_contact: e.target.value})}
                                        className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main focus:outline-none focus:ring focus:ring-sage-200 focus:border-sage-400"
                                        placeholder="Contoh: 08123456789"
                                    />
                                    {errors.guardian_contact && <p className="text-rose-alert text-sm mt-1">{errors.guardian_contact}</p>}
                                </div>
                            ) : (
                                <button type="button" onClick={() => setShowGuardianInput(true)} className="w-full bg-warm-100 border border-warm-200 text-text-main rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-warm-200 transition">
                                    <span className="text-lg leading-none">+</span> Tambah Kontak Pendamping
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section 3: JADWAL NOTIFIKASI PING */}
                    <div className="glass-card p-6 rounded-2xl border border-warm-200">
                        <h2 className="uppercase text-xs text-text-muted font-bold mb-4">
                            JADWAL SAPAAN RUTIN
                        </h2>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {pingSchedules.map((schedule) => (
                                <button
                                    key={schedule.value}
                                    type="button"
                                    onClick={() => setData({...data, ping_schedule: schedule.value})}
                                    className={`py-3 rounded-xl text-sm font-bold transition ${
                                        data.ping_schedule === schedule.value
                                            ? 'bg-sage-100 text-sage-600 border border-sage-300' 
                                            : 'bg-white border border-warm-200 text-text-muted hover:border-warm-300'
                                    }`}
                                >
                                    {schedule.label}
                                </button>
                            ))}
                        </div>
                        {errors.ping_schedule && <p className="text-rose-alert text-sm mb-2 text-center">{errors.ping_schedule}</p>}
                        <p className="text-xs text-text-muted text-center font-bold">
                            Kami akan menyapa Anda di WhatsApp pada waktu tersebut.
                        </p>
                    </div>

                    {/* Section 4: Masa Tenggang (Grace Period) */}
                    <div className="glass-card p-6 rounded-2xl border border-warm-200 flex items-center justify-between">
                        <div className="pr-4">
                            <label htmlFor="grace_period_enabled" className="text-text-main font-bold cursor-pointer">Tunggu Sebelum Mengirim (Masa Tenggang)</label>
                            <div className="text-text-muted text-sm mt-1">Kami akan menunggu 7 hari lagi jika kami gagal menghubungi Anda, untuk memastikan Anda benar-benar tidak bisa membalas.</div>
                        </div>
                        <button 
                            id="grace_period_enabled"
                            type="button" 
                            onClick={() => setData({...data, grace_period_enabled: !data.grace_period_enabled})}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 ${data.grace_period_enabled ? 'bg-sage-500' : 'bg-warm-300'}`}
                            role="switch"
                            aria-checked={data.grace_period_enabled}
                        >
                            <span 
                                aria-hidden="true" 
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.grace_period_enabled ? 'translate-x-5' : 'translate-x-0'}`} 
                            />
                        </button>
                    </div>
                    {errors.grace_period_enabled && <p className="text-rose-alert text-sm">{errors.grace_period_enabled}</p>}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full bg-sage-500 hover:bg-sage-600 text-white font-bold py-3.5 px-4 rounded-full transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
                        >
                            {isProcessing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>

                {/* Section 5: EMERGENCY OVERRIDE */}
                <div className="mt-8 glass-card p-6 rounded-2xl bg-rose-50 border border-rose-alert/30">
                    <h2 className="uppercase text-xs text-rose-alert font-bold mb-2">
                        UJI COBA SISTEM
                    </h2>
                    <p className="text-rose-800 text-sm mb-4">
                        Lihat bagaimana pesan akan dikirimkan kepada penerima saat tiba waktunya.
                    </p>
                    <button 
                        type="button"
                        onClick={runEmergency}
                        className="w-full bg-rose-alert hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-full transition"
                    >
                        Jalankan Simulasi
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
