'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, MapPin, Shield, Camera, Edit3, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantProfilePage() {
  const [khachThue, setKhachThue] = useState<any>(null);

  useEffect(() => {
    const khachThueData = localStorage.getItem('khachThueData');
    if (khachThueData) {
      setKhachThue(JSON.parse(khachThueData));
    }
  }, []);

  if (!khachThue) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tài khoản cá nhân</h1>
        <p className="text-slate-500 font-medium">Quản lý thông tin định danh và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden h-fit">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
          <CardContent className="px-8 pb-8 -mt-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 font-black text-4xl shadow-xl overflow-hidden uppercase">
                {(khachThue.fullName || khachThue.hoTen || 'U').charAt(0)}
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-white border border-slate-100 rounded-full shadow-lg text-indigo-600 hover:scale-110 transition-transform">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{khachThue.fullName || khachThue.hoTen}</h2>
            <p className="text-slate-500 font-medium mb-6">Cư dân tại RentedRoom</p>
            
            <div className="flex flex-col gap-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold h-11">
                <Edit3 className="h-4 w-4 mr-2" /> Chỉnh sửa hồ sơ
              </Button>
              <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold h-11">
                <Key className="h-4 w-4 mr-2" /> Đổi mật khẩu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" /> Thông tin định danh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Họ và tên</label>
                  <p className="text-slate-900 font-bold text-lg">{khachThue.fullName || khachThue.hoTen}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Số điện thoại</label>
                  <div className="flex items-center">
                    <p className="text-slate-900 font-bold text-lg">{khachThue.phoneNumber || khachThue.soDienThoai}</p>
                    <Shield className="h-4 w-4 ml-2 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email liên hệ</label>
                  <p className="text-slate-900 font-bold text-lg">{khachThue.email || 'Chưa cập nhật'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Số CCCD/ID</label>
                  <p className="text-slate-900 font-bold text-lg">{khachThue.cccd || '**********'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-rose-500" /> Địa chỉ thường trú
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-slate-900 font-bold text-lg">
                {khachThue.queQuan || 'Chưa xác định'}
              </p>
              <p className="text-slate-500 font-medium mt-1">
                Địa chỉ này được dùng cho các thủ tục pháp lý và đăng ký tạm trú tạm vắng.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
