'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  FileText,
  Zap,
  Droplets,
  Wrench,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { Contract, Room, Tenant, Invoice } from '@/types';
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

export default function ThemMoiHoaDonPage() {
  const router = useRouter();
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

  // Tự động sinh mã hóa đơn
  const generateInvoiceCode = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `HD${year}${month}${day}${randomNum}`;
  };

  const [newPhiDichVu, setNewPhiDichVu] = useState({ ten: '', gia: 0 });
  const [readingSource, setReadingSource] = useState<{
    chiSoDienBanDau: number;
    chiSoNuocBanDau: number;
    isFirstInvoice: boolean;
    lastInvoiceMonth: string | null;
  } | null>(null);

  useEffect(() => {
    fetchFormData();
    // Tự động sinh mã hóa đơn khi trang load
    setFormData(prev => ({ ...prev, invoiceCode: generateInvoiceCode() }));
  }, []);

  const fetchFormData = async () => {
    try {
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
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestElectricityReading = async (contractId: string, month: number, year: number) => {
    try {
      const response = await fetch(`/api/invoices/latest-reading?contractId=${contractId}&month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Latest electricity reading:', data.data);
          setFormData(prev => ({
            ...prev,
            electricityStart: data.data.electricityStart || 0,
            waterStart: data.data.waterStart || 0,
          }));
          setReadingSource(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching latest electricity reading:', error);
    }
  };

  // Auto-fill form data when contract is selected
  useEffect(() => {
    if (formData.contractId) {
      const selectedContract = contractList.find(hd => hd._id === formData.contractId);
      if (selectedContract) {
        console.log('Auto-filling form data from contract:', selectedContract);
        
        setFormData(prev => ({
          ...prev,
          roomId: selectedContract.roomId as string,
          tenantId: selectedContract.representativeId as string,
          roomAmount: selectedContract.rentPrice,
          serviceFees: selectedContract.serviceFees?.map((phi: any) => ({ name: phi.name || phi.ten, amount: phi.amount || phi.gia })) || [],
          electricityStart: 0,
          waterStart: 0,
        }));
        
        fetchLatestElectricityReading(formData.contractId, formData.month, formData.year);
      }
    }
  }, [formData.contractId, contractList, formData.month, formData.year]);

  // Tự động cập nhật chỉ số khi thay đổi tháng/năm
  useEffect(() => {
    if (formData.contractId && (formData.month || formData.year)) {
      fetchLatestElectricityReading(formData.contractId, formData.month, formData.year);
    }
  }, [formData.month, formData.year]);

  const calculateTotal = () => {
    const totalServiceFees = formData.serviceFees.reduce((sum: number, phi) => sum + phi.amount, 0);
    
    const electricityUsage = formData.electricityEnd - formData.electricityStart;
    const waterUsage = formData.waterEnd - formData.waterStart;
    
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
    
    // Kiểm tra validation trước khi submit
    if (formData.electricityStart < 0 || formData.electricityEnd < 0) {
      toast.error('Chỉ số điện không được âm');
      return;
    }
    
    if (formData.waterStart < 0 || formData.waterEnd < 0) {
      toast.error('Chỉ số nước không được âm');
      return;
    }
    
    if (formData.electricityEnd < formData.electricityStart) {
      toast.error('Chỉ số điện cuối kỳ phải lớn hơn hoặc bằng chỉ số ban đầu');
      return;
    }
    
    if (formData.waterEnd < formData.waterStart) {
      toast.error('Chỉ số nước cuối kỳ phải lớn hơn hoặc bằng chỉ số ban đầu');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Chuẩn bị dữ liệu gửi, loại bỏ invoiceCode nếu trống để backend tự sinh
      const requestData = {
        ...formData,
        // Nếu invoiceCode trống, không gửi để backend tự sinh
        ...(formData.invoiceCode.trim() ? {} : { invoiceCode: undefined }),
      };
      
      console.log('Submitting form data:', requestData);
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        // Xóa cache
        sessionStorage.removeItem('hoa-don-data');
        toast.success(result.message || 'Hóa đơn đã được tạo thành công');
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
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Tạo hóa đơn mới</h1>
          <p className="text-xs md:text-sm text-gray-600">Nhập thông tin hóa đơn mới</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Thông tin hóa đơn</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Điền đầy đủ thông tin để tạo hóa đơn mới
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="thong-tin" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="thong-tin" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Thông tin</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger value="dien-nuoc" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Zap className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Điện & Nước</span>
                  <span className="sm:hidden">Đ&N</span>
                </TabsTrigger>
                <TabsTrigger value="dich-vu" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Wrench className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Dịch vụ</span>
                  <span className="sm:hidden">DV</span>
                </TabsTrigger>
                <TabsTrigger value="tong-ket" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Calculator className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Tổng kết</span>
                  <span className="sm:hidden">TK</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="thong-tin" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="invoiceCode" className="text-xs md:text-sm">Mã hóa đơn</Label>
                    <div className="flex gap-2">
                      <Input
                        id="invoiceCode"
                        value={formData.invoiceCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceCode: e.target.value.toUpperCase() }))}
                        placeholder="HD202401001"
                        required
                        className="h-10 flex-1 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, invoiceCode: generateInvoiceCode() }))}
                        className="h-10 px-3"
                        title="Tự động sinh mã hóa đơn"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.invoiceCode && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        💡 Mã hóa đơn sẽ được tự động sinh nếu để trống
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="contractId" className="text-xs md:text-sm">Hợp đồng *</Label>
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                      {contractList.filter(hd => hd.status === 'active').length} hợp đồng hoạt động
                    </div>
                    <Select value={formData.contractId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractId: value }))}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Chọn hợp đồng" />
                      </SelectTrigger>
                      <SelectContent className="max-w-[500px]">
                        {contractList.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">Đang tải hợp đồng...</div>
                        ) : (
                          contractList
                            .filter(hd => hd.status === 'active')
                            .map((contract) => {
                              const roomObj = typeof contract.roomId === 'object' ? (contract.roomId as Room) : null;
                              const roomName = roomObj?.roomCode || getRoomName(contract.roomId as string, roomList);
                              const buildingName = roomObj?.buildingId && typeof roomObj.buildingId === 'object' 
                                ? (roomObj.buildingId as any).name 
                                : 'N/A';
                              const representativeName = getTenantName(contract.representativeId, tenantList);
                              
                              // Xử lý ngày tháng an toàn
                              const formatDate = (date: any) => {
                                try {
                                  if (!date) return 'N/A';
                                  const dateObj = new Date(date);
                                  if (isNaN(dateObj.getTime())) return 'N/A';
                                  return dateObj.toLocaleDateString('vi-VN');
                                } catch (error) {
                                  return 'N/A';
                                }
                              };
                              
                              const startDate = formatDate(contract.startDate);
                              const endDate = formatDate(contract.endDate);
                              
                              return (
                                <SelectItem 
                                  key={contract._id} 
                                  value={contract._id!}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col gap-1 py-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-blue-700">{contract.contractCode}</span>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-sm font-medium text-gray-700">Phòng {roomName}</span>
                                      {buildingName !== 'N/A' && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-sm text-gray-600">{buildingName}</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span>👤 {representativeName}</span>
                                      <span className="text-gray-400">•</span>
                                      <span>📅 {startDate !== 'N/A' && endDate !== 'N/A' ? `${startDate} → ${endDate}` : 'Chưa có thông tin ngày'}</span>
                                    </div>
                                  </div>
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
                      className="h-10"
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
                      className="h-10"
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
                      className="h-10"
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
                      className="h-10"
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
                      className="h-10"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dien-nuoc" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">⚡💧 Chỉ số điện & nước</h3>
                  {readingSource && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {readingSource.isFirstInvoice 
                        ? "📋 Từ hợp đồng"
                        : `📄 Từ hóa đơn ${readingSource.lastInvoiceMonth}`
                      }
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Loại</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Chỉ số ban đầu</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Chỉ số cuối kỳ</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Số sử dụng</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Đơn giá</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Điện */}
                      <tr>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">Điện</span>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            value={formData.electricityStart}
                            onChange={(e) => {
                              const value = Math.max(0, parseInt(e.target.value) || 0);
                              setFormData(prev => {
                                // Nếu chỉ số ban đầu > chỉ số cuối kỳ, cập nhật chỉ số cuối kỳ
                                const newElectricityEnd = Math.max(prev.electricityEnd, value);
                                return { 
                                  ...prev, 
                                  electricityStart: value,
                                  electricityEnd: newElectricityEnd
                                };
                              });
                            }}
                            className="h-8 w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500 ml-1">kWh</span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            value={formData.electricityEnd}
                            onChange={(e) => {
                              const value = Math.max(0, parseInt(e.target.value) || 0);
                              // Đảm bảo chỉ số cuối >= chỉ số đầu
                              const finalValue = Math.max(value, formData.electricityStart);
                              setFormData(prev => ({ ...prev, electricityEnd: finalValue }));
                            }}
                            className="h-8 w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500 ml-1">kWh</span>
                          {formData.electricityEnd < formData.electricityStart && (
                            <div className="text-xs text-red-500 mt-1">⚠️ Phải ≥ chỉ số đầu</div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className={`font-medium ${
                              formData.electricityUsage < 0 ? 'text-red-600' : 
                              formData.electricityUsage === 0 ? 'text-gray-500' : 
                              'text-blue-600'
                            }`}>
                              {formData.electricityUsage}
                            </span>
                            <span className="text-xs text-gray-500">kWh</span>
                            {formData.electricityUsage < 0 && (
                              <span className="text-xs text-red-500 ml-1">⚠️</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {contractList.find(hd => hd._id === formData.contractId)?.electricityPrice || 0}
                            </span>
                            <span className="text-xs text-gray-500">VNĐ/kWh</span>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-green-600">{formData.electricityAmount.toLocaleString('vi-VN')}</span>
                            <span className="text-xs text-gray-500">VNĐ</span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Nước */}
                      <tr>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Nước</span>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            value={formData.waterStart}
                            onChange={(e) => {
                              const value = Math.max(0, parseInt(e.target.value) || 0);
                              setFormData(prev => {
                                // Nếu chỉ số ban đầu > chỉ số cuối kỳ, cập nhật chỉ số cuối kỳ
                                const newWaterEnd = Math.max(prev.waterEnd, value);
                                return { 
                                  ...prev, 
                                  waterStart: value,
                                  waterEnd: newWaterEnd
                                };
                              });
                            }}
                            className="h-8 w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500 ml-1">m³</span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            value={formData.waterEnd}
                            onChange={(e) => {
                              const value = Math.max(0, parseInt(e.target.value) || 0);
                              // Đảm bảo chỉ số cuối >= chỉ số đầu
                              const finalValue = Math.max(value, formData.waterStart);
                              setFormData(prev => ({ ...prev, waterEnd: finalValue }));
                            }}
                            className="h-8 w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500 ml-1">m³</span>
                          {formData.waterEnd < formData.waterStart && (
                            <div className="text-xs text-red-500 mt-1">⚠️ Phải ≥ chỉ số đầu</div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className={`font-medium ${
                              formData.waterUsage < 0 ? 'text-red-600' : 
                              formData.waterUsage === 0 ? 'text-gray-500' : 
                              'text-blue-600'
                            }`}>
                              {formData.waterUsage}
                            </span>
                            <span className="text-xs text-gray-500">m³</span>
                            {formData.waterUsage < 0 && (
                              <span className="text-xs text-red-500 ml-1">⚠️</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {contractList.find(hd => hd._id === formData.contractId)?.waterPrice || 0}
                            </span>
                            <span className="text-xs text-gray-500">VNĐ/m³</span>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-green-600">{formData.waterAmount.toLocaleString('vi-VN')}</span>
                            <span className="text-xs text-gray-500">VNĐ</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Tổng kết điện nước */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Tổng tiền điện</div>
                    <div className="text-lg font-bold text-yellow-600">{formData.electricityAmount.toLocaleString('vi-VN')} VNĐ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Tổng tiền nước</div>
                    <div className="text-lg font-bold text-blue-600">{formData.waterAmount.toLocaleString('vi-VN')} VNĐ</div>
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
                      <SelectTrigger className="h-10 text-sm">
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
                      className="h-10"
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
                    <Save className="h-4 w-4 mr-2" />
                    {submitting ? 'Đang tạo...' : 'Tạo hóa đơn'}
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