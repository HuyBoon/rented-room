'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  Loader2,
  X,
  Plus,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { HopDong, Room, KhachThue } from '@/types';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ChinhSuaHopDongPage() {
  const router = useRouter();
  const params = useParams();
  const hopDongId = params.id as string;

  const [hopDong, setHopDong] = useState<HopDong | null>(null);
  const [phongList, setPhongList] = useState<Room[]>([]);
  const [khachThueList, setKhachThueList] = useState<KhachThue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    contractCode: '',
    roomId: '',
    tenantIds: [] as string[],
    representativeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    rentPrice: 0,
    deposit: 0,
    paymentCycle: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    paymentDay: 15,
    terms: '',
    electricityPrice: 3500,
    waterPrice: 25000,
    electricityStart: 0,
    waterStart: 0,
    serviceFees: [] as Array<{name: string, amount: number}>,
    status: 'active' as 'active' | 'expired' | 'cancelled',
  });

  const [newPhiDichVu, setNewPhiDichVu] = useState({ ten: '', gia: 0 });
  const [openPhong, setOpenPhong] = useState(false);
  const [openKhachThue, setOpenKhachThue] = useState(false);
  const [openNguoiDaiDien, setOpenNguoiDaiDien] = useState(false);

  useEffect(() => {
    if (hopDongId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hopDongId]);

  const fetchData = async () => {
    try {
      // Fetch hợp đồng chi tiết theo ID
      const hopDongResponse = await fetch(`/api/contracts/${hopDongId}`);
      if (hopDongResponse.ok) {
        const hopDongData = await hopDongResponse.json();
        const hopDongItem = hopDongData.data;
        if (hopDongItem) {
          setHopDong(hopDongItem);
          console.log('Hop dong loaded for editing:', hopDongItem);
          
          setFormData({
            contractCode: hopDongItem.contractCode || '',
            roomId: typeof hopDongItem.roomId === 'object' ? (hopDongItem.roomId as {_id: string})?._id || '' : hopDongItem.roomId || '',
            tenantIds: hopDongItem.tenantIds?.map((kt: string | { _id: string }) => typeof kt === 'object' ? kt._id : kt) || [],
            representativeId: typeof hopDongItem.representativeId === 'object' ? (hopDongItem.representativeId as {_id: string})?._id || '' : hopDongItem.representativeId || '',
            startDate: hopDongItem.startDate ? hopDongItem.startDate.toString().split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: hopDongItem.endDate ? hopDongItem.endDate.toString().split('T')[0] : '',
            rentPrice: hopDongItem.rentPrice || 0,
            deposit: hopDongItem.deposit || 0,
            paymentCycle: hopDongItem.paymentCycle || 'monthly',
            paymentDay: hopDongItem.paymentDay || 15,
            terms: hopDongItem.terms || '',
            electricityPrice: hopDongItem.electricityPrice || 3500,
            waterPrice: hopDongItem.waterPrice || 25000,
            electricityStart: hopDongItem.electricityStart || 0,
            waterStart: hopDongItem.waterStart || 0,
            serviceFees: hopDongItem.serviceFees || [],
            status: hopDongItem.status || 'active',
          });
        } else {
          toast.error('Không tìm thấy hợp đồng');
          router.push('/dashboard/contracts');
          return;
        }
      } else {
        toast.error('Lỗi khi tải thông tin hợp đồng');
        router.push('/dashboard/contracts');
        return;
      }

      // Fetch phong data
      const phongResponse = await fetch('/api/rooms?limit=100');
      if (phongResponse.ok) {
        const phongData = await phongResponse.json();
        setPhongList(phongData.data || []);
      }

      // Fetch khach thue data
      const khachThueResponse = await fetch('/api/tenants?limit=100');
      if (khachThueResponse.ok) {
        const khachThueData = await khachThueResponse.json();
        setKhachThueList(khachThueData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handlePhongChange = (phongId: string) => {
    const selectedPhong = phongList.find(p => p._id === phongId);
    if (selectedPhong) {
      setFormData(prev => ({
        ...prev,
        roomId: phongId,
        rentPrice: selectedPhong.rentPrice,
        deposit: selectedPhong.deposit,
      }));
    }
    setOpenPhong(false);
  };

  const toggleKhachThue = (khachThueId: string) => {
    setFormData(prev => ({
      ...prev,
      tenantIds: prev.tenantIds.includes(khachThueId)
        ? prev.tenantIds.filter(id => id !== khachThueId)
        : [...prev.tenantIds, khachThueId]
    }));
  };

  const addPhiDichVu = () => {
    if (newPhiDichVu.ten && newPhiDichVu.gia > 0) {
      setFormData(prev => ({
        ...prev,
        serviceFees: [...prev.serviceFees, { name: newPhiDichVu.ten, amount: newPhiDichVu.gia }]
      }));
      setNewPhiDichVu({ ten: '', gia: 0 });
    }
  };

  const removePhiDichVu = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceFees: prev.serviceFees.filter((_, i) => i !== index)
    }));
  };

  const calculateEndDate = (startDate: string, months: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toISOString().split('T')[0];
  };

  const setQuickDuration = (months: number) => {
    if (formData.startDate) {
      const endDate = calculateEndDate(formData.startDate, months);
      setFormData(prev => ({
        ...prev,
        endDate: endDate
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/contracts/${hopDongId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Xóa cache để force refresh data
        sessionStorage.removeItem('hop-dong-data');
        toast.success(result.message || 'Đã cập nhật hợp đồng thành công');
        // Sử dụng replace để không tạo history entry mới
        // và refresh để cập nhật dữ liệu server-side
        router.replace('/dashboard/contracts');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Có lỗi xảy ra khi lưu hợp đồng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!hopDong) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/dashboard/contracts')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Không tìm thấy hợp đồng</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/dashboard/contracts')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Chỉnh sửa hợp đồng</h1>
          <p className="text-xs md:text-sm text-gray-600">Cập nhật thông tin hợp đồng {hopDong.contractCode}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Thông tin hợp đồng</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Cập nhật thông tin hợp đồng {hopDong.contractCode}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="maHopDong" className="text-xs md:text-sm">Mã hợp đồng</Label>
                <Input
                  id="maHopDong"
                  value={formData.contractCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractCode: e.target.value.toUpperCase() }))}
                  placeholder="HD001"
                  required
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Phòng *</Label>
                <Popover open={openPhong} onOpenChange={setOpenPhong}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPhong}
                      className="w-full justify-between text-sm"
                      size="sm"
                    >
                      {formData.roomId
                        ? phongList.find((phong) => phong._id === formData.roomId)?.roomCode
                        : "Chọn phòng..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] md:w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm phòng..." />
                      <CommandEmpty>Không tìm thấy phòng.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {phongList.map((phong) => (
                          <CommandItem
                            key={phong._id}
                            value={`${phong.roomCode} ${phong.area} ${phong.rentPrice}`}
                            onSelect={() => handlePhongChange(phong._id!)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.roomId === phong._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{phong.roomCode} - {phong.area}m²</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(phong.rentPrice)}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Người đại diện</Label>
                <Popover open={openNguoiDaiDien} onOpenChange={setOpenNguoiDaiDien}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openNguoiDaiDien}
                      className="w-full justify-between text-sm"
                      size="sm"
                      disabled={formData.tenantIds.length === 0}
                    >
                      {formData.representativeId
                        ? khachThueList.find((k) => k._id === formData.representativeId)?.fullName
                        : "Chọn người đại diện..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] md:w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm..." />
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {khachThueList
                          .filter(k => formData.tenantIds.includes(k._id!))
                          .map((khachThue) => (
                            <CommandItem
                              key={khachThue._id}
                              value={khachThue.fullName}
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, representativeId: khachThue._id! }));
                                setOpenNguoiDaiDien(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.representativeId === khachThue._id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {khachThue.fullName}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Khách thuê</Label>
              <Popover open={openKhachThue} onOpenChange={setOpenKhachThue}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKhachThue}
                    className="w-full justify-between min-h-10 h-auto text-sm"
                    size="sm"
                  >
                    <div className="flex flex-wrap gap-1 text-xs md:text-sm">
                      {formData.tenantIds.length === 0 ? (
                        <span className="text-muted-foreground">Chọn khách thuê...</span>
                      ) : (
                        formData.tenantIds.map((id) => {
                          const khachThue = khachThueList.find(k => k._id === id);
                          return (
                            <Badge key={id} variant="secondary" className="mr-1">
                              {khachThue?.fullName}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[90vw] md:w-full p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm khách thuê..." className="text-sm" />
                    <CommandEmpty className="text-sm">Không tìm thấy khách thuê.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {khachThueList.map((khachThue) => (
                        <CommandItem
                          key={khachThue._id}
                          value={khachThue.fullName}
                          onSelect={() => toggleKhachThue(khachThue._id!)}
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <div className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              formData.tenantIds.includes(khachThue._id!)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                              <Check className="h-4 w-4" />
                            </div>
                            <span>{khachThue.fullName}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {khachThue.phoneNumber}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Đã chọn {formData.tenantIds.length} khách thuê
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngayBatDau" className="text-xs md:text-sm">Ngày bắt đầu</Label>
                <Input
                  id="ngayBatDau"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ngayKetThuc" className="text-xs md:text-sm">Ngày kết thúc</Label>
                <Input
                  id="ngayKetThuc"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                  className="text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDuration(3)}
                    className="text-xs"
                  >
                    3 tháng
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDuration(6)}
                    className="text-xs"
                  >
                    6 tháng
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDuration(12)}
                    className="text-xs"
                  >
                    1 năm
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="giaThue" className="text-xs md:text-sm">Giá thuê (VNĐ/tháng)</Label>
                <Input
                  id="giaThue"
                  type="number"
                  min="0"
                  value={formData.rentPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, rentPrice: parseInt(e.target.value) || 0 }))}
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {formatCurrency(formData.rentPrice)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tienCoc" className="text-xs md:text-sm">Tiền cọc (VNĐ)</Label>
                <Input
                  id="tienCoc"
                  type="number"
                  min="0"
                  value={formData.deposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, deposit: parseInt(e.target.value) || 0 }))}
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {formatCurrency(formData.deposit)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ngayThanhToan" className="text-xs md:text-sm">Ngày thanh toán</Label>
                <Input
                  id="ngayThanhToan"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.paymentDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentDay: parseInt(e.target.value) || 1 }))}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="chuKyThanhToan" className="text-xs md:text-sm">Chu kỳ thanh toán</Label>
                <Select value={formData.paymentCycle} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentCycle: value as 'monthly' | 'quarterly' | 'yearly' }))}>
                  <SelectTrigger className="text-sm" size="sm">
                    <SelectValue placeholder="Chọn chu kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly" className="text-sm">Tháng</SelectItem>
                    <SelectItem value="quarterly" className="text-sm">Quý</SelectItem>
                    <SelectItem value="yearly" className="text-sm">Năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="giaDien" className="text-xs md:text-sm">Giá điện (VNĐ/kWh)</Label>
                <Input
                  id="giaDien"
                  type="number"
                  min="0"
                  value={formData.electricityPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, electricityPrice: parseInt(e.target.value) || 0 }))}
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {formatCurrency(formData.electricityPrice)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="giaNuoc" className="text-xs md:text-sm">Giá nước (VNĐ/m³)</Label>
                <Input
                  id="giaNuoc"
                  type="number"
                  min="0"
                  value={formData.waterPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, waterPrice: parseInt(e.target.value) || 0 }))}
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {formatCurrency(formData.waterPrice)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trangThai" className="text-xs md:text-sm">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'expired' | 'cancelled' }))}>
                  <SelectTrigger className="text-sm" size="sm">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="text-sm">Hoạt động</SelectItem>
                    <SelectItem value="expired" className="text-sm">Hết hạn</SelectItem>
                    <SelectItem value="cancelled" className="text-sm">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="chiSoDienBanDau" className="text-xs md:text-sm">Chỉ số điện ban đầu (kWh)</Label>
                <Input
                  id="chiSoDienBanDau"
                  type="number"
                  min="0"
                  value={formData.electricityStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, electricityStart: parseInt(e.target.value) || 0 }))}
                  placeholder="Nhập chỉ số điện ban đầu"
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  Chỉ số đồng hồ điện khi bắt đầu hợp đồng
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chiSoNuocBanDau" className="text-xs md:text-sm">Chỉ số nước ban đầu (m³)</Label>
                <Input
                  id="chiSoNuocBanDau"
                  type="number"
                  min="0"
                  value={formData.waterStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, waterStart: parseInt(e.target.value) || 0 }))}
                  placeholder="Nhập chỉ số nước ban đầu"
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  Chỉ số đồng hồ nước khi bắt đầu hợp đồng
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dieuKhoan" className="text-xs md:text-sm">Điều khoản</Label>
              <Textarea
                id="dieuKhoan"
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                rows={8}
                required
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Phí dịch vụ</Label>
              <div className="space-y-2">
                {formData.serviceFees.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm flex-1">{service.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(service.amount)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhiDichVu(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <div className="w-[50%]">
                    <Input
                      placeholder="Tên dịch vụ"
                      value={newPhiDichVu.ten}
                      onChange={(e) => setNewPhiDichVu(prev => ({ ...prev, ten: e.target.value }))}
                    />
                  </div>
                  <div className="w-[40%]">
                    <Input
                      placeholder="Giá"
                      type="number"
                      min="0"
                      value={newPhiDichVu.gia}
                      onChange={(e) => setNewPhiDichVu(prev => ({ ...prev, gia: parseInt(e.target.value) || 0 }))}
                    />
                    {newPhiDichVu.gia > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(newPhiDichVu.gia)}
                      </span>
                    )}
                  </div>
                  <div className="w-[10%]">
                    <Button type="button" onClick={addPhiDichVu} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/contracts')}
                disabled={submitting}
                className="w-full sm:w-auto sm:min-w-[80px]"
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                size="sm"
                disabled={submitting}
                className="w-full sm:w-auto sm:min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật hợp đồng
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

