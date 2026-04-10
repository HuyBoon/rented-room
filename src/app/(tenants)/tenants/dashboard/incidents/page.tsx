'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Building2, 
  Search,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function TenantIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      toast.error('Không thể đồng bộ danh sách sự cố');
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
        return 'success';
      case 'in-progress':
      case 'dangXuLy':
        return 'warning';
      case 'resolved':
      case 'daXuLy':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
      case 'moi':
        return 'Đã gửi';
      case 'in-progress':
      case 'dangXuLy':
        return 'Đang xử lý';
      case 'resolved':
      case 'daXuLy':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  const filteredIncidents = incidents.filter(i => 
    (i.title || i.tieuDe || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Báo cáo <span className="text-primary italic">Sự cố</span></h1>
          <p className="text-slate-500 font-medium">Gửi và theo dõi các yêu cầu hỗ trợ kỹ thuật tại phòng của bạn.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 font-bold group">
          <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform" /> Báo cáo sự cố mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-100 shadow-soft p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Tìm theo tiêu đề hoặc mã số..." 
                className="pl-11 h-12 bg-slate-50 border-slate-100 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2">
              <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200">
                 Tất cả
              </Button>
              <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200">
                 Mới nhất
              </Button>
           </div>
        </div>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-slate-50 border-0 rounded-3xl" />
          ))
        ) : filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <Card key={incident._id} className="border-slate-100 shadow-soft rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Status Strip */}
                  <div className={cn(
                    "w-full md:w-3 h-3 md:h-auto",
                    (incident.status === 'resolved' || incident.trangThai === 'daXuLy') ? "bg-brand-green" : "bg-primary"
                  )} />
                  
                  <div className="p-10 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatusColor(incident.status || incident.trangThai)} className="h-8 px-5">
                          {getStatusLabel(incident.status || incident.trangThai)}
                        </Badge>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {incident._id.slice(-8)}</span>
                      </div>
                      <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="h-4 w-4 mr-2 text-primary" /> {formatDate(incident.createdAt)}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-primary transition-colors">
                      {incident.title || incident.tieuDe}
                    </h3>
                    <p className="text-slate-500 font-medium line-clamp-2 mb-10 text-lg leading-relaxed">
                      {incident.description || incident.moTa}
                    </p>
                    
                    <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center text-slate-400 text-sm font-bold">
                          <MessageSquare className="h-5 w-5 mr-2.5 text-slate-300" /> {incident.comments?.length || 0} Phản hồi
                        </div>
                        {incident.images?.length > 0 && (
                          <div className="flex items-center text-slate-400 text-sm font-bold">
                            <ImageIcon className="h-5 w-5 mr-2.5 text-slate-300" /> {incident.images.length} Hình ảnh
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" className="h-10 px-6 rounded-xl font-bold text-primary group-hover:bg-primary/5">
                        Xem chi tiết <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] border border-slate-100 p-24 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8">
                <CheckCircle2 className="h-10 w-10 text-brand-green/30" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Mọi thứ đều ổn!</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">Bạn chưa có báo cáo sự cố nào. Chúc bạn một ngày sống thật thoải mái tại nơi ở của mình.</p>
              <Button className="h-14 px-10 rounded-2xl font-bold shadow-lg shadow-primary/20">
                Gửi báo cáo đầu tiên
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
