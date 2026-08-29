import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';

interface SubscriptionProps {
    auth: { user: any };
    activeSubscription: {
        plan_id: 'lifetime';
        is_lifetime: boolean;
        active_until: string | null;
    } | null;
}

export default function Subscription({ auth, activeSubscription }: SubscriptionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSimulatePayment = () => {
        router.post(route('subscription.simulate'), { plan: 'lifetime' }, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    return (
        <AppLayout activeScreen="subscription" auth={auth}>
            <Head title="Langganan - Kotak Kenangan" />

            <div className="fade-in space-y-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-text-main">Akses Premium Seumur Hidup</h1>
                    <p className="text-base text-text-muted mt-2">Pesan Anda akan hidup abadi tanpa perlu khawatir lupa perpanjang. Cukup bayar satu kali saja untuk selamanya.</p>
                </div>

                {/* Active Plan Banner */}
                {activeSubscription && (
                    <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-sage-200 bg-sage-50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-sage-200 rounded-full text-sage-600">
                                <Icon.Shield />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-text-muted uppercase tracking-wider">STATUS AKUN</div>
                                <div className="text-xl font-bold text-text-main">Premium Aktif</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">BERLAKU HINGGA</div>
                            <div className="text-lg font-bold text-sage-600">
                                Selamanya
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="flex justify-center">
                    <div className="glass-card rounded-2xl p-8 border-2 border-sage-300 bg-white max-w-md w-full relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 bg-sage-200 text-sage-700 text-xs font-bold px-4 py-1.5 rounded-bl-xl tracking-wider">
                            SEKALI BAYAR
                        </div>
                        
                        <div className="mb-8 mt-2">
                            <h2 className="text-2xl font-bold text-text-main mb-2">Paket Seumur Hidup</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-text-main">Rp299.000</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3 text-base text-text-main">
                                <span className="text-sage-500 mt-0.5"><Icon.Check /></span>
                                <span>Simpan pesan, foto, suara, dan video tanpa batas waktu</span>
                            </li>
                            <li className="flex items-start gap-3 text-base text-text-main">
                                <span className="text-sage-500 mt-0.5"><Icon.Check /></span>
                                <span>Aman dan terenkripsi, privasi Anda 100% terjamin</span>
                            </li>
                            <li className="flex items-start gap-3 text-base text-text-main">
                                <span className="text-sage-500 mt-0.5"><Icon.Check /></span>
                                <span>Otomatis terkirim jika Anda tidak memberi kabar</span>
                            </li>
                            <li className="flex items-start gap-3 text-base text-text-main">
                                <span className="text-sage-500 mt-0.5"><Icon.Check /></span>
                                <span>Bisa tambahkan kontak wali pendamping</span>
                            </li>
                        </ul>

                        {!activeSubscription && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full btn-primary py-4 text-lg rounded-full font-bold shadow-md"
                            >
                                Aktifkan Premium Sekarang
                            </button>
                        )}
                    </div>
                </div>

                {/* Metode Pembayaran */}
                {!activeSubscription && (
                    <div className="glass-card rounded-2xl p-6 border border-warm-200 max-w-md mx-auto shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">METODE PEMBAYARAN</h3>
                        </div>
                        
                        <div className="border border-sage-200 rounded-xl p-4 bg-sage-50 flex items-center gap-4">
                            <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center text-text-main font-bold text-sm shadow-sm border border-warm-200">QRIS</div>
                            <div>
                                <div className="font-bold text-text-main text-base">QRIS Instan</div>
                                <div className="text-sm text-text-muted mt-0.5">Bayar mudah via m-Banking atau e-Wallet favorit Anda</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* QRIS Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm relative shadow-xl">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-main p-2">
                            <Icon.X />
                        </button>
                        
                        <div className="text-center space-y-6">
                            <h3 className="text-xl font-bold text-text-main">Pembayaran QRIS</h3>
                            <p className="text-base text-text-muted">Scan QR code ini menggunakan aplikasi m-Banking atau e-Wallet Anda.</p>
                            
                            <div className="bg-white border-2 border-warm-200 p-4 rounded-2xl inline-block mx-auto">
                                <div className="w-44 h-44 grid grid-cols-5 grid-rows-5 gap-1 p-2">
                                    {Array.from({ length: 25 }).map((_, i) => (
                                        <div key={i} className={`bg-text-main rounded-sm ${i % 2 === 0 || i % 3 === 0 ? 'opacity-100' : 'opacity-0'}`}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="font-bold text-3xl text-text-main">
                                Rp299.000
                            </div>

                            <button
                                onClick={handleSimulatePayment}
                                className="w-full btn-primary py-3.5 rounded-full"
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
