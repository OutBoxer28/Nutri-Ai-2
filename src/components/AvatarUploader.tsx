"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { showLoading, dismissToast, showError, showSuccess } from "@/utils/toast";

interface AvatarUploaderProps {
  url: string | null;
  onUpload: (filePath: string) => void;
}

export const AvatarUploader = ({ url, onUpload }: AvatarUploaderProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) {
      const downloadImage = async () => {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(url);
        if (error) {
          console.error("Error downloading image: ", error.message);
          return;
        }
        setAvatarUrl(URL.createObjectURL(data));
      };
      downloadImage();
    }
  }, [url]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    const toastId = showLoading("Uploading avatar...");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      dismissToast(toastId);
      showError("You must be logged in to upload an avatar.");
      setUploading(false);
      return;
    }

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    dismissToast(toastId);
    if (error) {
      showError("Failed to upload avatar.");
      console.error(error);
    } else {
      showSuccess("Avatar uploaded successfully.");
      onUpload(filePath);
    }
    setUploading(false);
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl ?? undefined} alt="User avatar" />
        <AvatarFallback>
          <User className="h-10 w-10" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col space-y-2">
        <Button asChild variant="outline">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            {uploading ? "Uploading..." : "Upload Photo"}
          </label>
        </Button>
        <Input
          id="avatar-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
        <p className="text-xs text-muted-foreground">
          PNG, JPG, GIF up to 10MB.
        </p>
      </div>
    </div>
  );
};