'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Maximize2, 
  Users, 
  ChevronRight, 
  Star,
  Zap,
  Filter,
  ArrowUpDown,
  Home,
  Heart,
  Share2,
  Info,
  Calendar,
  Phone,
  MessageSquare,
  LayoutGrid,
  ListFilter,
  X
} from 'lucide-react';
import { Phong, ToaNha } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { ContactModal } from '@/components/shared/contact-modal';

export default function RoomDiscoveryPage() {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [buildings, setBuildings] = useState<ToaNha[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Phong | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
    const storedFavorites = localStorage.getItem('roomFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, buildingsRes] = await Promise.all([
        fetch('/api/public/rooms'),
        fetch('/api/public/buildings')
      ]);

      const roomsData = await roomsRes.json();
      const buildingsData = await buildingsRes.json();

      if (roomsData.success) setRooms(roomsData.data);
      if (buildingsData.success) setBuildings(buildingsData.data);
    } catch (error) {
      console.error('Error fetching discovery data:', error);
      toast.error('Không thể đồng bộ dữ liệu phòng');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(roomId)
      ? favorites.filter(id => id !== roomId)
      : [...favorites, roomId];
    
    setFavorites(newFavorites);
    localStorage.setItem('roomFavorites', JSON.stringify(newFavorites));
    
    if (favorites.includes(roomId)) {
      toast.info('Đã xóa khỏi danh sách yêu thích');
    } else {
      toast.success('Đã lưu vào danh sách yêu thích');
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           room.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBuilding = selectedBuilding === 'all' || room.buildingId?._id === selectedBuilding;
      const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
      
      return matchesSearch && matchesBuilding && matchesStatus;
    });
  }, [rooms, searchQuery, selectedBuilding, selectedStatus]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu phòng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Header & Filter Bar */}
      <section className="bg-white border-b border-slate-200 py-12 mb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Tìm phòng trọ <span className="text-primary italic">Ưng ý</span>
            </h1>
            <p className="text-slate-500 font-medium">Hàng trăm lựa chọn tốt nhất đang chờ đón bạn.</p>
          </div>

          <div className="max-w-5xl mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="relative col-span-1 md:col-span-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="ID Phòng, mô tả..." 
                  className="pl-11 h-12 bg-white border-slate-200 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  className="w-full pl-11 h-12 bg-white border border-slate-200 rounded-xl text-slate-700 appearance-none cursor-pointer focus:border-primary outline-none transition-all text-sm font-bold"
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                >
                  <option value="all">Tất cả tòa nhà</option>
                  {buildings.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  className="w-full pl-11 h-12 bg-white border border-slate-200 rounded-xl text-slate-700 appearance-none cursor-pointer focus:border-primary outline-none transition-all text-sm font-bold"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Mọi trạng thái</option>
                  <option value="available">Còn trống</option>
                  <option value="renting">Đang thuê</option>
                </select>
              </div>

              <Button className="h-12 rounded-xl shadow-lg shadow-primary/20 font-bold">
                Tìm kiếm ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Grid */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Danh sách phòng</h2>
            <div className="h-px w-20 bg-slate-200" />
            <span className="text-sm font-bold text-slate-400">{filteredRooms.length} kết quả phù hợp</span>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="h-10 px-4 bg-white">Mới nhất <ChevronRight className="h-3 w-3 ml-2" /></Badge>
          </div>
        </div>

        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRooms.map((room) => (
              <Card 
                key={room._id} 
                className="group relative overflow-hidden bg-white border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedRoom(room)}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'} 
                    alt={room.roomCode} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant={room.status === 'available' ? 'success' : 'secondary'} className="h-8 shadow-md">
                      {room.status === 'available' ? 'Còn trống' : 'Hết phòng'}
                    </Badge>
                  </div>
                  
                  {/* Favorite Button */}
                  <button 
                    onClick={(e) => toggleFavorite(room._id, e)}
                    className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all ${
                      favorites.includes(room._id) 
                        ? 'bg-rose-500 text-white scale-110 shadow-lg' 
                        : 'bg-white/80 text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${favorites.includes(room._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Content Section */}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                        Phòng {room.roomCode}
                      </h3>
                      <div className="flex items-center text-xs font-bold text-slate-400 mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                        {room.buildingId?.name || 'Khu vực trung tâm'}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-2xl font-black text-primary tracking-tight">{formatPrice(room.rentPrice)}</span>
                    <span className="text-slate-400 text-xs font-bold ml-1 uppercase">/ Tháng</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-50">
                    <div className="flex flex-col items-center">
                      <Users className="h-4 w-4 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">{room.maxTenants || 0} Người</span>
                    </div>
                    <div className="flex flex-col items-center border-x border-slate-100">
                      <Maximize2 className="h-4 w-4 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">{room.roomArea || 0}m²</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Zap className="h-4 w-4 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Tiện nghi</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-24 text-center">
             <Info className="h-16 w-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Không tìm thấy phòng phù hợp</h3>
             <p className="text-slate-500 font-medium max-w-sm mx-auto">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
             <Button 
               variant="outline" 
               className="mt-8 px-8 border-slate-200"
               onClick={() => {setSearchQuery(''); setSelectedBuilding('all'); setSelectedStatus('all');}}
             >
               Đặt lại bộ lọc
             </Button>
          </div>
        )}
      </section>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
          <div className="container mx-auto px-6 py-12 md:py-24 max-w-6xl">
            <button 
              onClick={() => setSelectedRoom(null)}
              className="fixed top-8 right-8 z-[110] p-3 bg-white rounded-full text-slate-500 hover:text-black hover:rotate-90 transition-all duration-500 shadow-xl"
            >
              <X className="h-6 w-6" />
            </button>

            <Card className="bg-white border-0 shadow-3xl overflow-hidden rounded-[2.5rem] animate-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Media Column */}
                <div className="p-1">
                  <ImageCarousel images={selectedRoom.images || []} />
                </div>

                {/* Data Column */}
                <div className="p-10 md:p-14 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-primary mb-6">
                    <Home className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Chi tiết phòng: {selectedRoom.roomCode}</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Không gian sống <br /> <span className="text-primary italic">Lý tưởng nhất</span>
                  </h2>

                  <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
                     <span className="text-4xl font-black text-primary tracking-tighter">{formatPrice(selectedRoom.rentPrice)}</span>
                     <Badge variant="success" className="h-8 px-4">Còn trống</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
                    {[
                      { label: "Diện tích", value: selectedRoom.roomArea + " m²", icon: <Maximize2 className="h-4 w-4" /> },
                      { label: "Sức chứa", value: selectedRoom.maxTenants + " Người", icon: <Users className="h-4 w-4" /> },
                      { label: "Điện nước", value: "Giá dân", icon: <Zap className="h-4 w-4" /> },
                      { label: "Tòa nhà", value: selectedRoom.buildingId?.name || 'Trung tâm', icon: <Building2 className="h-4 w-4" /> },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="text-slate-400 p-2 bg-slate-50 rounded-lg w-fit">{item.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                        <p className="text-slate-900 font-black">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 mb-12">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Mô tả chi tiết</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">
                       {selectedRoom.description || 'Căn phòng hiện đại được thiết kế tối ưu diện tích, đảm bảo ánh sáng tự nhiên và thông gió tốt nhất. Đầy đủ tiện nghi cơ bản, khu vực an ninh và giao thông thuận tiện.'}
                     </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-1">
                        <ContactModal 
                          trigger={
                            <Button className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 text-base font-bold">
                              Liên hệ xem phòng ngay
                            </Button>
                          }
                        />
                     </div>
                     <Button variant="outline" className="h-16 px-8 rounded-2xl border-slate-200">
                        <Share2 className="h-5 w-5 text-slate-400" />
                     </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
