'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCache } from '@/hooks/use-cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Calendar,
  Users,
  Eye,
  Filter,
  CheckCircle,
  Clock,
  RefreshCw,
  Home,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import { Issue, Room, Tenant, Contract } from '@/types';
import { SuCoImageUpload } from '@/components/ui/su-co-image-upload';
import { DeleteConfirmPopover } from '@/components/ui/delete-confirm-popover';
import { SuCoDataTable } from './table';

export default function SuCoPage() {
  const cache = useCache<{
    suCoList: Issue[];
    phongList: Room[];
    khachThueList: Tenant[];
    hopDongList: Contract[];
  }>({ key: 'su-co-data', duration: 300000 });
  
  const [suCoList, setSuCoList] = useState<Issue[]>([]);
  const [phongList, setPhongList] = useState<Room[]>([]);
  const [khachThueList, setKhachThueList] = useState<Tenant[]>([]);
  const [hopDongList, setHopDongList] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSuCo, setEditingSuCo] = useState<Issue | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Sự cố';
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (!forceRefresh) {
        const cachedData = cache.getCache();
        if (cachedData) {
          setSuCoList(cachedData.suCoList || []);
          setPhongList(cachedData.phongList || []);
          setKhachThueList(cachedData.khachThueList || []);
          setHopDongList(cachedData.hopDongList || []);
          setLoading(false);
          return;
        }
      }
      
      // Fetch sự cố từ API
      const suCoResponse = await fetch('/api/incidents');
      const suCoData = await suCoResponse.json();
      const suCos = suCoData.success ? suCoData.data : [];
      setSuCoList(suCos);

      // Fetch phòng từ API
      const phongResponse = await fetch('/api/rooms');
      const phongData = await phongResponse.json();
      const phongs = phongData.success ? phongData.data : [];
      setPhongList(phongs);

      // Fetch khách thuê từ API
      const khachThueResponse = await fetch('/api/tenants');
      const khachThueData = await khachThueResponse.json();
      const khachThues = khachThueData.success ? khachThueData.data : [];
      setKhachThueList(khachThues);

      // Fetch hợp đồng từ API
      const hopDongResponse = await fetch('/api/contracts');
      const hopDongData = await hopDongResponse.json();
      const hopDongs = hopDongData.success ? hopDongData.data : [];
      setHopDongList(hopDongs);
      
      cache.setCache({
        suCoList: suCos,
        phongList: phongs,
        khachThueList: khachThues,
        hopDongList: hopDongs,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setSuCoList([]);
      setPhongList([]);
      setKhachThueList([]);
      setHopDongList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    cache.setIsRefreshing(true);
    await fetchData(true);
    cache.setIsRefreshing(false);
    toast.success('Đã tải dữ liệu mới nhất');
  };

  const filteredSuCo = suCoList.filter(suCo => {
    const matchesSearch = suCo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suCo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || suCo.status === statusFilter;
    const matchesType = typeFilter === 'all' || suCo.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || suCo.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">New</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'utility':
        return <Badge variant="secondary">Utility</Badge>;
      case 'furniture':
        return <Badge variant="outline">Furniture</Badge>;
      case 'cleanliness':
        return <Badge variant="outline">Cleanliness</Badge>;
      case 'security':
        return <Badge variant="outline">Security</Badge>;
      case 'other':
        return <Badge variant="outline">Other</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'critical':
        return <Badge variant="destructive" className="bg-red-600">Critical</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getRoomName = (roomId: string | { roomCode: string }) => {
    if (typeof roomId === 'string') {
      const roomObj = phongList.find(p => p._id === roomId);
      return roomObj?.roomCode || 'Unknown';
    }
    return roomId?.roomCode || 'Unknown';
  };

  const getTenantName = (tenantId: string | { fullName: string }) => {
    if (typeof tenantId === 'string') {
      const tenantObj = khachThueList.find(k => k._id === tenantId);
      return tenantObj?.fullName || 'Unknown';
    }
    return tenantId?.fullName || 'Unknown';
  };

  const handleEdit = (suCo: Issue) => {
    setEditingSuCo(suCo);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        cache.clearCache();
        setSuCoList(prev => prev.filter(suCo => suCo._id !== id));
        toast.success('Xóa sự cố thành công');
      } else {
        console.error('Error deleting su co:', result.message);
        toast.error('Có lỗi xảy ra: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting su co:', error);
      toast.error('Có lỗi xảy ra khi xóa sự cố');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuCoList(prev => prev.map(suCo => {
          if (suCo._id === id) {
            return result.data;
          }
          return suCo;
        }));
        toast.success('Cập nhật trạng thái thành công');
      } else {
        console.error('Error updating status:', result.message);
        toast.error('Có lỗi xảy ra: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Quản lý sự cố</h1>
          <p className="text-xs md:text-sm text-gray-600">Theo dõi và xử lý các sự cố từ khách thuê</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={cache.isRefreshing}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${cache.isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{cache.isRefreshing ? 'Đang tải...' : 'Tải mới'}</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingSuCo(null)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Báo cáo sự cố</span>
                <span className="sm:hidden">Báo cáo</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] md:w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSuCo ? 'Chỉnh sửa sự cố' : 'Báo cáo sự cố mới'}
              </DialogTitle>
              <DialogDescription>
                {editingSuCo ? 'Cập nhật thông tin sự cố' : 'Nhập thông tin sự cố mới'}
              </DialogDescription>
            </DialogHeader>
            
            <SuCoForm 
              suCo={editingSuCo}
              phongList={phongList}
              khachThueList={khachThueList}
              hopDongList={hopDongList}
              getTenantName={getTenantName}
              onClose={() => setIsDialogOpen(false)}
              onSuccess={() => {
                cache.clearCache();
                setIsDialogOpen(false);
                fetchData(true);
              }}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4 lg:gap-6">
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Tổng sự cố</p>
              <p className="text-base md:text-2xl font-bold">{suCoList.length}</p>
            </div>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Mới</p>
              <p className="text-base md:text-2xl font-bold text-red-600">
               {suCoList.filter(s => s.status === 'new').length}
              </p>
            </div>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Processing</p>
              <p className="text-base md:text-2xl font-bold text-orange-600">
                {suCoList.filter(s => s.status === 'processing').length}
              </p>
            </div>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Resolved</p>
              <p className="text-base md:text-2xl font-bold text-green-600">
                {suCoList.filter(s => s.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Danh sách sự cố</CardTitle>
          <CardDescription>
            {filteredSuCo.length} sự cố được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <SuCoDataTable
            data={filteredSuCo}
            phongList={phongList}
            khachThueList={khachThueList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách sự cố</h2>
          <span className="text-sm text-gray-500">{filteredSuCo.length} sự cố</span>
        </div>
        
        {/* Mobile Filters */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sự cố..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">All Status</SelectItem>
                <SelectItem value="new" className="text-sm">New</SelectItem>
                <SelectItem value="processing" className="text-sm">Processing</SelectItem>
                <SelectItem value="resolved" className="text-sm">Resolved</SelectItem>
                <SelectItem value="cancelled" className="text-sm">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">All Types</SelectItem>
                <SelectItem value="utility" className="text-sm">Utility</SelectItem>
                <SelectItem value="furniture" className="text-sm">Furniture</SelectItem>
                <SelectItem value="cleanliness" className="text-sm">Cleanliness</SelectItem>
                <SelectItem value="security" className="text-sm">Security</SelectItem>
                <SelectItem value="other" className="text-sm">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">All Priorities</SelectItem>
                <SelectItem value="low" className="text-sm">Low</SelectItem>
                <SelectItem value="medium" className="text-sm">Medium</SelectItem>
                <SelectItem value="high" className="text-sm">High</SelectItem>
                <SelectItem value="critical" className="text-sm">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="space-y-3">
          {filteredSuCo.map((suCo) => {
            const roomInfo = typeof suCo.roomId === 'object' ? suCo.roomId : phongList.find(p => p._id === suCo.roomId);
            const tenantInfo = typeof suCo.tenantId === 'object' ? suCo.tenantId : khachThueList.find(k => k._id === suCo.tenantId);
            
            return (
              <Card key={suCo._id} className="p-4">
                <div className="space-y-3">
                  {/* Header with title and status */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{suCo.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">
                          {roomInfo?.roomCode || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {getStatusBadge(suCo.status)}
                      {getPriorityBadge(suCo.priority)}
                    </div>
                  </div>

                  {/* Reporter and type info */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {tenantInfo?.fullName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{getTypeBadge(suCo.type)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Reported: {new Date(suCo.reportedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="border-t pt-2">
                    <p className="text-xs text-gray-600 line-clamp-2">{suCo.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(suCo)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(suCo._id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredSuCo.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có sự cố nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Form component for adding/editing su co
function SuCoForm({ 
  suCo, 
  phongList,
  khachThueList,
  hopDongList,
  getTenantName,
  onClose, 
  onSuccess 
}: { 
  suCo: Issue | null;
  phongList: Room[];
  khachThueList: Tenant[];
  hopDongList: any[];
  getTenantName: (tenant: any) => string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    roomId: suCo?.roomId || '',
    tenantId: suCo?.tenantId || '',
    title: suCo?.title || '',
    description: suCo?.description || '',
    type: suCo?.type || 'utility',
    priority: suCo?.priority || 'medium',
    status: suCo?.status || 'new',
    handlerNotes: suCo?.handlerNotes || '',
    images: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [images, setImages] = useState<string[]>(suCo?.images || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: phải chọn phòng và có khách thuê
    if (!formData.roomId) {
      toast.error('Please select a room');
      return;
    }
    
    if (!formData.tenantId) {
      toast.error('No tenant found for this room. Please check the contract.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        images: images,
        reportedAt: suCo ? suCo.reportedAt : new Date().toISOString(),
      };

      const url = suCo ? `/api/incidents/${suCo._id}` : '/api/incidents';
      const method = suCo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(suCo ? 'Issue updated successfully' : 'Issue reported successfully');
        onSuccess();
      } else {
        console.error('Error submitting form:', result.message);
        toast.error('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleRoomChange = async (roomId: string) => {
    setFormData(prev => ({ ...prev, roomId: roomId }));
    
    // Tìm thông tin phòng được chọn
    const room = phongList.find(p => p._id === roomId);
    setSelectedRoom(room);
    
    if (room) {
      // Tìm hợp đồng đang hoạt động cho phòng này
      const currentContract = hopDongList.find(hd => 
        (hd.roomId?._id || hd.roomId || hd.phong?._id || hd.phong) === roomId && hd.status === 'active'
      );
      
      if (currentContract && currentContract.tenantId) {
        // Lấy người đại diện làm khách thuê chính
        setFormData(prev => ({ ...prev, tenantId: currentContract.tenantId._id || currentContract.tenantId }));
      } else {
        // Nếu không tìm thấy hợp đồng hoạt động, reset khách thuê
        setFormData(prev => ({ ...prev, tenantId: '' }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="room" className="text-xs md:text-sm">Room</Label>
          <Select value={formData.roomId as string} onValueChange={handleRoomChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {phongList.map((phong) => (
                <SelectItem key={phong._id} value={phong._id!} className="text-sm">
                  {phong.roomCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tenant" className="text-xs md:text-sm">Tenant</Label>
          {formData.tenantId ? (
            <div className="p-3 bg-gray-50 rounded-md border">
              <div className="text-sm font-medium">
                {getTenantName(formData.tenantId)}
              </div>
              <div className="text-xs text-gray-500">
                {selectedRoom && `Room ${selectedRoom.roomCode}`}
              </div>
              <div className="text-xs text-green-600 mt-1">
                ✓ Automatically fetched from active contract
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="text-sm text-yellow-800">
                Please select a room to automatically fetch tenant information
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs md:text-sm">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter issue title"
          required
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs md:text-sm">Full Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          placeholder="Details about the issue..."
          required
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-xs md:text-sm">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utility" className="text-sm">Utility</SelectItem>
              <SelectItem value="furniture" className="text-sm">Furniture</SelectItem>
              <SelectItem value="cleanliness" className="text-sm">Cleanliness</SelectItem>
              <SelectItem value="security" className="text-sm">Security</SelectItem>
              <SelectItem value="other" className="text-sm">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-xs md:text-sm">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low" className="text-sm">Low</SelectItem>
              <SelectItem value="medium" className="text-sm">Medium</SelectItem>
              <SelectItem value="high" className="text-sm">High</SelectItem>
              <SelectItem value="critical" className="text-sm">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {suCo && (
        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs md:text-sm">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new" className="text-sm">New</SelectItem>
              <SelectItem value="processing" className="text-sm">Processing</SelectItem>
              <SelectItem value="resolved" className="text-sm">Resolved</SelectItem>
              <SelectItem value="cancelled" className="text-sm">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {suCo && (formData.status === 'processing' || formData.status === 'resolved') && (
        <div className="space-y-2">
          <Label htmlFor="handlerNotes" className="text-xs md:text-sm">Handler Notes</Label>
          <Textarea
            id="handlerNotes"
            value={formData.handlerNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, handlerNotes: e.target.value }))}
            rows={3}
            placeholder="Notes about the resolution process..."
            className="text-sm"
          />
        </div>
      )}

      <SuCoImageUpload
        images={images}
        onImagesChange={setImages}
        maxImages={5}
      />

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Processing...' : (suCo ? 'Update' : 'Report')}
        </Button>
      </DialogFooter>
    </form>
  );
}
