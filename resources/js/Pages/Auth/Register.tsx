import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F19] py-12">
            <Head title="Daftar" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8 fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mx-auto flex items-center justify-center text-emerald-400 mb-4">
                        <Icon.Shield />
                    </div>
                    <h1 className="text-2xl font-serif text-white mb-2">Amankan Rahasia Anda</h1>
                    <p className="text-[#94A3B8] text-sm">Buat akun untuk memulai</p>
                </div>

                <form onSubmit={submit} className="glass-card rounded-2xl p-6 md:p-8 space-y-4 fade-in-slow">
                    <div>
                        <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Nama Lengkap</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                        />
                        {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Kata Sandi</label>
                        <input
                            type="password"
                            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Konfirmasi Sandi</label>
                        <input
                            type="password"
                            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        {errors.password_confirmation && <p className="text-rose-400 text-xs mt-1">{errors.password_confirmation}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        Buat Akun Sekarang
                    </button>
                </form>

                <p className="text-center text-xs text-[#94A3B8] mt-8 fade-in-slow">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="text-emerald-400 hover:underline font-medium">
                        Masuk ke Brankas
                    </Link>
                </p>
            </div>
        </div>
    );
}
