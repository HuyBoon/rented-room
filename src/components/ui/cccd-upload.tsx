'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface CCCDUploadProps {
  idCardImages: {
    front: string;
    back: string;
  };
  onImagesChange: (idCardImages: { front: string; back: string }) => void;
  className?: string;
}

export function CCCDUpload({ 
  idCardImages, 
  onImagesChange, 
  className = '' 
}: CCCDUploadProps) {
  const [uploading, setUploading] = useState<{ front: boolean; back: boolean }>({
    front: false,
    back: false
  });
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi upload ảnh');
      }

      const result = await response.json();
      onImagesChange({
        ...idCardImages,
        [type]: result.data.secure_url
      });
      
      toast.success(`Upload ảnh CCCD ${type === 'front' ? 'mặt trước' : 'mặt sau'} thành công!`);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      if (type === 'front' && frontInputRef.current) {
        frontInputRef.current.value = '';
      }
      if (type === 'back' && backInputRef.current) {
        backInputRef.current.value = '';
      }
    }
  };

  const removeImage = (type: 'front' | 'back') => {
    onImagesChange({
      ...idCardImages,
      [type]: ''
    });
    toast.success(`Xóa ảnh CCCD ${type === 'front' ? 'mặt trước' : 'mặt sau'} thành công!`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">Ảnh CCCD</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mặt trước */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Mặt trước CCCD
            </label>
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'front')}
              className="hidden"
              disabled={uploading.front}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => frontInputRef.current?.click()}
              disabled={uploading.front}
            >
              {uploading.front ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {idCardImages.front ? (
            <Card className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-[3/2] rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={idCardImages.front}
                    alt="CCCD mặt trước"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage('front')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm text-center">
                  Chưa có ảnh CCCD mặt trước
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mặt sau */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Mặt sau CCCD
            </label>
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'back')}
              className="hidden"
              disabled={uploading.back}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => backInputRef.current?.click()}
              disabled={uploading.back}
            >
              {uploading.back ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {idCardImages.back ? (
            <Card className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-[3/2] rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={idCardImages.back}
                    alt="CCCD mặt sau"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage('back')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm text-center">
                  Chưa có ảnh CCCD mặt sau
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-xs">
          {idCardImages.front && idCardImages.back 
            ? 'Đã upload đầy đủ ảnh CCCD' 
            : `Còn thiếu ${!idCardImages.front && !idCardImages.back ? '2' : '1'} ảnh CCCD`
          }
        </Badge>
      </div>
    </div>
  );
}
