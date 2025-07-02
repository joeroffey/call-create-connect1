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

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${teamId}-${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError, data } = await supabase.storage
        .from('team-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName);

      console.log('Logo upload - public URL:', publicUrl);

      // Update team with logo URL
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', teamId);

      console.log('Logo upload - database update error:', updateError);

      if (updateError) throw updateError;

      onLogoUpdate(publicUrl);
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
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('logo-upload')?.click()}
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
        onChange={handleFileInput}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default TeamLogoUpload;