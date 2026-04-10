'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  ArrowUpRight, 
  Zap, 
  Droplets,
  CreditCard,
  MessageSquare,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TenantDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
        setDashboardData(result.data);
      } else {
        toast.error('Không thể tải thông tin');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <AlertCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy dữ liệu</h3>
        <p className="text-slate-500">Vui lòng thử đăng nhập lại hoặc liên hệ quản lý.</p>
        <Button asChild className="mt-6">
          <Link href="/tenants/login">Quay lại đăng nhập</Link>
        </Button>
      </div>
    );
  }

  const { khachThue, hopDongHienTai, soHoaDonChuaThanhToan, hoaDonGanNhat } = dashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Chào {khachThue.fullName || khachThue.hoTen || 'bạn'} 👋
          </h1>
          <p className="text-slate-500 font-medium">Chào mừng bạn trở lại với không gian của mình.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 py-1.5 px-4 rounded-full font-bold">
            {khachThue.status === 'renting' || khachThue.trangThai === 'dangThue' ? 'Cư dân chính thức' : 'Khách hàng'}
          </Badge>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
            {(khachThue.fullName || khachThue.hoTen || 'U').charAt(0)}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Home className="h-24 w-24" />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="text-indigo-100 font-medium">Phòng đang thuê</CardDescription>
                <CardTitle className="text-3xl font-bold">{hopDongHienTai?.phong?.roomCode || hopDongHienTai?.phong?.maPhong || '---'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-200 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {hopDongHienTai?.phong?.buildingId?.name || hopDongHienTai?.phong?.toaNha?.tenToaNha || 'N/A'}
                </p>
                <Button variant="secondary" size="sm" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md font-bold">
                  Chi tiết phòng <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-medium">Hóa đơn chờ xử lý</CardDescription>
                <CardTitle className="text-3xl font-bold text-slate-900">{soHoaDonChuaThanhToan || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${soHoaDonChuaThanhToan > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <p className="text-slate-500 text-sm font-medium">
                    {soHoaDonChuaThanhToan > 0 ? 'Có thanh toán cần thực hiện' : 'Mọi thứ đã được tất toán'}
                  </p>
                </div>
                <Button size="sm" className="mt-4 bg-slate-900 border-0 font-bold hover:bg-slate-800">
                  Xem tất cả <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Info Cards */}
          <div className="grid grid-cols-1 gap-8">
            {hopDongHienTai && (
              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600" /> Thông tin hợp đồng
                    </CardTitle>
                    <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 font-bold">#{hopDongHienTai.contractCode || hopDongHienTai.maHopDong}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thời hạn thuê</p>
                      <p className="text-slate-900 font-bold">{formatDate(hopDongHienTai.startDate || hopDongHienTai.ngayBatDau)}</p>
                      <div className="flex items-center text-[10px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3 mr-1" /> Kết thúc: {formatDate(hopDongHienTai.endDate || hopDongHienTai.ngayKetThuc)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Giá thuê tháng</p>
                      <p className="text-indigo-600 font-extrabold text-xl">{formatCurrency(hopDongHienTai.rentPrice || hopDongHienTai.phong?.giaThue || 0)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tiền đặt cọc</p>
                      <p className="text-slate-900 font-bold">{formatCurrency(hopDongHienTai.deposit || hopDongHienTai.tienCoc || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hoaDonGanNhat && (
              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" /> Hóa đơn gần nhất
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <DollarSign className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(hoaDonGanNhat.totalAmount || hoaDonGanNhat.tongTien)}</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Hóa đơn tháng {hoaDonGanNhat.month || hoaDonGanNhat.thang}/{hoaDonGanNhat.year || hoaDonGanNhat.nam}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Badge className={`py-2 px-6 rounded-xl font-bold text-center ${
                        (hoaDonGanNhat.status === 'paid' || hoaDonGanNhat.trangThai === 'daThanhToan') 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200'
                      }`}>
                        {(hoaDonGanNhat.status === 'paid' || hoaDonGanNhat.trangThai === 'daThanhToan') ? 'Đã thanh toán' : 'Chờ thanh toán'}
                      </Badge>
                      <Button variant="outline" className="rounded-xl font-bold border-slate-200" asChild>
                        <Link href={`/invoices/${hoaDonGanNhat._id}`}>Xem chi tiết</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-between bg-white/10 hover:bg-white/20 border-0 h-14 font-bold rounded-2xl group transition-all">
                <div className="flex items-center">
                  <MessageSquare className="mr-3 h-5 w-5 text-indigo-400" /> Báo cáo sự cố
                </div>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              <Button className="w-full justify-between bg-white/10 hover:bg-white/20 border-0 h-14 font-bold rounded-2xl group transition-all">
                <div className="flex items-center">
                  <CreditCard className="mr-3 h-5 w-5 text-emerald-400" /> Thanh toán hóa đơn
                </div>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Hỗ trợ kỹ thuật</CardTitle>
              <CardDescription>Cần giúp đỡ? Liên hệ ngay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hotline</p>
                  <p className="text-sm font-bold text-slate-900">0123-456-789</p>
                </div>
              </div>
              <div className="flex items-center p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-slate-900">support@rentedroom.vn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
