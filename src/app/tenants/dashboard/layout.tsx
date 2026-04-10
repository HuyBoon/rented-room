'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  AlertCircle, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Building2,
  ChevronRight,
  Bell,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [khachThue, setKhachThue] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('khachThueToken');
    const khachThueData = localStorage.getItem('khachThueData');
    
    if (!token || !khachThueData) {
      router.push('/tenants/login');
      return;
    }
    
    setKhachThue(JSON.parse(khachThueData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('khachThueToken');
    localStorage.removeItem('khachThueData');
    toast.success('Đã đăng xuất tài khoản');
    router.push('/tenants/login');
  };

  if (!khachThue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  const navigation = [
    { name: 'Tổng quan', href: '/tenants/dashboard', icon: Home },
    { name: 'Hóa đơn', href: '/tenants/dashboard/invoices', icon: FileText },
    { name: 'Sự cố', href: '/tenants/dashboard/incidents', icon: AlertCircle },
    { name: 'Tài khoản', href: '/tenants/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out bg-slate-900 text-slate-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 mb-10 px-2 transition-opacity hover:opacity-80">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Rented<span className="text-indigo-500">Room</span>
            </span>
          </Link>

          {/* User Profile Summary */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {(khachThue.fullName || khachThue.hoTen || 'U').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{khachThue.fullName || khachThue.hoTen}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Cư dân</p>
              </div>
            </div>
            <div className="h-px bg-white/10 mb-3" />
            <p className="text-[11px] text-slate-400 truncate">{khachThue.phoneNumber || khachThue.soDienThoai}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'hover:bg-white/5 text-slate-400 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                    <span className="font-bold text-sm tracking-wide">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-white/50" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-bold h-12"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 relative">
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 mr-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 lg:block hidden">
              {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="h-8 w-px bg-slate-100 mx-2" />
            <div className="flex items-center space-x-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{khachThue.fullName || khachThue.hoTen}</p>
                <p className="text-[10px] text-slate-400 font-medium">#{khachThue._id?.slice(-6)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                {(khachThue.fullName || khachThue.hoTen || 'U').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
