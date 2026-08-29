import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect } from 'react';

export function translateStatus(status: string): string {
  const map: Record<string, string> = {
    'active': 'Aktif',
    'draft': 'Draf',
    'dispatched': 'Terkirim',
  };
  return map[status.toLowerCase()] || status;
}

const NavIcon = {
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  ),
  LayoutGrid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
};

export default function AppLayout({ children, activeScreen, auth, subscription }: PropsWithChildren<{ activeScreen: string, auth: any, subscription?: any }>) {
  const pageProps = usePage().props as any;
  const flash = pageProps.flash as { success?: string; error?: string } | undefined;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (flash?.success) {
      setToast({ message: flash.success, type: 'success' });
    } else if (flash?.error) {
      setToast({ message: flash.error, type: 'error' });
    }
  }, [flash]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const navItems = [
    { id: "dashboard", label: "Brankas Pesan", icon: <NavIcon.LayoutGrid />, route: route('dashboard') },
    { id: "settings", label: "Keamanan", icon: <NavIcon.Settings />, route: route('settings') },
    { id: "subscription", label: "Langganan", icon: <NavIcon.CreditCard />, route: route('subscription') },
  ];

  const mobileNavItems = [
    { id: "dashboard", label: "Brankas", icon: <NavIcon.LayoutGrid />, route: route('dashboard') },
    { id: "settings", label: "Pengaturan", icon: <NavIcon.Bell />, route: route('settings') },
    { id: "subscription", label: "Paket", icon: <NavIcon.CreditCard />, route: route('subscription') },
    { id: "simulasi", label: "Simulasi", icon: <NavIcon.Play /> },
  ];

  // Determine subscription label
  let subLabel = 'Sekali Bayar (Gratis)';
  if (subscription && typeof subscription === 'object') {
    const planId = (subscription as any).plan_id;
    if (planId === 'year') subLabel = 'Paket 1 Tahun';
    else if (planId === 'five') subLabel = 'Paket 5 Tahun';
    else if (planId === 'lifetime') subLabel = 'Paket Seumur Hidup';
    else subLabel = 'Premium';
  } else if (typeof subscription === 'string') {
    subLabel = subscription;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-warm-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md text-sm font-medium transition-all"
          style={{
            backgroundColor: toast.type === 'success' ? '#F4F7F4' : '#FFF1F2',
            borderColor: toast.type === 'success' ? '#CDE0CE' : '#FECDD3',
            color: toast.type === 'success' ? '#436E46' : '#E11D48'
          }}>
          {toast.message}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full border-r border-warm-200 bg-warm-100">
        {/* Brand */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-200 border border-sage-300 flex items-center justify-center text-sage-600">
              <NavIcon.Lock />
            </div>
            <div>
              <p className="text-base font-bold text-text-main leading-none">PesanTerakhir</p>
              <p className="text-xs text-sage-600 mt-1 font-medium">Kotak Kenangan</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-4 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.route}
              className={`nav-item ${activeScreen === item.id ? "active" : ""} rounded-xl px-4 py-3 flex items-center gap-3 text-sm w-full text-left`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-5 border-t border-warm-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warm-300 flex items-center justify-center text-sm font-bold text-text-main uppercase shadow-sm">
              {auth?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-main truncate">{auth?.user?.name || 'User'}</p>
              <p className="text-xs text-sage-600 font-medium truncate">
                {subLabel}
              </p>
            </div>
            <Link 
              href={route('logout')} 
              method="post" 
              as="button"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-warm-200 hover:text-text-main transition-colors"
              title="Logout"
            >
              <NavIcon.LogOut />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-warm-200 bg-warm-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sage-200 border border-sage-300 flex items-center justify-center text-sage-600">
            <NavIcon.Lock />
          </div>
          <div>
            <p className="text-sm font-bold text-text-main leading-none">PesanTerakhir</p>
          </div>
        </div>
        <Link 
          href={route('logout')} 
          method="post" 
          as="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-warm-200 hover:text-text-main transition-colors"
          title="Logout"
        >
          <NavIcon.LogOut />
        </Link>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-warm-200 bg-warm-100 pb-safe">
        {mobileNavItems.map((item) => (
          item.route ? (
            <Link
              key={item.id}
              href={item.route}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-colors ${
                activeScreen === item.id ? "text-sage-600 bg-sage-50" : "text-text-muted"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <div
              key={item.id}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-colors ${
                activeScreen === item.id ? "text-sage-600 bg-sage-50" : "text-text-muted"
              }`}
            >
              {item.icon}
              {item.label}
            </div>
          )
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto bg-warm-50">
        <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 pb-28 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
