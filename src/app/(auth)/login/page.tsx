'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Mail, Building2, ArrowLeft, Shield, User, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error('Tài khoản hoặc mật khẩu không chính xác');
      } else {
        toast.success('Đã đăng nhập quyền quản trị');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống trong quá trình đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 flex items-center justify-center bg-slate-50 relative overflow-hidden p-6 font-sans">
      {/* Subtle Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-green/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10">
        
        <Card className="bg-white border-slate-100 shadow-3xl rounded-[3rem] overflow-hidden">
          <CardHeader className="p-12 pb-6 text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-8 shadow-inner">
               <LayoutDashboard className="h-10 w-10" />
            </div>
            <CardTitle className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Đăng nhập</CardTitle>
            <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4 italic">Vui lòng cung cấp quyền truy cập quản trị viên</CardDescription>
          </CardHeader>
          
          <CardContent className="p-12 pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 italic">Email quản trị</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@rentedroom.vn"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-14 h-16 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary rounded-2xl font-bold transition-all text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Mật khẩu bảo mật</Label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-14 h-16 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary rounded-2xl font-bold transition-all text-slate-900"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? 'Đang kết nối...' : 'Bắt đầu phiên làm việc'}
              </Button>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <Link href="/" className="text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-all flex items-center italic">
                   <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Quay lại trang chủ
                </Link>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] italic">System Status: Online</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
