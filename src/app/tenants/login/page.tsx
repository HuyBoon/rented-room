'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Mail, Building2, ArrowLeft, Shield, CheckCircle2, User, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await fetch('/api/auth/tenants/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await result.json();

      if (data.success) {
        localStorage.setItem('khachThueToken', data.token);
        localStorage.setItem('khachThueData', JSON.stringify(data.khachThue));
        toast.success(`Chào mừng trở lại, ${data.khachThue.fullName || data.khachThue.hoTen}`);
        router.push('/tenants/dashboard');
      } else {
        toast.error(data.message || 'Thông tin đăng nhập không hợp lệ');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi kết nối');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Column: Form Section */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative z-10 bg-white">
        <div className="max-w-md w-full mx-auto">
        
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Chào mừng <span className="text-primary italic">Cư dân!</span></h1>
            <p className="text-slate-500 font-medium">Đăng nhập vào hệ thống để quản lý phòng trọ của bạn.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email cư dân</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12 h-14 bg-slate-50 border-slate-100 focus:bg-white rounded-2xl transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">Mật khẩu</Label>
                <Link href="#" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-14 bg-slate-50 border-slate-100 focus:bg-white rounded-2xl transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 text-base font-bold transition-all hover:scale-[1.02] active:scale-95" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            </Button>

            <div className="pt-8 text-center border-t border-slate-100 mt-8">
               <p className="text-slate-400 font-medium text-sm">
                 Chưa có tài khoản? <Link href="/register" className="text-primary font-bold hover:underline">Liên hệ chủ trọ</Link>
               </p>
            </div>
          </form>

          <Link href="/" className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors mt-20 text-sm font-bold">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Right Column: Visual Section */}
      <div className="hidden lg:flex flex-1 relative bg-slate-50 items-center justify-center p-20 overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Users/huyboon/.gemini/antigravity/brain/635015fa-ae8f-41a0-82bc-74706dba320c/cozy_apartment_hero_1775792418460.png" 
            alt="Cozy Home" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white" />
        </div>

        <div className="relative z-10 max-w-lg">
           <Card className="bg-white/90 backdrop-blur-xl border-white shadow-2xl p-12 rounded-[3.5rem] animate-in slide-in-from-right-12 duration-1000">
              <div className="mb-10 w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">
                 <Shield className="h-10 w-10" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Hệ thống <br /> <span className="text-primary italic">Kết nối Cư dân</span></h2>
              <p className="text-slate-600 font-medium text-lg leading-relaxed mb-10 italic">
                "Chúng tôi mang đến sự an tâm và thuận tiện tối đa trong việc quản lý nơi ở của bạn."
              </p>
              
              <div className="space-y-4 pt-10 border-t border-slate-100">
                 {[
                   { label: "Quản lý hợp đồng", icon: <CheckCircle2 className="h-4 w-4" /> },
                   { label: "Báo cáo sự cố nhanh", icon: <CheckCircle2 className="h-4 w-4" /> },
                   { label: "Thanh toán an toàn", icon: <CheckCircle2 className="h-4 w-4" /> }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      <div className="text-brand-green">{item.icon}</div>
                      {item.label}
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
