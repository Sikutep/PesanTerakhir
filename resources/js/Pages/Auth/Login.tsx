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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F19]">
            <Head title="Masuk" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8 fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mx-auto flex items-center justify-center text-emerald-400 mb-4">
                        <Icon.Lock />
                    </div>
                    <h1 className="text-2xl font-serif text-white mb-2">PesanTerakhir<span className="text-emerald-400">.id</span></h1>
                    <p className="text-[#94A3B8] text-sm">Masuk ke brankas rahasia Anda</p>
                </div>

                {status && <div className="mb-4 font-medium text-sm text-emerald-400 text-center">{status}</div>}

                <form onSubmit={submit} className="glass-card rounded-2xl p-6 md:p-8 space-y-5 fade-in-slow">
                    <div>
                        <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Email / Identitas</label>
                        <input
                            type="email"
                            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                        />
                        {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Kata Sandi</label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[10px] text-emerald-400 hover:underline"
                                >
                                    Lupa Sandi?
                                </Link>
                            )}
                        </div>
                        <input
                            type="password"
                            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded bg-[#0B0F19] border-white/20 text-emerald-500 shadow-sm focus:ring-emerald-500 focus:ring-offset-[#0B0F19]"
                            />
                            <span className="text-xs text-[#94A3B8]">Ingat saya</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        Buka Brankas <Icon.ChevronRight />
                    </button>
                </form>

                <p className="text-center text-xs text-[#94A3B8] mt-8 fade-in-slow">
                    Belum punya brankas?{' '}
                    <Link href={route('register')} className="text-emerald-400 hover:underline font-medium">
                        Buat Sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}
