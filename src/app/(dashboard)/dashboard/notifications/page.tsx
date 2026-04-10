'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  Bell, 
  Calendar,
  Users,
  Eye,
  Send,
  Building2,
  Home,
  RefreshCw
} from 'lucide-react';
import { Notification, Building, Room, Tenant } from '@/types';
import { toast } from 'sonner';
import { useCache } from '@/hooks/use-cache';

export default function NotificationPage() {
  const cache = useCache<{
    notifications: Notification[];
    buildings: Building[];
    rooms: Room[];
    tenants: Tenant[];
  }>({ key: 'notification-data', duration: 300000 });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  useEffect(() => {
    document.title = 'Notification Management';
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
          setNotifications(cachedData.notifications || []);
          setBuildings(cachedData.buildings || []);
          setRooms(cachedData.rooms || []);
          setTenants(cachedData.tenants || []);
          setLoading(false);
          return;
        }
      }
      
      // Fetch notifications
      const thongBaoResponse = await fetch('/api/notifications');
      const thongBaoData = thongBaoResponse.ok ? await thongBaoResponse.json() : { data: [] };
      const notificationData = thongBaoData.success ? thongBaoData.data : [];
      setNotifications(notificationData);

      // Fetch buildings
      const toaNhaResponse = await fetch('/api/buildings');
      const toaNhaData = toaNhaResponse.ok ? await toaNhaResponse.json() : { data: [] };
      const buildingsData = toaNhaData.success ? toaNhaData.data : [];
      setBuildings(buildingsData);

      // Fetch rooms
      const phongResponse = await fetch('/api/rooms');
      const phongData = phongResponse.ok ? await phongResponse.json() : { data: [] };
      const roomsData = phongData.success ? phongData.data : [];
      setRooms(roomsData);

      // Fetch tenants
      const khachThueResponse = await fetch('/api/tenants');
      const khachThueData = khachThueResponse.ok ? await khachThueResponse.json() : { data: [] };
      const tenantsData = khachThueData.success ? khachThueData.data : [];
      setTenants(tenantsData);
      
      cache.setCache({
        notifications: notificationData,
        buildings: buildingsData,
        rooms: roomsData,
        tenants: tenantsData,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotifications([]);
      setBuildings([]);
      setRooms([]);
      setTenants([]);
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

  const filteredNotifications = notifications.filter(notification => {
    const title = notification.title || "";
    const content = notification.content || "";
    const type = notification.type || "";

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'general':
        return <Badge variant="default">General</Badge>;
      case 'invoice':
        return <Badge variant="secondary">Invoice</Badge>;
      case 'issue':
        return <Badge variant="destructive">Issue</Badge>;
      case 'contract':
        return <Badge variant="outline">Contract</Badge>;
      case 'other':
        return <Badge variant="outline">Other</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getBuildingName = (buildingId?: string | Building) => {
    if (!buildingId || buildingId === 'all') return 'All Buildings';
    const id = typeof buildingId === 'string' ? buildingId : buildingId._id;
    const building = buildings.find(b => b._id === id);
    return building?.name || 'Unknown';
  };

  const getRoomNames = (roomIds: string[]) => {
    if (!roomIds || roomIds.length === 0) return 'All Rooms';
    const names = roomIds.map(id => {
      const room = rooms.find(p => p._id === id);
      return room?.roomCode || 'Unknown';
    });
    return names.join(', ');
  };

  const getTenantNames = (tenantIds: string[]) => {
    if (!tenantIds || tenantIds.length === 0) return 'All Tenants';
    const names = tenantIds.map(id => {
      const tenant = tenants.find(k => k._id === id);
      return tenant?.fullName || 'Unknown';
    });
    return names.join(', ');
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await fetch(`/api/notifications?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          cache.clearCache();
          setNotifications(prev => prev.filter(t => t._id !== id));
          toast.success('Notification deleted');
        } else {
          toast.error('Failed to delete notification');
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Error occurred');
      }
    }
  };

  const handleSend = (notification: Notification) => {
    console.log('Sending notification:', notification._id);
    toast.info('Send functionality triggered');
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
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-xs md:text-sm text-gray-600">Send and manage notifications to tenants</p>
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
              <Button size="sm" onClick={() => setEditingNotification(null)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Notification</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] md:w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNotification ? 'Edit Notification' : 'Create New Notification'}
                </DialogTitle>
                <DialogDescription>
                  {editingNotification ? 'Update notification details' : 'Enter new notification details'}
                </DialogDescription>
              </DialogHeader>
              
              <ThongBaoForm 
                notification={editingNotification}
                buildings={buildings}
                rooms={rooms}
                tenants={tenants}
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
          <Bell className="h-4 w-4 mx-auto mb-2 text-gray-500" />
          <p className="text-xs font-medium text-gray-600">Total</p>
          <p className="text-lg md:text-2xl font-bold">{notifications.length}</p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <Bell className="h-4 w-4 mx-auto mb-2 text-blue-600" />
          <p className="text-xs font-medium text-gray-600">General</p>
          <p className="text-lg md:text-2xl font-bold text-blue-600">
            {notifications.filter(t => t.type === 'general').length}
          </p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <Bell className="h-4 w-4 mx-auto mb-2 text-green-600" />
          <p className="text-xs font-medium text-gray-600">Invoice</p>
          <p className="text-lg md:text-2xl font-bold text-green-600">
            {notifications.filter(t => t.type === 'invoice').length}
          </p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <Bell className="h-4 w-4 mx-auto mb-2 text-red-600" />
          <p className="text-xs font-medium text-gray-600">Issue</p>
          <p className="text-lg md:text-2xl font-bold text-red-600">
            {notifications.filter(t => t.type === 'issue').length}
          </p>
        </Card>
      </div>

      {/* Main List */}
      <Card>
        <CardHeader>
          <CardTitle>Notification List</CardTitle>
          <CardDescription>
            {filteredNotifications.length} notifications found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((t) => {
                  const title = t.title || 'N/A';
                  const type = t.type || 'general';
                  const sentAt = t.sentAt || new Date();
                  const readByIds = t.readByIds || [];
                  const buildingId = t.buildingId;
                  const roomIds = t.roomIds || [];
                  const receiverIds = t.receiverIds || [];

                  return (
                    <TableRow key={t._id}>
                      <TableCell className="max-w-xs truncate font-medium">{title}</TableCell>
                      <TableCell>{getTypeBadge(type)}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm">
                        {receiverIds.length > 0 ? getTenantNames(receiverIds) : 'All Tenants'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1">
                          {buildingId && (
                            <div className="flex items-center gap-1.5 opacity-70">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{getBuildingName(buildingId)}</span>
                            </div>
                          )}
                          {roomIds.length > 0 && (
                            <div className="flex items-center gap-1.5 opacity-70">
                              <Home className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{getRoomNames(roomIds)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm opacity-70">
                        {new Date(sentAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={readByIds.length > 0 ? "default" : "secondary"} className="text-[10px]">
                          {readByIds.length > 0 ? `${readByIds.length} read` : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(t)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleSend(t)} className="text-blue-600" title="Send">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(t._id!)} className="text-red-500" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Form Component
function ThongBaoForm({ 
  notification, 
  buildings,
  rooms,
  tenants,
  onClose, 
  onSuccess 
}: { 
  notification: Notification | null;
  buildings: Building[];
  rooms: Room[];
  tenants: Tenant[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    content: notification?.content || '',
    type: notification?.type || 'general',
    receiverIds: notification?.receiverIds || [],
    roomIds: notification?.roomIds || [],
    buildingId: typeof notification?.buildingId === 'string' 
      ? notification.buildingId 
      : (notification?.buildingId as any)?._id || 'all',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = notification?._id;
      const url = id ? `/api/notifications?id=${id}` : '/api/notifications';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(id ? 'Updated successfully' : 'Created successfully');
        onSuccess();
      } else {
        toast.error(result.message || 'Error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Submission failed');
    }
  };

  const toggleItem = (list: string[], item: string) => 
    list.includes(item) ? list.filter(i => i !== item) : [...list, item];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
          placeholder="Notification title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
          rows={5}
          placeholder="Write your message here..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="issue">Issue</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target Building</Label>
          <Select value={formData.buildingId} onValueChange={(v) => setFormData(p => ({ ...p, buildingId: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {buildings.map(t => (
                <SelectItem key={t._id} value={t._id!}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold mb-2 block">Target Rooms (Optional)</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50/50">
            {rooms.map((p) => (
              <label key={p._id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-black">
                <input
                  type="checkbox"
                  checked={formData.roomIds.includes(p._id!)}
                  onChange={() => setFormData(prev => ({ ...prev, roomIds: toggleItem(prev.roomIds, p._id!) }))}
                  className="rounded border-gray-300 accent-primary"
                />
                {p.roomCode}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold mb-2 block">Specific Recipients (Optional)</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50/50">
            {tenants.map((k) => (
              <label key={k._id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-black">
                <input
                  type="checkbox"
                  checked={formData.receiverIds.includes(k._id!)}
                  onChange={() => setFormData(prev => ({ ...prev, receiverIds: toggleItem(prev.receiverIds, k._id!) }))}
                  className="rounded border-gray-300 accent-primary"
                />
                {k.fullName}
              </label>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit">
          {notification ? 'Update Notification' : 'Create & Send'}
        </Button>
      </DialogFooter>
    </form>
  );
}
