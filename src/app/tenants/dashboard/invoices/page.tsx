'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, DollarSign, Calendar, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';

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
        // For now, we use the invoices from the 'me' response or a new endpoint if available
        // Assuming result.data has an invoices array or similar
        setInvoices(result.data.danhSachHoaDon || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Không thể tải danh sách hóa đơn');
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
    inv.maHoaDon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${inv.thang}/${inv.nam}`.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lịch sử hóa đơn</h1>
          <p className="text-slate-500 font-medium">Theo dõi và quản lý tất cả các khoản thanh toán của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold h-11">
            <Filter className="h-4 w-4 mr-2" /> Lọc
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold h-11">
            Thanh toán tất cả
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-6 gap-4">
          <div className="flex items-center gap-4 w-full md:w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm mã hóa đơn, tháng..." 
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription className="font-bold text-slate-500 uppercase tracking-widest text-xs">
            Tổng cộng: {filteredInvoices.length} hóa đơn
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-4">Mã hóa đơn</th>
                  <th className="px-8 py-4">Thời gian</th>
                  <th className="px-8 py-4">Số tiền</th>
                  <th className="px-8 py-4">Trạng thái</th>
                  <th className="px-8 py-4">Ngày tạo</th>
                  <th className="px-8 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6 h-16 bg-slate-50/20" />
                    </tr>
                  ))
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">#{invoice.invoiceCode || invoice.maHoaDon}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center text-slate-600 font-medium">
                          <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" />
                          Tháng {invoice.month || invoice.thang}/{invoice.year || invoice.nam}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-slate-900">{formatCurrency(invoice.totalAmount || invoice.tongTien)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={`py-1.5 px-4 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          (invoice.status === 'paid' || invoice.trangThai === 'daThanhToan')
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 pointer-events-none'
                        }`}>
                          {(invoice.status === 'paid' || invoice.trangThai === 'daThanhToan') ? 'Đã thanh toán' : 'Chờ xử lý'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-slate-500 font-medium text-sm">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-indigo-400">
                          <Button variant="ghost" size="icon" className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl" asChild>
                            <Link href={`/invoices/${invoice._id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-slate-200 mb-3" />
                        <p className="text-slate-400 font-bold">Không tìm thấy hóa đơn nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
