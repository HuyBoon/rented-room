'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Đang tải quyền truy cập...</p>
      </div>
    );
  }

  const navigation = [
    { name: 'Tổng quan', href: '/tenants/dashboard', icon: Home },
    { name: 'Hóa đơn', href: '/tenants/dashboard/invoices', icon: FileText },
    { name: 'Sự cố', href: '/tenants/dashboard/incidents', icon: AlertCircle },
    { name: 'Cá nhân', href: '/tenants/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out bg-white border-r border-slate-200 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full bg-white">
          {/* Brand */}
          <div className="p-8 pb-4">
            <Link href="/" className="flex items-center space-x-2 group h-12">
              <div className="p-2 bg-primary rounded-lg text-white shadow-md shadow-primary/20">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Rented<span className="text-primary font-black">Room</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-white/60" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
             <div className="flex items-center space-x-4 mb-6">
               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary font-black text-sm shadow-sm">
                  {(khachThue.fullName || khachThue.hoTen || 'U').charAt(0)}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate uppercase mt-0.5">{khachThue.fullName || khachThue.hoTen}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cư dân</p>
               </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-slate-500 hover:text-rose-600 hover:border-rose-100 border-slate-200 rounded-xl transition-all h-11 bg-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 mr-4 text-slate-400 hover:text-primary transition-colors bg-slate-50 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
               <span className="text-sm font-bold text-slate-400">Trang</span>
               <ChevronRight className="h-4 w-4 text-slate-300" />
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {navigation.find(n => n.href === pathname)?.name || 'Tổng quan'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <div className="flex items-center space-x-3 group cursor-pointer pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 uppercase leading-none">{khachThue.fullName || khachThue.hoTen}</p>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                   <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Status: OK</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-primary font-black shadow-sm transition-transform group-hover:scale-105">
                {(khachThue.fullName || khachThue.hoTen || 'U').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-14 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
