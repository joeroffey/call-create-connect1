import React, { useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TeamLogoUploadProps {
  teamId: string;
  currentLogoUrl?: string;
  onLogoUpdate: (logoUrl: string | null) => void;
}

const TeamLogoUpload = ({ teamId, currentLogoUrl, onLogoUpdate }: TeamLogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const uploadLogo = async (file: File) => {
    try {
      setUploading(true);
      console.log('Starting logo upload for file:', file.name, 'size:', file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User check:', user?.id, 'error:', userError);
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${teamId}/logo.${fileExt}`;
      console.log('Upload filename:', fileName);

      // Upload file to storage
      const { error: uploadError, data } = await supabase.storage
        .from('team-logos')
        .upload(fileName, file, { upsert: true });

      console.log('Upload result:', { data, uploadError });
      if (uploadError) throw uploadError;

      // Get public URL with cache busting
      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName);

      // Add cache busting parameter to ensure fresh image load
      const publicUrlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      console.log('Logo upload - public URL:', publicUrlWithCacheBust);

      // Update team with logo URL
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrlWithCacheBust })
        .eq('id', teamId);

      console.log('Logo upload - database update error:', updateError);

      if (updateError) throw updateError;

      onLogoUpdate(publicUrlWithCacheBust);
      toast({
        title: "Success",
        description: "Team logo updated successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    try {
      setUploading(true);

      // Update team to remove logo URL
      const { error } = await supabase
        .from('teams')
        .update({ logo_url: null })
        .eq('id', teamId);

      if (error) throw error;

      onLogoUpdate(null);
      toast({
        title: "Success",
        description: "Team logo removed successfully",
      });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: "Failed to remove logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadLogo(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadLogo(e.target.files[0]);
    }
  };

  return (
    <div className="relative">
      {currentLogoUrl ? (
        <div className="relative group">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
            <img
              src={currentLogoUrl}
              alt="Team logo"
              className="w-full h-full object-cover"
              onLoad={() => {
                console.log('Logo image loaded successfully:', currentLogoUrl);
              }}
              onError={(e) => {
                console.log('Failed to load logo image:', currentLogoUrl);
                console.log('Image error event:', e);
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={removeLogo}
              disabled={uploading}
              className="text-white hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`w-16 h-16 rounded-lg border-2 border-dashed transition-colors cursor-pointer flex items-center justify-center ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!uploading) {
              console.log('Logo upload clicked, opening file dialog');
              document.getElementById('logo-upload')?.click();
            }
          }}
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
          ) : (
            <Upload className="w-6 h-6 text-gray-400" />
          )}
        </div>
      )}
      
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        onChange={(e) => {
          console.log('File input changed:', e.target.files?.[0]?.name);
          handleFileInput(e);
        }}
        className="hidden"
        disabled={uploading}
      />
      
      {uploading && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
          Uploading...
        </div>
      )}
    </div>
  );
};

export default TeamLogoUpload;