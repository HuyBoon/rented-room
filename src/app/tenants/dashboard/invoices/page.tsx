'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye, 
  DollarSign, 
  Calendar, 
  Search, 
  Filter, 
  History,
  CheckCircle2,
  Clock,
  LayoutGrid,
  ChevronRight,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TenantInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
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
        setInvoices(result.data.danhSachHoaDon || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Không thể tải lịch sử thanh toán');
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceCode || inv.maHoaDon || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${inv.thang}/${inv.nam}`.includes(searchTerm)
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Lịch sử <span className="text-primary italic">Hóa đơn</span></h1>
          <p className="text-slate-500 font-medium">Theo dõi và quản lý các khoản thanh toán tiền phòng hàng tháng của bạn.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-bold group">
            <Filter className="h-4 w-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" /> Bộ lọc
          </Button>
          <Button className="h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 font-bold">
            Thanh toán tất cả
          </Button>
        </div>
      </div>

      <Card className="border-slate-100 shadow-medium rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center p-10 gap-8">
          <div className="flex items-center gap-4 w-full md:w-[450px]">
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-all" />
              <Input 
                placeholder="Tìm mã hóa đơn, tháng/năm..." 
                className="pl-14 h-14 bg-white border-slate-100 rounded-2xl focus:border-primary font-bold text-sm tracking-tight text-slate-700 placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="font-black text-slate-400 uppercase tracking-widest text-[10px] italic py-2 px-4 bg-white rounded-full border border-slate-100">
               Kết quả: {filteredInvoices.length}
             </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto selection:bg-primary/10 selection:text-primary">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
                  <th className="px-10 py-6">Mã hóa đơn</th>
                  <th className="px-10 py-6">Kỳ thanh toán</th>
                  <th className="px-10 py-6">Tổng số tiền</th>
                  <th className="px-10 py-6">Trạng thái</th>
                  <th className="px-10 py-6">Ngày tạo</th>
                  <th className="px-10 py-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-10 py-8 bg-slate-50/20" />
                    </tr>
                  ))
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-8">
                        <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm">#{invoice.invoiceCode || invoice.maHoaDon}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center text-slate-500 font-bold text-xs uppercase tracking-tight">
                          <Calendar className="h-4 w-4 mr-3 text-primary/40" />
                          Tháng {invoice.month || invoice.thang} / {invoice.year || invoice.nam}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="font-black text-xl text-slate-900 tracking-tighter italic">{formatCurrency(invoice.totalAmount || invoice.tongTien)}</span>
                      </td>
                      <td className="px-10 py-8">
                        <Badge variant={
                          (invoice.status === 'paid' || invoice.trangThai === 'daThanhToan') ? 'success' : 'warning'
                        } className="h-9 px-6 rounded-full font-bold text-[10px] uppercase">
                          {(invoice.status === 'paid' || invoice.trangThai === 'daThanhToan') ? 'Đã thu' : 'Chờ xử lý'}
                        </Badge>
                      </td>
                      <td className="px-10 py-8 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 text-primary">
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/5 hover:text-primary rounded-xl" asChild>
                            <Link href={`/invoices/${invoice._id}`}><Eye className="h-5 w-5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/5 hover:text-primary rounded-xl">
                            <Download className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                          <Info className="h-10 w-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hiện tại không có hóa đơn nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">Hệ thống thanh toán tự động RentedRoom v2.1</p>
    </div>
  );
}
