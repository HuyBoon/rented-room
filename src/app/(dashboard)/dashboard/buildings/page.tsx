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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Building2, 
  MapPin,
  Users,
  RefreshCw,
  Copy
} from 'lucide-react';
import { Building } from '@/types';
import { DeleteConfirmPopover } from '@/components/ui/delete-confirm-popover';
import { toast } from 'sonner';
import { ToaNhaDataTable } from './table';

export default function ToaNhaPage() {
  const cache = useCache<{ toaNhaList: Building[] }>({ key: 'toa-nha-data', duration: 300000 });
  const [toaNhaList, setToaNhaList] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingToaNha, setEditingToaNha] = useState<Building | null>(null);

  useEffect(() => {
    document.title = 'Building Management';
  }, []);

  useEffect(() => {
    fetchToaNha();
  }, []);

  const fetchToaNha = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (!forceRefresh) {
        const cachedData = cache.getCache();
        if (cachedData) {
          setToaNhaList(cachedData.toaNhaList || []);
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch('/api/buildings');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const buildings = result.data;
          setToaNhaList(buildings);
          cache.setCache({ toaNhaList: buildings });
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    cache.setIsRefreshing(true);
    await fetchToaNha(true);
    cache.setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  const filteredToaNha = toaNhaList.filter(building => {
    const name = building.name || "";
    const address = building.address;
    const street = address?.street || "";
    const ward = address?.ward || "";

    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           street.toLowerCase().includes(searchTerm.toLowerCase()) ||
           ward.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEdit = (building: Building) => {
    setEditingToaNha(building);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/buildings/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        cache.clearCache();
        setToaNhaList(prev => prev.filter(b => b._id !== id));
        toast.success('Building deleted');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete building');
      }
    } catch (error) {
      console.error('Error deleting building:', error);
      toast.error('Error occurred');
    }
  };

  const formatAddress = (address: Building['address']) => {
    if (!address) return 'N/A';
    const num = address.houseNumber || "";
    const street = address.street || "";
    const ward = address.ward || "";
    const dist = address.district || "";
    const city = address.city || "";
    return `${num} ${street}, ${ward}, ${dist}, ${city}`;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Building Management</h1>
          <p className="text-xs md:text-sm text-gray-600">Overview of all registered buildings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={cache.isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${cache.isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{cache.isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingToaNha(null)}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Building</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingToaNha ? 'Edit Building' : 'Add New Building'}
                </DialogTitle>
                <DialogDescription>
                  {editingToaNha ? 'Update building information' : 'Register a new property building'}
                </DialogDescription>
              </DialogHeader>
              
              <ToaNhaForm 
                building={editingToaNha}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                  cache.clearCache();
                  setIsDialogOpen(false);
                  fetchToaNha(true);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4 lg:gap-6">
        <Card className="p-2 md:p-4 text-center">
          <Building2 className="h-4 w-4 mx-auto mb-2 text-gray-500" />
          <p className="text-xs font-medium text-gray-600">Total Buildings</p>
          <p className="text-lg md:text-2xl font-bold">{toaNhaList.length}</p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <Users className="h-4 w-4 mx-auto mb-2 text-green-600" />
          <p className="text-xs font-medium text-gray-600">Vacant Rooms</p>
          <p className="text-lg md:text-2xl font-bold text-green-600">
            {toaNhaList.reduce((sum, building) => sum + (building.stats?.available || 0), 0)}
          </p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <Users className="h-4 w-4 mx-auto mb-2 text-blue-600" />
          <p className="text-xs font-medium text-gray-600">Occupied Rooms</p>
          <p className="text-lg md:text-2xl font-bold text-blue-600">
            {toaNhaList.reduce((sum, building) => sum + (building.stats?.rented || 0), 0)}
          </p>
        </Card>
        <Card className="p-2 md:p-4 text-center">
          <Search className="h-4 w-4 mx-auto mb-2 text-primary" />
          <p className="text-xs font-medium text-gray-600">Results</p>
          <p className="text-lg md:text-2xl font-bold text-primary">{filteredToaNha.length}</p>
        </Card>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Buildings</CardTitle>
          <CardDescription>
            {filteredToaNha.length} buildings matching your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToaNhaDataTable
            data={filteredToaNha}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Form Component
function ToaNhaForm({ 
  building, 
  onClose, 
  onSuccess 
}: { 
  building: Building | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: building?.name || '',
    houseNumber: building?.address?.houseNumber || '',
    street: building?.address?.street || '',
    ward: building?.address?.ward || '',
    district: building?.address?.district || '',
    city: building?.address?.city || '',
    description: building?.description || '',
    amenities: building?.commonAmenities || [],
  });

  const amenityOptions = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'camera', label: 'Security Camera' },
    { value: 'security', label: '24/7 Security' },
    { value: 'parking', label: 'Parking' },
    { value: 'elevator', label: 'Elevator' },
    { value: 'drying', label: 'Drying Yard' },
    { value: 'commonWC', label: 'Common WC' },
    { value: 'commonKitchen', label: 'Common Kitchen' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = building?._id;
      const url = id ? `/api/buildings/${id}` : '/api/buildings';
      const method = id ? 'PUT' : 'POST';

      const submitData = {
        name: formData.name,
        address: {
          houseNumber: formData.houseNumber,
          street: formData.street,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
        },
        description: formData.description,
        commonAmenities: formData.amenities,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(id ? 'Building updated' : 'Building added');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Action failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Network error');
    }
  };

  const toggleAmenity = (val: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(val) 
        ? prev.amenities.filter(a => a !== val)
        : [...prev.amenities, val]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Building Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          required
          placeholder="e.g. Skyline Apartments"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="houseNumber">House Number</Label>
          <Input
            id="houseNumber"
            value={formData.houseNumber}
            onChange={(e) => setFormData(p => ({ ...p, houseNumber: e.target.value }))}
            required
            placeholder="e.g. 123"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">Street</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => setFormData(p => ({ ...p, street: e.target.value }))}
            required
            placeholder="e.g. Nguyen Hue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ward">Ward</Label>
          <Input
            id="ward"
            value={formData.ward}
            onChange={(e) => setFormData(p => ({ ...p, ward: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => setFormData(p => ({ ...p, district: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
          rows={3}
          placeholder="Building overview..."
        />
      </div>

      <div className="space-y-2">
        <Label>Common Amenities</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 border rounded-lg bg-gray-50/50">
          {amenityOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-black">
              <input
                type="checkbox"
                checked={formData.amenities.includes(opt.value)}
                onChange={() => toggleAmenity(opt.value)}
                className="rounded border-gray-300 accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit">
          {building ? 'Save Changes' : 'Create Building'}
        </Button>
      </DialogFooter>
    </form>
  );
}
