'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Lock, LogIn as LogInIcon, Home, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/tenants/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('khachThueToken', result.data.token);
        localStorage.setItem('khachThueData', JSON.stringify(result.data.khachThue));
        
        toast.success('Đăng nhập thành công!');
        router.push('/tenants/dashboard');
      } else {
        toast.error(result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Illustration / Image */}
      <div className="hidden lg:flex relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Users/huyboon/.gemini/antigravity/brain/635015fa-ae8f-41a0-82bc-74706dba320c/tenant_welcome_premium_1775787974819.png" 
            alt="Welcome Apartment" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 via-transparent to-slate-950/40" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="inline-flex items-center space-x-2 text-white mb-12 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">RentedRoom</span>
          </Link>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Chào mừng bạn về <span className="text-indigo-400">nhà</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Nền tảng quản lý phòng trọ hiện đại giúp bạn theo dõi hóa đơn, hợp đồng và yêu cầu hỗ trợ chỉ trong vài thao tác.
          </p>
          
          <div className="space-y-4">
            {[
              "Theo dõi hóa đơn điện nước hàng tháng",
              "Quản lý hợp đồng thuê nhà điện tử",
              "Gửi yêu cầu sửa chữa, báo cáo sự cố",
              "Thanh toán nhanh qua mã QR"
            ].map((text, i) => (
              <div key={i} className="flex items-center text-slate-200 space-x-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                <span className="font-medium text-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50 relative">
        <Link href="/" className="absolute top-6 left-6 lg:hidden flex items-center text-slate-600 hover:text-indigo-600 font-medium text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Link>
        
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Cổng thông tin cư dân</h2>
            <p className="text-slate-500 font-medium">Đăng nhập để xem thông tin phòng của bạn</p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-bold text-slate-700 ml-1">Số điện thoại</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="09xx xxx xxx"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="pl-12 h-14 bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-2xl font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-sm font-bold text-slate-700">Mật khẩu</Label>
                    <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Quên mật khẩu?</a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-12 h-14 bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-2xl font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-indigo-500/20 text-lg font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogInIcon className="h-5 w-5 mr-3" />
                      Đăng nhập ngay
                    </div>
                  )}
                </Button>

                <div className="pt-6 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 font-medium">Bạn là chủ trọ?</p>
                    <Link href="/login" className="text-sm font-bold text-indigo-600 hover:underline mt-1 inline-block">
                      Đăng nhập quản trị hệ thống
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-xs text-slate-400 font-medium">
            <p className="mb-2">💡 Lưu ý: Sử dụng số điện thoại đã đăng ký trong hợp đồng.</p>
            <p>© 2024 RentedRoom Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
