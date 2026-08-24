import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';

interface SubscriptionProps {
    auth: { user: any };
    activeSubscription: {
        plan_id: 'annual' | 'five_year' | 'lifetime';
        is_lifetime: boolean;
        active_until: string | null;
    } | null;
}

const plans = {
    annual: { name: '1 Tahun', price: 'Rp49.000', priceSuffix: '/tahun', features: ['Hingga 3 pesan tersimpan', 'Notifikasi WhatsApp', 'Enkripsi standar', 'Dukungan email'] },
    five_year: { name: '5 Tahun', price: 'Rp149.000', priceSuffix: '/5 tahun', features: ['Pesan unlimited', 'Lampiran media besar (≤1 GB)', 'Enkripsi AES-256', 'Prioritas dukungan'] },
    lifetime: { name: 'Lifetime', price: 'Rp299.000', priceSuffix: 'sekali bayar', features: ['Proteksi aktif seumur hidup', 'Pesan & lampiran unlimited', 'Enkripsi AES-256 + PIN', 'Prioritas server', 'Akses fitur baru'] },
};

export default function Subscription({ auth, activeSubscription }: SubscriptionProps) {
    const [selectedPlan, setSelectedPlan] = useState<'annual' | 'five_year' | 'lifetime'>('lifetime');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSimulatePayment = () => {
        router.post(route('subscription.simulate'), { plan: selectedPlan }, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const activePlanName = activeSubscription ? plans[activeSubscription.plan_id]?.name || activeSubscription.plan_id : '';

    return (
        <AppLayout activeScreen="subscription" auth={auth}>
            <Head title="Langganan & Masa Aktif" />

            <div className="fade-in space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white">Langganan & Masa Aktif</h1>
                    <p className="text-sm text-[#94A3B8] mt-1">Satu kali bayar, proteksi tanpa batas waktu</p>
                </div>

                {/* Active Plan Banner */}
                {activeSubscription && (
                    <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                                <Icon.Shield />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Paket Aktif</div>
                                <div className="text-lg font-bold text-white">{activePlanName} Protection</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Berlaku hingga</div>
                            <div className="font-mono font-bold text-white">
                                {activeSubscription.is_lifetime || !activeSubscription.active_until ? 'Selamanya' : activeSubscription.active_until}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1 Tahun */}
                    <div 
                        className={`glass-card glass-card-hover rounded-2xl p-6 cursor-pointer transition-all ${selectedPlan === 'annual' ? 'ring-2 ring-emerald-500' : ''}`}
                        onClick={() => setSelectedPlan('annual')}
                    >
                        <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-4">1 TAHUN</div>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">Rp49.000</span>
                            <span className="text-sm text-[#94A3B8]">/tahun</span>
                        </div>
                        <ul className="space-y-3">
                            {plans.annual.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                                    <span className="text-emerald-400 mt-0.5"><Icon.Check /></span>
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 5 Tahun */}
                    <div 
                        className={`glass-card glass-card-hover rounded-2xl p-6 cursor-pointer transition-all ${selectedPlan === 'five_year' ? 'ring-2 ring-emerald-500' : ''}`}
                        onClick={() => setSelectedPlan('five_year')}
                    >
                        <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-4">5 TAHUN</div>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">Rp149.000</span>
                            <span className="text-sm text-[#94A3B8]">/5 tahun</span>
                        </div>
                        <ul className="space-y-3">
                            {plans.five_year.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                                    <span className="text-emerald-400 mt-0.5"><Icon.Check /></span>
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Lifetime */}
                    <div 
                        className={`glass-card glass-card-hover rounded-2xl p-6 cursor-pointer transition-all ring-2 ${selectedPlan === 'lifetime' ? 'ring-emerald-500' : 'ring-emerald-500/30'}`}
                        onClick={() => setSelectedPlan('lifetime')}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">LIFETIME</div>
                            <div className="bg-emerald-500 text-[#0B0F19] text-[10px] font-bold rounded-full px-2.5 py-0.5">Terbaik</div>
                        </div>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">Rp299.000</span>
                            <span className="text-sm text-[#94A3B8]">sekali bayar</span>
                        </div>
                        <ul className="space-y-3">
                            {plans.lifetime.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                                    <span className="text-emerald-400 mt-0.5"><Icon.Check /></span>
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Metode Pembayaran */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8]">METODE PEMBAYARAN</h3>
                        <span className="text-xs text-[#94A3B8]">Tanpa Kartu Kredit</span>
                    </div>
                    
                    <div className="border border-emerald-500/40 rounded-xl p-4 bg-emerald-500/5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">QRIS</div>
                        <div>
                            <div className="font-bold text-white text-sm">QRIS Instan</div>
                            <div className="text-xs text-[#94A3B8] mt-0.5">Bayar sekali via aplikasi perbankan atau dompet digital</div>
                        </div>
                    </div>
                </div>

                {/* Payment Button */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0B0F19] font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-sm"
                >
                    <Icon.CreditCard />
                    <span>Bayar {plans[selectedPlan].price} — {plans[selectedPlan].name}</span>
                </button>
            </div>

            {/* QRIS Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
                    <div className="glass-card rounded-3xl p-8 w-full max-w-sm relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#94A3B8] hover:text-white">
                            <Icon.X />
                        </button>
                        
                        <div className="text-center space-y-6">
                            <h3 className="text-xl font-bold text-white">Pembayaran QRIS</h3>
                            <p className="text-xs text-[#94A3B8]">Scan QR code ini menggunakan aplikasi m-Banking atau e-Wallet Anda.</p>
                            
                            <div className="bg-white p-4 rounded-2xl inline-block mx-auto">
                                <div className="w-44 h-44 grid grid-cols-5 grid-rows-5 gap-1 p-2">
                                    {Array.from({ length: 25 }).map((_, i) => (
                                        <div key={i} className={`bg-black rounded-sm ${i % 2 === 0 || i % 3 === 0 ? 'opacity-100' : 'opacity-0'}`}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="font-mono text-2xl text-white font-bold">
                                {plans[selectedPlan].price}
                            </div>

                            <button
                                onClick={handleSimulatePayment}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0B0F19] font-bold py-3.5 rounded-xl transition-colors pulse-glow"
                            >
                                Simulasikan Pembayaran Berhasil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
