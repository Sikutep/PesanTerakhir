import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Welcome({ auth }: PageProps<{}>) {
    return (
        <>
            <Head title="PesanTerakhir - Kotak Kenangan" />
            <div className="min-h-screen bg-warm-50 text-text-main font-sans selection:bg-sage-200">
                {/* Navbar */}
                <nav className="border-b border-warm-200 bg-warm-100/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sage-200 border border-sage-300 flex items-center justify-center text-sage-600">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold leading-tight">PesanTerakhir</h1>
                                <p className="text-xs text-sage-600 font-medium">Kotak Kenangan Hangat</p>
                            </div>
                        </div>
                        <div>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn-primary px-6 py-2.5 rounded-full text-sm shadow-sm"
                                >
                                    Ke Brankas Pesan
                                </Link>
                            ) : (
                                <div className="space-x-4">
                                    <Link
                                        href={route('login')}
                                        className="text-text-muted hover:text-text-main font-medium transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="btn-primary px-6 py-2.5 rounded-full text-sm shadow-sm"
                                    >
                                        Mulai Gratis
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center max-w-3xl mx-auto slide-up">
                        <h2 className="text-4xl md:text-5xl font-serif text-text-main mb-6 leading-tight">
                            Banyak memori indah yang pantas untuk dikenang selamanya.
                        </h2>
                        <p className="text-lg text-text-muted mb-10 leading-relaxed">
                            Mari simpan suara, senyum, dan kata-kata Anda di sini untuk mereka yang Anda sayangi.
                            Sistem kami akan menjaga Kotak Kenangan ini dan menyampaikannya saat Anda sudah tak lagi bersama mereka.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            {!auth.user && (
                                <>
                                    <a href={route('google.login')} className="flex items-center justify-center gap-2 bg-white text-gray-700 font-bold border border-gray-300 shadow-sm rounded-full px-8 py-4 text-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
                                        </svg>
                                        Masuk dengan Google
                                    </a>
                                </>
                            )}
                            <a href="#cara-kerja" className="btn-ghost px-8 py-4 text-lg w-full sm:w-auto flex items-center justify-center">
                                Pelajari Cara Kerjanya
                            </a>
                        </div>
                    </div>

                    {/* Features/Steps */}
                    <div id="cara-kerja" className="mt-32 grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 text-center fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="w-16 h-16 rounded-full bg-warm-200 flex items-center justify-center text-text-main mx-auto mb-6">
                                <span className="text-2xl font-serif">1</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Tulis Pesan Anda</h3>
                            <p className="text-text-muted">
                                Tulis surat, rekam suara, atau unggah kenangan dalam bentuk dokumen yang ingin Anda sampaikan.
                            </p>
                        </div>
                        <div className="glass-card p-8 text-center fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="w-16 h-16 rounded-full bg-warm-200 flex items-center justify-center text-text-main mx-auto mb-6">
                                <span className="text-2xl font-serif">2</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Sapaan Rutin</h3>
                            <p className="text-text-muted">
                                Anda cukup masuk ke aplikasi sesekali untuk menyapa kami. Selama Anda memberi kabar, pesan tetap tersimpan aman.
                            </p>
                        </div>
                        <div className="glass-card p-8 text-center fade-in" style={{ animationDelay: '0.3s' }}>
                            <div className="w-16 h-16 rounded-full bg-warm-200 flex items-center justify-center text-text-main mx-auto mb-6">
                                <span className="text-2xl font-serif">3</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Otomatis Terkirim</h3>
                            <p className="text-text-muted">
                                Jika dalam jangka waktu tertentu kami tidak mendengar kabar dari Anda, pesan akan otomatis dikirim ke kontak yang dituju.
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-warm-200 py-12 mt-20">
                    <div className="max-w-6xl mx-auto px-4 text-center text-text-muted text-sm">
                        <p>Dibuat dengan tulus untuk menjaga kenangan Anda.</p>
                        <p className="mt-2">© {new Date().getFullYear()} PesanTerakhir. Hak Cipta Dilindungi.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
