'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  Camera, 
  Edit3, 
  Key, 
  Building2, 
  Trash2,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

export default function TenantProfilePage() {
  const [khachThue, setKhachThue] = useState<any>(null);

  useEffect(() => {
    const khachThueData = localStorage.getItem('khachThueData');
    if (khachThueData) {
      setKhachThue(JSON.parse(khachThueData));
    }
  }, []);

  if (!khachThue) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Đang tải thông tin cá nhân...</p>
        </div>
     );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Thông tin <span className="text-primary italic">Cá nhân</span></h1>
          <p className="text-slate-500 font-medium">Quản lý định danh và bảo mật tài khoản cư dân của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Profile Card */}
        <Card className="border-slate-100 shadow-soft rounded-[3rem] overflow-hidden group">
          <div className="h-40 bg-slate-100 relative">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-brand-green/10" />
          </div>
          <CardContent className="px-10 pb-12 -mt-20 text-center relative z-10">
            <div className="relative inline-block mb-8 group-hover:scale-105 transition-transform duration-500">
              <div className="w-36 h-36 rounded-[2.5rem] border-4 border-white bg-slate-50 flex items-center justify-center text-primary font-black text-5xl shadow-xl overflow-hidden uppercase">
                {(khachThue.fullName || khachThue.hoTen || 'U').charAt(0)}
              </div>
              <button className="absolute bottom-1 right-1 p-3 bg-primary rounded-2xl shadow-xl text-white border-4 border-white hover:scale-110 transition-transform">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none uppercase tracking-tight">{khachThue.fullName || khachThue.hoTen}</h2>
            <div className="flex items-center justify-center gap-2 mb-10">
               <Badge variant="success" className="px-3">Đã xác thực</Badge>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cư dân RentedRoom</span>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20">
                <Edit3 className="h-4 w-4 mr-3" /> Chỉnh sửa hồ sơ
              </Button>
              <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 hover:text-primary hover:border-primary font-bold">
                <Lock className="h-4 w-4 mr-3" /> Đổi mật khẩu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Detailed Info Sheets */}
        <div className="lg:col-span-2 space-y-10">
          <Card className="border-slate-100 shadow-soft rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-10">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-widest italic">
                <Shield className="h-6 w-6 text-primary" /> Thông tin định danh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-none">Họ và tên</label>
                  <p className="text-slate-900 font-black text-xl tracking-tight">{khachThue.fullName || khachThue.hoTen}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-none">Số điện thoại</label>
                  <div className="flex items-center gap-4">
                    <p className="text-slate-900 font-black text-xl tracking-tight">{khachThue.phoneNumber || khachThue.soDienThoai}</p>
                    <div className="p-1 bg-brand-green/10 text-brand-green rounded-full">
                       <CheckCircle2 className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-none">Địa chỉ Email</label>
                  <p className="text-primary font-black text-xl tracking-tight">{khachThue.email || 'Chưa cập nhật'}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-none">Số CCCD/ID</label>
                  <p className="text-slate-900 font-black text-xl tracking-tight">{khachThue.cccd || '**********'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-soft rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-10">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-widest italic">
                <MapPin className="h-6 w-6 text-primary" /> Địa chỉ thường trú
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <p className="text-slate-900 font-black text-2xl tracking-tight leading-snug uppercase italic">
                {khachThue.queQuan || 'Chưa xác định'}
              </p>
              <div className="flex items-center gap-3 mt-6 text-slate-500">
                 <Smartphone className="h-4 w-4 text-primary" />
                 <p className="text-[10px] font-bold uppercase tracking-widest">Địa chỉ được dùng cho các thủ tục đăng ký tạm trú tạm vắng.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
