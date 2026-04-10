'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, MessageSquare, Clock, CheckCircle2, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
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
        setIncidents(result.data.danhSachSuCo || []);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Không thể tải danh sách sự cố');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'moi':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress':
      case 'dangXuLy':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'resolved':
      case 'daXuLy':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
      case 'moi':
        return 'Mới';
      case 'in-progress':
      case 'dangXuLy':
        return 'Đang xử lý';
      case 'resolved':
      case 'daXuLy':
        return 'Đã xử lý';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Báo cáo sự cố</h1>
          <p className="text-slate-500 font-medium">Báo cáo các vấn đề kỹ thuật để chúng tôi hỗ trợ bạn nhanh nhất.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold h-11 px-6 shadow-lg shadow-indigo-600/20">
          <Plus className="h-4 w-4 mr-2" /> Báo cáo mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-32 bg-slate-100 border-0 rounded-3xl" />
          ))
        ) : incidents.length > 0 ? (
          incidents.map((incident) => (
            <Card key={incident._id} className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-shadow group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Status Bar */}
                  <div className={`w-full md:w-2 h-2 md:h-auto ${
                    (incident.status === 'resolved' || incident.trangThai === 'daXuLy') ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className="p-8 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`py-1.5 px-4 rounded-full font-bold text-[10px] uppercase tracking-wider ${getStatusColor(incident.status || incident.trangThai)}`}>
                          {getStatusLabel(incident.status || incident.trangThai)}
                        </Badge>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">#{incident._id.slice(-6)}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-400 font-medium">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> {formatDate(incident.createdAt)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{incident.title || incident.tieuDe}</h3>
                    <p className="text-slate-600 font-medium line-clamp-2 mb-6">
                      {incident.description || incident.moTa}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center text-slate-500 text-sm font-bold">
                          <MessageSquare className="h-4 w-4 mr-2 text-slate-300" /> {incident.comments?.length || 0} phản hồi
                        </div>
                        {incident.images?.length > 0 && (
                          <div className="flex items-center text-slate-500 text-sm font-bold">
                            <ImageIcon className="h-4 w-4 mr-2 text-slate-300" /> {incident.images.length} hình ảnh
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-xl font-bold text-indigo-600 hover:bg-indigo-50">
                        Chi tiết <MoreHorizontal className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-xl bg-white rounded-3xl p-20 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-indigo-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mọi thứ đều ổn!</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Bạn chưa có báo cáo sự cố nào. Chúc bạn có một ngày tuyệt vời tại nơi ở của mình.</p>
              <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold px-8">
                Tạo báo cáo đầu tiên
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
