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
        if (confirm('Apakah Anda yakin ingin menjalankan simulasi pengiriman?')) {
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
            <Head title="Pengaturan Check-in & Keamanan" />
            
            <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white">Pengaturan Check-in & Keamanan</h1>
                    <p className="text-[#94A3B8] mt-1">Kelola nomor aktif, kontak wali, dan jadwal notifikasi</p>
                </div>

                {flash.success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-xl mb-6">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl mb-6">
                        {flash.error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Section 1: KONEKSI WHATSAPP UTAMA */}
                    <div className="glass-card p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                        <h2 className="uppercase tracking-wider text-[10px] text-[#94A3B8] font-bold mb-4">
                            KONEKSI WHATSAPP UTAMA
                        </h2>
                        
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                    <span className="text-emerald-500 font-bold text-lg">{user.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <div className="text-white font-bold">{user.name}</div>
                                    <div className="text-[#94A3B8] text-sm flex items-center gap-2">
                                        {user.wa_number || 'Belum ada nomor WA'} 
                                        {user.wa_number ? (
                                            <span className="text-emerald-500">• Terverifikasi</span>
                                        ) : (
                                            <span className="text-rose-500">• Belum terverifikasi</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
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
                                        className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Masukkan nomor WhatsApp"
                                    />
                                    {errors.wa_number && <p className="text-rose-500 text-sm mt-1">{errors.wa_number}</p>}
                                </div>
                            ) : (
                                <button type="button" onClick={() => setShowWaInput(true)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 text-white text-sm font-medium hover:bg-white/5 transition">
                                    Ubah Nomor
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section 2: KONTAK WALI / VERIFIKATOR SEKUNDER */}
                    <div className="glass-card p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                        <h2 className="uppercase tracking-wider text-[10px] text-[#94A3B8] font-bold mb-4">
                            KONTAK WALI / VERIFIKATOR SEKUNDER
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-white font-medium">Kontak Wali Terverifikasi</div>
                                    <div className="text-[#94A3B8] text-sm font-mono mt-1">{user.guardian_contact || 'Belum ada kontak wali'}</div>
                                </div>
                            </div>
                            <div className="sm:ml-auto bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap inline-block w-fit">
                                Verifikasi Lapis 2
                            </div>
                        </div>

                        <div className="space-y-3">
                            {showGuardianInput ? (
                                <div>
                                    <label htmlFor="guardian_contact" className="sr-only">Kontak Wali</label>
                                    <input 
                                        id="guardian_contact"
                                        type="text" 
                                        value={data.guardian_contact} 
                                        onChange={e => setData({...data, guardian_contact: e.target.value})}
                                        className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Masukkan nomor kontak wali"
                                    />
                                    {errors.guardian_contact && <p className="text-rose-500 text-sm mt-1">{errors.guardian_contact}</p>}
                                </div>
                            ) : (
                                <button type="button" onClick={() => setShowGuardianInput(true)} className="w-full bg-[#0B0F19] border border-white/10 text-emerald-500 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition">
                                    <span className="text-lg leading-none">+</span> Tambah Kontak Wali
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section 3: JADWAL NOTIFIKASI PING */}
                    <div className="glass-card p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                        <h2 className="uppercase tracking-wider text-[10px] text-[#94A3B8] font-bold mb-4">
                            JADWAL NOTIFIKASI PING
                        </h2>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {pingSchedules.map((schedule) => (
                                <button
                                    key={schedule.value}
                                    type="button"
                                    onClick={() => setData({...data, ping_schedule: schedule.value})}
                                    className={`py-3 rounded-xl text-sm font-medium transition ${
                                        data.ping_schedule === schedule.value
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-[#0B0F19] border border-white/10 text-[#94A3B8] hover:bg-white/5'
                                    }`}
                                >
                                    {schedule.label}
                                </button>
                            ))}
                        </div>
                        {errors.ping_schedule && <p className="text-rose-500 text-sm mb-2 text-center">{errors.ping_schedule}</p>}
                        <p className="text-xs text-[#94A3B8] text-center font-mono">
                            Pagi: 08.00 · Siang: 13.00 · Malam: 20.00 WIB
                        </p>
                    </div>

                    {/* Section 4: Masa Tenggang (Grace Period) */}
                    <div className="glass-card p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                        <div className="pr-4">
                            <label htmlFor="grace_period_enabled" className="text-white font-bold cursor-pointer">Masa Tenggang (Grace Period)</label>
                            <div className="text-[#94A3B8] text-sm mt-1">7 hari setelah 3x gagal respon sebelum eksekusi final</div>
                        </div>
                        <button 
                            id="grace_period_enabled"
                            type="button" 
                            onClick={() => setData({...data, grace_period_enabled: !data.grace_period_enabled})}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0B0F19] ${data.grace_period_enabled ? 'bg-emerald-500' : 'bg-[#1E293B]'}`}
                            role="switch"
                            aria-checked={data.grace_period_enabled}
                        >
                            <span 
                                aria-hidden="true" 
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.grace_period_enabled ? 'translate-x-5' : 'translate-x-0'}`} 
                            />
                        </button>
                    </div>
                    {errors.grace_period_enabled && <p className="text-rose-500 text-sm">{errors.grace_period_enabled}</p>}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Pengaturan'
                            )}
                        </button>
                    </div>
                </form>

                {/* Section 5: EMERGENCY OVERRIDE */}
                <div className="mt-8 glass-card p-6 rounded-2xl bg-rose-500/5 border border-rose-500/30">
                    <h2 className="uppercase tracking-wider text-[10px] text-rose-500 font-bold mb-2">
                        EMERGENCY OVERRIDE
                    </h2>
                    <p className="text-[#94A3B8] text-sm mb-4">
                        Uji coba simulasi pengiriman untuk memastikan pesan terkirim sesuai rencana.
                    </p>
                    <button 
                        type="button"
                        onClick={runEmergency}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl transition"
                    >
                        Jalankan Simulasi Pengiriman
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
