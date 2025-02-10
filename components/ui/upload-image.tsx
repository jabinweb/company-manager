'use client';

import { useState } from 'react';
import { UploadButton } from '@/utils/uploadthing';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Loader2 } from 'lucide-react';
import { EndpointArg } from 'uploadthing/types';
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface UploadImageProps {
  endpoint: 'imageUploader';
  value?: string | null;
  onChange?: (url: string) => void;
  className?: string;
}

export function UploadImage({ endpoint, value, onChange, className }: UploadImageProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className={className || "h-24 w-24"}>
        <AvatarImage src={value || ''} />
        <AvatarFallback>
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Upload'
          )}
        </AvatarFallback>
      </Avatar>

      <UploadButton
        endpoint={endpoint as EndpointArg<OurFileRouter, typeof endpoint>}
        onClientUploadComplete={(res: any) => {
          setIsUploading(false);
          if (res?.[0]?.url && onChange) {
            onChange(res[0].url);
            toast({
              title: "Success",
              description: "Image uploaded successfully",
            });
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to upload image",
          });
        }}
        onUploadBegin={() => {
          setIsUploading(true);
        }}
      />
    </div>
  );
}