'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  Settings, 
  ArrowUpRight, 
  History, 
  Info,
  Building2,
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Plus,
  Shield,
  Users,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TenantDashboardPage() {
  const [khachThue, setKhachThue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      const token = localStorage.getItem('khachThueToken');
      if (!token) return;

      const response = await fetch('/api/auth/tenants/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setKhachThue(result.data);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!khachThue) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Xin chào, <span className="text-primary italic">{khachThue.fullName || khachThue.hoTen}</span>!
          </h1>
          <p className="text-slate-500 font-medium">Chúc bạn một ngày làm việc và nghỉ ngơi thật thoải mái.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200">
              <History className="h-4 w-4 mr-2" /> Hoạt động
           </Button>
           <Button className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Tạo báo cáo mới
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-slate-100 shadow-soft hover:shadow-xl transition-all group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary transition-transform group-hover:scale-110">
                <Home className="h-6 w-6" />
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Phòng hiện tại</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Phòng {khachThue.roomId?.roomCode || '---'}
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-2 flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-primary" />
              {khachThue.roomId?.buildingId?.name || 'Vị trí xác định'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-soft hover:shadow-xl transition-all group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green transition-transform group-hover:scale-110">
                <CreditCard className="h-6 w-6" />
              </div>
              <button className="text-slate-400 hover:text-primary transition-colors">
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Hóa đơn tháng này</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(khachThue.roomId?.rentPrice || 0)}
            </h3>
            <div className="mt-4 flex items-center gap-2">
               <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-green w-[100%]" />
               </div>
               <span className="text-[10px] font-black text-brand-green uppercase">Unpaid</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-soft hover:shadow-xl transition-all group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow transition-transform group-hover:scale-110">
                <AlertCircle className="h-6 w-6" />
              </div>
              <Badge variant="warning">Awaiting</Badge>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Sự cố đang xử lý</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {khachThue.danhSachSuCo?.filter((s:any) => s.trangThai === 'dangXuLy').length || 0} Yêu cầu
            </h3>
            <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
              Lần cuối cập nhật: 2 giờ trước
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Notifications or Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-100 shadow-soft overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest italic">
                <Clock className="h-5 w-5 text-primary" /> Thông báo mới nhất
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {[
                  { title: "Thông báo tiền điện tháng 03", time: "1 giờ trước", type: "billing", desc: "Hóa đơn tiền điện tháng này của bạn đã sẵn sàng." },
                  { title: "Bảo trì thang máy tòa nhà", time: "Hôm qua", type: "building", desc: "Tòa nhà sẽ tiến hành bảo trì thang máy vào sáng mai." },
                  { title: "Xác nhận báo cáo sự cố #SC-042", time: "2 ngày trước", type: "incident", desc: "Yêu cầu sửa chữa vòi nước của bạn đã được tiếp nhận." }
                ].map((noti, i) => (
                  <div key={i} className="p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl text-white shadow-sm",
                        noti.type === 'billing' ? "bg-brand-green" : noti.type === 'building' ? "bg-primary" : "bg-brand-yellow"
                      )}>
                         {noti.type === 'billing' ? <CreditCard className="h-4 w-4" /> : noti.type === 'building' ? <Building2 className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{noti.title}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{noti.time}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{noti.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Space: Features/Support */}
        <div className="space-y-8">
          <Card className="bg-primary border-0 shadow-xl rounded-[2rem] overflow-hidden text-white relative group">
             {/* Decorative patterns */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
             
             <CardContent className="p-10 relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                   <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">Cần hỗ trợ?</h3>
                <p className="text-white/80 font-medium mb-10 text-sm">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 với bất kỳ vấn đề nào.</p>
                <Button variant="white" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                   Gọi ngay: 1900 1234
                </Button>
             </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-soft p-10 rounded-[2rem]">
             <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 italic">Quick Access</h4>
             <div className="space-y-6">
                {[
                  { name: "Lịch sử thanh toán", icon: <History className="h-4 w-4" /> },
                  { name: "Cài đặt tài khoản", icon: <Settings className="h-4 w-4" /> },
                  { name: "Hợp đồng thuê nhà", icon: <Shield className="h-4 w-4" /> },
                  { name: "Thành viên cùng phòng", icon: <Users className="h-4 w-4" /> }
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-2 group hover:translate-x-1 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {item.icon}
                       </div>
                       <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
