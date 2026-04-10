'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCache } from '@/hooks/use-cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Plus, 
  Search, 
  CreditCard, 
  RefreshCw,
  Receipt
} from 'lucide-react';
import { Payment, Invoice } from '@/types';
import { toast } from 'sonner';
import { ThanhToanDataTable } from './table';

// Type for populated Payment
type PaymentPopulated = Omit<Payment, 'invoiceId'> & {
  invoiceId: string | Invoice;
};

export default function ThanhToanPage() {
  const cache = useCache<{ 
    thanhToanList: PaymentPopulated[];
    hoaDonList: Invoice[];
  }>({ key: 'thanh-toan-data', duration: 300000 });
  
  const [thanhToanList, setThanhToanList] = useState<PaymentPopulated[]>([]);
  const [hoaDonList, setHoaDonList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingThanhToan, setEditingThanhToan] = useState<PaymentPopulated | null>(null);

  useEffect(() => {
    document.title = 'Payment Management';
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
          setThanhToanList(cachedData.thanhToanList || []);
          setHoaDonList(cachedData.hoaDonList || []);
          setLoading(false);
          return;
        }
      }
      
      // Fetch payments
      const thanhToanResponse = await fetch('/api/payments');
      const thanhToanData = thanhToanResponse.ok ? await thanhToanResponse.json() : { data: [] };
      const thanhToans = thanhToanData.data || [];
      setThanhToanList(thanhToans);

      // Fetch invoices
      const hoaDonResponse = await fetch('/api/invoices');
      const hoaDonData = hoaDonResponse.ok ? await hoaDonResponse.json() : { data: [] };
      const hoaDons = hoaDonData.data || [];
      setHoaDonList(hoaDons);
      
      cache.setCache({
        thanhToanList: thanhToans,
        hoaDonList: hoaDons,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    cache.setIsRefreshing(true);
    await fetchData(true);
    cache.setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  const filteredThanhToan = thanhToanList.filter(payment => {
    const notes = payment.notes || "";
    const method = payment.method || "";
    const paymentDate = payment.paymentDate;
    const transInfo = payment.transferInfo;
    const transactionId = transInfo?.transactionId || "";

    const matchesSearch = notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = methodFilter === 'all' || method === methodFilter;

    const date = new Date(paymentDate);
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && isToday(date)) ||
                       (dateFilter === 'week' && isThisWeek(date)) ||
                       (dateFilter === 'month' && isThisMonth(date));
    
    return matchesSearch && matchesMethod && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= today;
  };

  const isThisMonth = (date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const handleEdit = (payment: PaymentPopulated) => {
    setEditingThanhToan(payment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        cache.clearCache();
        setThanhToanList(prev => prev.filter(p => p._id !== id));
        toast.success('Payment deleted');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Error occurred');
    }
  };

  const handleDownload = (payment: PaymentPopulated) => {
    console.log('Downloading receipt:', payment._id);
    toast.info('Download functionality triggered');
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
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-xs md:text-sm text-gray-600">Overview of all payment transactions</p>
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
            <span className="hidden sm:inline">{cache.isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingThanhToan(null)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Payment</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingThanhToan ? 'Edit Payment' : 'Add New Payment'}
                </DialogTitle>
                <DialogDescription>
                  {editingThanhToan ? 'Update transaction details' : 'Enter new payment details'}
                </DialogDescription>
              </DialogHeader>
              
              <ThanhToanForm 
                payment={editingThanhToan}
                invoiceList={hoaDonList}
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
        <Card className="p-2 md:p-4 text-center">
          <CreditCard className="h-4 w-4 mx-auto mb-2 text-gray-500" />
          <p className="text-xs font-medium text-gray-600">Total Trans</p>
          <p className="text-lg md:text-2xl font-bold">{thanhToanList.length}</p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <CreditCard className="h-4 w-4 mx-auto mb-2 text-green-600" />
          <p className="text-xs font-medium text-gray-600">Cash</p>
          <p className="text-lg md:text-2xl font-bold text-green-600">
            {thanhToanList.filter(t => t.method === 'cash').length}
          </p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <CreditCard className="h-4 w-4 mx-auto mb-2 text-blue-600" />
          <p className="text-xs font-medium text-gray-600">Transfer</p>
          <p className="text-lg md:text-2xl font-bold text-blue-600">
            {thanhToanList.filter(t => t.method === 'transfer').length}
          </p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <Receipt className="h-4 w-4 mx-auto mb-2 text-primary" />
          <p className="text-xs font-medium text-gray-600">Total Revenue</p>
          <p className="text-sm md:text-lg font-bold text-primary truncate">
            {formatCurrency(thanhToanList.reduce((sum, t) => sum + (t.amount || 0), 0))}
          </p>
        </Card>
      </div>

      {/* Main List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {filteredThanhToan.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThanhToanDataTable
            data={filteredThanhToan}
            invoiceList={hoaDonList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            methodFilter={methodFilter}
            onMethodChange={setMethodFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Form Component
function ThanhToanForm({ 
  payment, 
  invoiceList,
  onClose, 
  onSuccess 
}: { 
  payment: PaymentPopulated | null;
  invoiceList: Invoice[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    invoiceId: payment?.invoiceId ? 
      (typeof payment.invoiceId === 'string' ? payment.invoiceId : (payment.invoiceId as Invoice)._id || '') : '',
    amount: payment?.amount || 0,
    method: payment?.method || 'cash',
    bank: payment?.transferInfo?.bank || '',
    transactionId: payment?.transferInfo?.transactionId || '',
    paymentDate: payment?.paymentDate ? 
      new Date(payment.paymentDate).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],
    notes: payment?.notes || '',
    receiptImage: payment?.receiptImage || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = payment?._id;
      const url = id ? `/api/payments/${id}` : '/api/payments';
      const method = id ? 'PUT' : 'POST';

      const requestBody = {
        invoiceId: formData.invoiceId,
        amount: formData.amount,
        method: formData.method,
        transferInfo: formData.method === 'transfer' ? {
          bank: formData.bank,
          transactionId: formData.transactionId
        } : undefined,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        receiptImage: formData.receiptImage
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success(id ? 'Updated successfully' : 'Created successfully');
        onSuccess();
      } else {
        const result = await response.json();
        toast.error(result.message || 'Error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Submission failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invoiceId">Invoice</Label>
        <Select value={formData.invoiceId} onValueChange={(v) => setFormData(p => ({ ...p, invoiceId: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select an invoice" />
          </SelectTrigger>
          <SelectContent>
            {invoiceList.map((ivoice) => (
              <SelectItem key={ivoice._id} value={ivoice._id!}>
                {ivoice.invoiceCode} - {ivoice.remainingAmount.toLocaleString()} VNĐ remaining
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (VNĐ)</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(p => ({ ...p, amount: parseInt(e.target.value) || 0 }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input
            id="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData(p => ({ ...p, paymentDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Method</Label>
        <Select value={formData.method} onValueChange={(v) => setFormData(p => ({ ...p, method: v as any }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="eWallet">E-Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.method === 'transfer') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-lg bg-gray-50/50">
          <div className="space-y-2">
            <Label htmlFor="bank">Bank Name</Label>
            <Input
              id="bank"
              value={formData.bank}
              onChange={(e) => setFormData(p => ({ ...p, bank: e.target.value }))}
              placeholder="e.g. VCB, Techcombank"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              value={formData.transactionId}
              onChange={(e) => setFormData(p => ({ ...p, transactionId: e.target.value }))}
              placeholder="Ref number"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
          rows={3}
          placeholder="Transaction details..."
        />
      </div>

      <ImageUpload
        imageUrl={formData.receiptImage}
        onImageChange={(url) => setFormData(p => ({ ...p, receiptImage: url }))}
        label="Receipt Image"
      />

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit">
          {payment ? 'Update Transaction' : 'Record Payment'}
        </Button>
      </DialogFooter>
    </form>
  );
}
