import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50">
            <Head title="Masuk - Kotak Kenangan" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8 fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-sage-200 border border-sage-300 mx-auto flex items-center justify-center text-sage-600 mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-text-main mb-2">Selamat Datang Kembali</h1>
                    <p className="text-text-muted text-sm">Masuk ke Kotak Kenangan Anda</p>
                </div>

                {status && <div className="mb-4 font-medium text-sm text-sage-600 text-center">{status}</div>}

                <form onSubmit={submit} className="glass-card rounded-2xl p-6 md:p-8 space-y-5 fade-in-slow">
                    <div>
                        <label className="block text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Alamat Email</label>
                        <input
                            type="email"
                            className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none transition-colors"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                        />
                        {errors.email && <p className="text-rose-alert text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs text-text-muted font-bold uppercase tracking-wider">Kata Sandi</label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs text-sage-600 hover:underline"
                                >
                                    Lupa Sandi?
                                </Link>
                            )}
                        </div>
                        <input
                            type="password"
                            className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-text-main text-sm focus:border-sage-400 focus:ring focus:ring-sage-200 outline-none transition-colors"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {errors.password && <p className="text-rose-alert text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded bg-white border-warm-200 text-sage-500 shadow-sm focus:ring-sage-500"
                            />
                            <span className="text-sm text-text-muted">Ingat saya</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        Masuk <Icon.ChevronRight />
                    </button>
                    
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-warm-200"></div>
                        <span className="flex-shrink-0 mx-4 text-text-muted text-xs">atau</span>
                        <div className="flex-grow border-t border-warm-200"></div>
                    </div>

                    <div className="space-y-3">
                        <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-warm-200 py-3 rounded-xl hover:bg-warm-50 transition-colors text-sm font-bold text-text-main shadow-sm">
                            <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                            Masuk dengan WhatsApp
                        </button>
                        <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-warm-200 py-3 rounded-xl hover:bg-warm-50 transition-colors text-sm font-bold text-text-main shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                            Masuk dengan Google
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-text-muted mt-8 fade-in-slow">
                    Belum punya Kotak Kenangan?{' '}
                    <Link href={route('register')} className="text-sage-600 hover:underline font-bold">
                        Buat Sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}
