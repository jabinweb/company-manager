'use client'

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ImagePlus, X } from "lucide-react"
import { useUploadThing } from "@/utils/uploadthing"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
  endpoint: 'imageUploader';
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  className: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadBegin: () => {
      setIsUploading(true);
    },
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res?.[0]?.url) {
        onChange(res[0].url);
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload image"
      });
    },
  });

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload an image file"
        });
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "File size should be less than 4MB"
        });
        return;
      }

      await startUpload([file]);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image"
      });
    }
  }, [startUpload]);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];
      if (file) await handleFileUpload(file);
    },
    [handleFileUpload]
  );

  return (
    <div className={`space-y-4 w-fit ${className}`}>
      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 border-dashed rounded-lg p-4 
          hover:bg-muted/50 transition
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isUploading ? 'opacity-50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
          disabled={isUploading || disabled}
        />
        
        {value ? (
          <div className="relative aspect-square w-[100px]">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-[-1rem] right-[-1rem]"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-6">
            <ImagePlus className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Click or drag and drop to upload'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}