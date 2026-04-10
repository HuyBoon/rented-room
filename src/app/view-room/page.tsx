'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Home, 
  MapPin, 
  Users, 
  Square, 
  DollarSign, 
  Phone,
  Eye,
  ArrowLeft,
  Star,
  ZoomIn,
  Heart,
  Share2,
  Wind,
  Coffee,
  Wifi,
  Tv,
  Utensils,
  Trello,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';
import { Phong, ToaNha } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { ContactModal } from '@/components/shared/contact-modal';

export default function RoomDiscoveryPage() {
  const [phongList, setPhongList] = useState<Phong[]>([]);
  const [toaNhaList, setToaNhaList] = useState<ToaNha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToaNha, setSelectedToaNha] = useState('all');
  const [selectedTrangThai, setSelectedTrangThai] = useState('all');
  const [selectedPhong, setSelectedPhong] = useState<Phong | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchPhong();
    fetchToaNha();
    
    // Load favorites
    const savedFavs = localStorage.getItem('favoriteRooms');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const phongParam = urlParams.get('phong');
    if (phongParam) {
      setSearchTerm(phongParam);
    }
  }, []);

  const fetchPhong = async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (selectedToaNha !== 'all') params.append('toaNha', selectedToaNha);
      if (selectedTrangThai !== 'all') params.append('trangThai', selectedTrangThai);
      
      const response = await fetch(`/api/rooms-public?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPhongList(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching phong:', error);
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchToaNha = async () => {
    try {
      const response = await fetch('/api/buildings-public');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setToaNhaList(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  useEffect(() => {
    fetchPhong();
  }, [selectedToaNha, selectedTrangThai]);

  useEffect(() => {
    if (phongList.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const phongParam = urlParams.get('phong');
      if (phongParam) {
        const targetPhong = phongList.find(p => p.roomCode.toLowerCase() === phongParam.toLowerCase());
        if (targetPhong) {
          setSelectedPhong(targetPhong);
          setShowDetails(true);
        }
      }
    }
  }, [phongList]);

  const filteredPhong = useMemo(() => {
    return phongList.filter(phong =>
      phong.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phong.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof phong.buildingId === 'object' && phong.buildingId && (phong.buildingId as any).name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [phongList, searchTerm]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favoriteRooms', JSON.stringify(newFavs));
    toast.success(favorites.includes(id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTrangThaiBadge = (status: string) => {
    const variants = {
      available: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', label: 'Cò̀n phòng' },
      booked: { bg: 'bg-amber-100/80', text: 'text-amber-700', label: 'Đã đặt' },
      rented: { bg: 'bg-indigo-100/80', text: 'text-indigo-700', label: 'Đang thuê' },
      maintenance: { bg: 'bg-rose-100/80', text: 'text-rose-700', label: 'Bảo trì' },
    };
    const config = variants[status as keyof typeof variants] || variants.available;
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const amenityIcons: Record<string, any> = {
    dieuhoa: <Wind className="h-4 w-4" />,
    nonglanh: <Zap className="h-4 w-4" />,
    tulanh: <Coffee className="h-4 w-4" />,
    giuong: <Trello className="h-4 w-4" />,
    wifi: <Wifi className="h-4 w-4" />,
    tivi: <Tv className="h-4 w-4" />,
    bep: <Utensils className="h-4 w-4" />,
  };

  const amenityLabels: Record<string, string> = {
    dieuhoa: 'Điều hòa',
    nonglanh: 'Nóng lạnh',
    tulanh: 'Tủ lạnh',
    giuong: 'Giường',
    tuquanao: 'Tủ quần áo',
    banlamviec: 'Bàn làm việc',
    ghe: 'Ghế',
    tivi: 'TV',
    wifi: 'WiFi',
    maygiat: 'Máy giặt',
    bep: 'Bếp',
  };

  if (showDetails && selectedPhong) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
        <div className="container mx-auto px-4 py-8 flex-1">
          <Button
            variant="ghost"
            onClick={() => setShowDetails(false)}
            className="mb-8 font-bold text-slate-600 hover:text-indigo-600 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Quay lại khám phá
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Gallery Section */}
            <div className="lg:col-span-3 space-y-6">
              <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl bg-white border-4 border-white">
                <img
                  src={selectedPhong.images?.[selectedImageIndex] || '/placeholder-room.jpg'}
                  alt="Room"
                  className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <ImageCarousel 
                  images={selectedPhong.images || []} 
                  trigger={
                    <Button variant="outline" className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md border-0 shadow-lg rounded-xl font-bold uppercase tracking-wider text-xs h-10 px-4">
                      <ZoomIn className="h-4 w-4 mr-2" /> Xem {selectedPhong.images?.length || 0} ảnh
                    </Button>
                  }
                />
              </div>

              {selectedPhong.images && selectedPhong.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {selectedPhong.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex ? 'border-indigo-600 ring-4 ring-indigo-100' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <Info className="h-5 w-5 text-indigo-600 mr-2" /> Đặc điểm & Mô tả
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                  {selectedPhong.description || "Chưa có mô tả chi tiết cho phòng này. Vui lòng liên hệ quản lý để biết thêm thông tin chi tiết về không gian sống này."}
                </p>

                <h3 className="text-xl font-bold text-slate-900 mb-6">Tiện ích đi kèm</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {selectedPhong.amenities?.map((amenity: string) => (
                    <div key={amenity} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-indigo-50 hover:border-indigo-100">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm mb-3">
                        {amenityIcons[amenity] || <Star className="h-5 w-5" />}
                      </div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-tight text-center">
                        {amenityLabels[amenity] || amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-2xl bg-white rounded-[2rem] p-8 md:sticky md:top-28">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-3 border-emerald-200 uppercase font-black tracking-widest text-[10px] px-3">
                      Phòng đang mở
                    </Badge>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Phòng {selectedPhong.roomCode}</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => toggleFavorite(e, selectedPhong._id!)} className={`rounded-2xl transition-all ${favorites.includes(selectedPhong._id!) ? 'text-rose-500 bg-rose-50' : 'text-slate-300'}`}>
                    <Heart className={`h-6 w-6 ${favorites.includes(selectedPhong._id!) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-50">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{typeof selectedPhong.buildingId === 'object' ? (selectedPhong.buildingId as any).name : 'N/A'}</p>
                    <p className="text-sm text-slate-500">Tầng {selectedPhong.floor} • Quận 1, TP. HCM</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-5 bg-slate-50 rounded-3xl text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Diện tích</p>
                    <p className="text-xl font-black text-slate-900">{selectedPhong.area} m²</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Số người</p>
                    <p className="text-xl font-black text-slate-900">Tối đa {selectedPhong.maxTenants}</p>
                  </div>
                </div>

                <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-600/30 mb-8">
                  <p className="text-xs font-bold uppercase text-indigo-200 tracking-widest mb-1">Giá thuê hàng tháng</p>
                  <div className="text-3xl font-black">{formatCurrency(selectedPhong.rentPrice)}</div>
                  <p className="text-xs mt-2 text-indigo-100 opacity-80">* Chưa bao gồm phí dịch vụ (điện, nước, wifi...)</p>
                </div>

                <div className="space-y-4">
                  <ContactModal 
                    trigger={
                      <Button size="lg" className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-lg transition-all shadow-xl hover:shadow-indigo-500/20">
                        Thuê phòng ngay
                      </Button>
                    }
                  />
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold text-slate-600">
                      <Phone className="h-5 w-5 mr-2" /> Gọi điện
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold text-slate-600" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Đã sao chép liên kết');
                      }}>
                      <Share2 className="h-5 w-5 mr-2" /> Chia sẻ
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="pt-28 pb-16 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500 rounded-full blur-[200px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center items-center flex flex-col">
          <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 mb-6 border-indigo-500/30 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            Discovery Rooms
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
            Tìm không gian sống <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 transition-all cursor-default transition-all duration-300">đẳng cấp cho riêng bạn</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium mb-12">
            Hơn {phongList.length}+ phòng trọ cao cấp, đầy đủ tiện nghi tại các vị trí trung tâm đang chờ đón bạn.
          </p>

          {/* Integrated Filter Bar */}
          <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/10 shadow-3xl">
            <div className="grid grid-cols-1 items-center md:grid-cols-4 gap-3">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                  placeholder="Mã phòng, địa danh..." 
                  className="h-14 pl-14 pr-6 bg-white/5 border-0 text-white placeholder:text-slate-500 rounded-3xl font-bold focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedToaNha} onValueChange={setSelectedToaNha}>
                <SelectTrigger className="h-14 px-8 bg-white/5 border-0 text-white rounded-3xl font-bold focus:ring-2 focus:ring-indigo-500/50 transition-all">
                  <SelectValue placeholder="Tòa nhà" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-white/10 rounded-2xl">
                  <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                  {toaNhaList.map(b => (
                    <SelectItem key={b._id} value={b._id!}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTrangThai} onValueChange={setSelectedTrangThai}>
                <SelectTrigger className="h-14 px-8 bg-white/5 border-0 text-white rounded-3xl font-bold focus:ring-2 focus:ring-indigo-500/50 transition-all">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-white/10 rounded-2xl">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="available">Đang trống</SelectItem>
                  <SelectItem value="booked">Đã đặt</SelectItem>
                  <SelectItem value="rented">Đang thuê</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-600/20 transition-all">
                Tìm kiếm ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kết quả tìm kiếm</h2>
              <div className="h-8 w-px bg-slate-200" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{filteredPhong.length} phòng được hiển thị</p>
            </div>
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
               <Button variant="ghost" size="icon" className="h-10 w-10 text-indigo-600 bg-indigo-50 rounded-xl"><LayoutGrid className="h-5 w-5" /></Button>
               <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400"><ListFilter className="h-5 w-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPhong.map((room) => (
              <Card 
                key={room._id} 
                className="group relative overflow-hidden border-0 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer animate-in fade-in zoom-in-95 duration-700"
                onClick={() => {
                  setSelectedPhong(room);
                  setShowDetails(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {/* Favorite Button */}
                <button 
                  onClick={(e) => toggleFavorite(e, room._id!)}
                  className={`absolute top-6 right-6 z-20 p-3 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-lg ${
                    favorites.includes(room._id!) ? 'bg-rose-500 text-white scale-110' : 'bg-white/90 text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${favorites.includes(room._id!) ? 'fill-current' : ''}`} />
                </button>

                {/* Status Badge */}
                <div className="absolute top-6 left-6 z-20">
                  {getTrangThaiBadge(room.status)}
                </div>

                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] mx-4 mt-4">
                  <img
                    src={room.images?.[0] || '/placeholder-room.jpg'}
                    alt={room.roomCode}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex gap-3">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-[10px] font-black uppercase flex items-center">
                        <Square className="h-3 w-3 mr-1.5" /> {room.area}m²
                      </div>
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-[10px] font-black uppercase flex items-center">
                        <Users className="h-3 w-3 mr-1.5" /> {room.maxTenants}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-8">
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">{typeof room.buildingId === 'object' ? (room.buildingId as any).name : 'Toà nhà'}</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">Phòng {room.roomCode}</h3>
                  </div>
                  
                  <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-8 leading-relaxed">
                    {room.description || "Tọa lạc tại vị trí đắc địa, đầy đủ tiện nghi thiết yếu cho cuộc sống hiện đại."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-3xl font-black text-indigo-600 tracking-tight">{formatCurrency(room.rentPrice)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VNĐ / Hàng tháng</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white scale-90 group-hover:scale-100 group-hover:bg-indigo-600 transition-all duration-500 shadow-xl group-hover:shadow-indigo-500/30">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPhong.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2.5rem] shadow-xl border border-dashed border-slate-200">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <Home className="h-12 w-12 text-slate-300" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy phòng phù hợp</h3>
               <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Chúng tôi không tìm thấy kết quả khớp với bộ lọc của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc khác.</p>
               <Button onClick={() => { setSearchTerm(''); setSelectedToaNha('all'); setSelectedTrangThai('all'); }} className="bg-slate-900 hover:bg-black rounded-2xl h-12 px-8 font-bold text-white shadow-lg">
                 Xóa tất cả bộ lọc
               </Button>
            </div>
          )}
        </div>
      </section>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
