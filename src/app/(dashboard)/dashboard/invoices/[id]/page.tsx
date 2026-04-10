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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Zap,
  Droplets,
  Wrench,
  Calculator
} from 'lucide-react';
import { Invoice, Contract, Room, Tenant } from '@/types';
import { toast } from 'sonner';

// Helper functions
const getRoomName = (roomId: string | Room, roomList: Room[]) => {
  if (!roomId) return 'N/A';
  if (typeof roomId === 'object' && roomId.roomCode) {
    return roomId.roomCode;
  }
  if (typeof roomId === 'string') {
    const room = roomList.find(p => p._id === roomId);
    return room?.roomCode || 'N/A';
  }
  return 'N/A';
};

const getTenantName = (tenantId: string | Tenant, tenantList: Tenant[]) => {
  if (!tenantId) return 'N/A';
  if (typeof tenantId === 'object' && tenantId.fullName) {
    return tenantId.fullName;
  }
  if (typeof tenantId === 'string') {
    const tenant = tenantList.find(k => k._id === tenantId);
    return tenant?.fullName || 'N/A';
  }
  return 'N/A';
};

export default function ChinhSuaHoaDonPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [contractList, setContractList] = useState<Contract[]>([]);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [tenantList, setTenantList] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    invoiceCode: '',
    contractId: '',
    roomId: '',
    tenantId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    roomAmount: 0,
    electricityAmount: 0,
    electricityUsage: 0,
    electricityStart: 0,
    electricityEnd: 0,
    waterAmount: 0,
    waterUsage: 0,
    waterStart: 0,
    waterEnd: 0,
    serviceFees: [] as Array<{name: string, amount: number}>,
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    status: 'unpaid' as 'unpaid' | 'partiallyPaid' | 'paid' | 'overdue',
    dueDate: '',
    notes: '',
  });

  const [newPhiDichVu, setNewPhiDichVu] = useState({ ten: '', gia: 0 });

  useEffect(() => {
    if (invoiceId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const fetchData = async () => {
    try {
      // Fetch hóa đơn chi tiết theo ID
      const invoiceResponse = await fetch(`/api/invoices?id=${invoiceId}`);
      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        const invoiceItem = invoiceData.data;
        if (invoiceItem) {
          setInvoice(invoiceItem);
          console.log('Invoice loaded for editing:', invoiceItem);
          
          // Set form data
          console.log('Setting form data with electricity readings:', {
            electricityStart: invoiceItem.electricityStart,
            electricityEnd: invoiceItem.electricityEnd,
            waterStart: invoiceItem.waterStart,
            waterEnd: invoiceItem.waterEnd
          });
          
          setFormData({
            invoiceCode: invoiceItem.invoiceCode || '',
            contractId: typeof invoiceItem.contractId === 'object' ? (invoiceItem.contractId as {_id: string})?._id || '' : invoiceItem.contractId || '',
            roomId: typeof invoiceItem.roomId === 'object' ? (invoiceItem.roomId as {_id: string})?._id || '' : invoiceItem.roomId || '',
            tenantId: typeof invoiceItem.tenantId === 'object' ? (invoiceItem.tenantId as {_id: string})?._id || '' : invoiceItem.tenantId || '',
            month: invoiceItem.month || new Date().getMonth() + 1,
            year: invoiceItem.year || new Date().getFullYear(),
            roomAmount: invoiceItem.roomAmount || 0,
            electricityAmount: invoiceItem.electricityAmount || 0,
            electricityUsage: invoiceItem.electricityUsage || 0,
            electricityStart: invoiceItem.electricityStart ?? 0,
            electricityEnd: invoiceItem.electricityEnd ?? 0,
            waterAmount: invoiceItem.waterAmount || 0,
            waterUsage: invoiceItem.waterUsage || 0,
            waterStart: invoiceItem.waterStart ?? 0,
            waterEnd: invoiceItem.waterEnd ?? 0,
            serviceFees: invoiceItem.serviceFees || [],
            totalAmount: invoiceItem.totalAmount || 0,
            paidAmount: invoiceItem.paidAmount || 0,
            remainingAmount: invoiceItem.remainingAmount || 0,
            status: invoiceItem.status || 'unpaid',
            dueDate: invoiceItem.dueDate ? 
              (typeof invoiceItem.dueDate === 'string' ? (invoiceItem.dueDate as string).split('T')[0] : 
               new Date(invoiceItem.dueDate as Date).toISOString().split('T')[0]) : '',
            notes: invoiceItem.notes || '',
          });
        } else {
          toast.error('Không tìm thấy hóa đơn');
          router.push('/dashboard/invoices');
          return;
        }
      } else {
        toast.error('Lỗi khi tải thông tin hóa đơn');
        router.push('/dashboard/invoices');
        return;
      }

      // Fetch form data (contract, room, tenant)
      const formDataResponse = await fetch('/api/invoices/form-data');
      if (formDataResponse.ok) {
        const formData = await formDataResponse.json();
        console.log('Form data loaded:', formData.data);
        setContractList(formData.data.contractList || []);
        setRoomList(formData.data.roomList || []);
        setTenantList(formData.data.tenantList || []);
      } else {
        console.error('Failed to load form data:', formDataResponse.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const totalServiceFees = formData.serviceFees.reduce((sum: number, phi) => sum + phi.amount, 0);
    
    // Tính tiền điện nước từ chỉ số
    const electricityUsage = formData.electricityEnd - formData.electricityStart;
    const waterUsage = formData.waterEnd - formData.waterStart;
    
    // Lấy giá điện nước từ hợp đồng
    const selectedContract = contractList.find(hd => hd._id === formData.contractId);
    const electricityPrice = selectedContract?.electricityPrice || 0;
    const waterPrice = selectedContract?.waterPrice || 0;
    
    const calcElectricityAmount = electricityUsage * electricityPrice;
    const calcWaterAmount = waterUsage * waterPrice;
    
    const total = formData.roomAmount + calcElectricityAmount + calcWaterAmount + totalServiceFees;
    const remainingAmount = total - formData.paidAmount;
    
    setFormData(prev => ({
      ...prev,
      electricityUsage: Math.max(0, electricityUsage),
      waterUsage: Math.max(0, waterUsage),
      electricityAmount: calcElectricityAmount,
      waterAmount: calcWaterAmount,
      totalAmount: total,
      remainingAmount: remainingAmount
    }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.roomAmount, formData.electricityStart, formData.electricityEnd, formData.waterStart, formData.waterEnd, formData.serviceFees, formData.paidAmount, formData.contractId, contractList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const requestData = {
        ...formData,
        id: invoiceId
      };
      
      console.log('Submitting form data for update:', requestData);
      
      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        // Xóa cache
        sessionStorage.removeItem('hoa-don-data');
        toast.success(result.message || 'Hóa đơn đã được cập nhật thành công');
        router.replace('/dashboard/invoices');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Có lỗi xảy ra khi gửi dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const addServiceFee = () => {
    if (newPhiDichVu.ten && newPhiDichVu.gia > 0) {
      setFormData(prev => ({
        ...prev,
        serviceFees: [...prev.serviceFees, { name: newPhiDichVu.ten, amount: newPhiDichVu.gia }]
      }));
      setNewPhiDichVu({ ten: '', gia: 0 });
    }
  };

  const removeServiceFee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceFees: prev.serviceFees.filter((_, i) => i !== index)
    }));
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

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/dashboard/invoices')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Không tìm thấy hóa đơn</h1>
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
          onClick={() => router.push('/dashboard/invoices')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Chỉnh sửa hóa đơn</h1>
          <p className="text-xs md:text-sm text-gray-600">Cập nhật thông tin hóa đơn {invoice?.invoiceCode}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Thông tin hóa đơn</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Cập nhật thông tin hóa đơn {invoice?.invoiceCode}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="thong-tin" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="thong-tin" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Thông tin</span>
                  <span className="sm:hidden">TT</span>
                </TabsTrigger>
                <TabsTrigger value="dien" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
                  <Zap className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Điện</span>
                  <span className="sm:hidden">Đ</span>
                </TabsTrigger>
                <TabsTrigger value="nuoc" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
                  <Droplets className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Nước</span>
                  <span className="sm:hidden">N</span>
                </TabsTrigger>
                <TabsTrigger value="dich-vu" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
                  <Wrench className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Dịch vụ</span>
                  <span className="sm:hidden">DV</span>
                </TabsTrigger>
                <TabsTrigger value="tong-ket" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
                  <Calculator className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Tổng kết</span>
                  <span className="sm:hidden">TK</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="thong-tin" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="invoiceCode" className="text-xs md:text-sm">Mã hóa đơn</Label>
                    <Input
                      id="invoiceCode"
                      value={formData.invoiceCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceCode: e.target.value.toUpperCase() }))}
                      placeholder="HD202401001"
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="contractId" className="text-sm">Hợp đồng *</Label>
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                      {contractList.filter(hd => hd.status === 'active').length} hợp đồng hoạt động
                    </div>
                    <Select value={formData.contractId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractId: value }))}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Chọn hợp đồng" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractList.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">Đang tải hợp đồng...</div>
                        ) : (
                          contractList
                            .filter(hd => hd.status === 'active')
                            .map((contract) => {
                              const roomName = typeof contract.roomId === 'object' && (contract.roomId as Room)?.roomCode 
                                ? (contract.roomId as Room).roomCode 
                                : getRoomName(contract.roomId as string, roomList);
                              return (
                                <SelectItem key={contract._id} value={contract._id!}>
                                  {contract.contractCode} - {roomName}
                                </SelectItem>
                              );
                            })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="roomId" className="text-sm">Phòng</Label>
                    <Input
                      id="roomId"
                      value={getRoomName(formData.roomId, roomList)}
                      disabled
                      className="bg-gray-50 h-10"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="tenantId" className="text-sm">Khách thuê</Label>
                    <Input
                      id="tenantId"
                      value={getTenantName(formData.tenantId, tenantList)}
                      disabled
                      className="bg-gray-50 h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="month" className="text-sm">Tháng</Label>
                    <Input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => setFormData(prev => ({ ...prev, month: parseInt(e.target.value) || 1 }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="year" className="text-sm">Năm</Label>
                    <Input
                      id="year"
                      type="number"
                      min="2020"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="dueDate" className="text-sm">Hạn thanh toán</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="roomAmount" className="text-sm">Tiền phòng (VNĐ)</Label>
                    <Input
                      id="roomAmount"
                      type="number"
                      min="0"
                      value={formData.roomAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomAmount: parseInt(e.target.value) || 0 }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="paidAmount" className="text-sm">Đã thanh toán (VNĐ)</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      min="0"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: parseInt(e.target.value) || 0 }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dien" className="space-y-4 mt-6">
                <h3 className="text-base font-semibold">⚡ Chỉ số điện</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="electricityStart" className="text-sm">Chỉ số ban đầu (kWh)</Label>
                    <Input
                      id="electricityStart"
                      type="number"
                      min="0"
                      value={formData.electricityStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, electricityStart: parseInt(e.target.value) || 0 }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="electricityEnd" className="text-sm">Chỉ số cuối kỳ (kWh)</Label>
                    <Input
                      id="electricityEnd"
                      type="number"
                      min="0"
                      value={formData.electricityEnd}
                      onChange={(e) => setFormData(prev => ({ ...prev, electricityEnd: parseInt(e.target.value) || 0 }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="electricityUsage" className="text-sm">Số điện sử dụng (kWh)</Label>
                    <Input
                      id="electricityUsage"
                      type="number"
                      min="0"
                      value={formData.electricityUsage}
                      disabled
                      className="bg-gray-50 h-10"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="electricityAmount" className="text-sm">Tiền điện (VNĐ)</Label>
                    <Input
                      id="electricityAmount"
                      type="number"
                      min="0"
                      value={formData.electricityAmount}
                      disabled
                      className="bg-gray-50 h-10"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nuoc" className="space-y-4 mt-6">
                <h3 className="text-base font-semibold">💧 Chỉ số nước</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="waterStart" className="text-sm">Chỉ số ban đầu (m³)</Label>
                    <Input
                      id="waterStart"
                      type="number"
                      min="0"
                      value={formData.waterStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, waterStart: parseInt(e.target.value) || 0 }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="waterEnd" className="text-sm">Chỉ số cuối kỳ (m³)</Label>
                    <Input
                      id="waterEnd"
                      type="number"
                      min="0"
                      value={formData.waterEnd}
                      onChange={(e) => setFormData(prev => ({ ...prev, waterEnd: parseInt(e.target.value) || 0 }))}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="waterUsage" className="text-sm">Số nước sử dụng (m³)</Label>
                    <Input
                      id="waterUsage"
                      type="number"
                      min="0"
                      value={formData.waterUsage}
                      disabled
                      className="bg-gray-50 h-10"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="waterAmount" className="text-sm">Tiền nước (VNĐ)</Label>
                    <Input
                      id="waterAmount"
                      type="number"
                      min="0"
                      value={formData.waterAmount}
                      disabled
                      className="bg-gray-50 h-10"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dich-vu" className="space-y-4 mt-6">
                <h3 className="text-base font-semibold">🔧 Phí dịch vụ</h3>
                
                {formData.serviceFees.length > 0 && (
                  <div className="space-y-2">
                    {formData.serviceFees.map((phi, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-sm font-medium">{phi.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-600 font-medium">{phi.amount.toLocaleString('vi-VN')} VNĐ</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeServiceFee(index)}
                            className="h-7 px-2 text-xs"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm">Thêm phí dịch vụ</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tên dịch vụ"
                      value={newPhiDichVu.ten}
                      onChange={(e) => setNewPhiDichVu(prev => ({ ...prev, ten: e.target.value }))}
                      className="flex-1 h-9"
                    />
                    <Input
                      placeholder="Giá"
                      type="number"
                      min="0"
                      value={newPhiDichVu.gia}
                      onChange={(e) => setNewPhiDichVu(prev => ({ ...prev, gia: parseInt(e.target.value) || 0 }))}
                      className="w-24 h-9"
                    />
                    <Button 
                      type="button" 
                      onClick={addServiceFee}
                      disabled={!newPhiDichVu.ten || newPhiDichVu.gia <= 0}
                      className="h-9 px-3 text-sm"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tong-ket" className="space-y-4 mt-6">
                <h3 className="text-base font-semibold">💰 Tổng kết</h3>
                <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Tổng tiền</div>
                    <div className="text-lg font-bold text-gray-900">{formData.totalAmount.toLocaleString('vi-VN')} VNĐ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Đã thanh toán</div>
                    <div className="text-lg font-bold text-green-600">{formData.paidAmount.toLocaleString('vi-VN')} VNĐ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Còn lại</div>
                    <div className={`text-lg font-bold ${formData.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.remainingAmount.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'unpaid' | 'partiallyPaid' | 'paid' | 'overdue' }))}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                        <SelectItem value="partiallyPaid">Thanh toán một phần</SelectItem>
                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                        <SelectItem value="overdue">Quá hạn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm">Ghi chú</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ghi chú về hóa đơn..."
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/invoices')}
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
                        Cập nhật hóa đơn
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}