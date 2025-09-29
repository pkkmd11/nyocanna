import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Upload } from "lucide-react";

// Image optimization utilities
const MAX_DIMENSION = 2048; // 2048x2048 for optimal e-commerce display
const COMPRESSION_QUALITY = 0.85; // 85% quality for good balance
const TARGET_FILE_SIZE = 300 * 1024; // 300KB target

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function compressImage(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number; dimensions: string }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate optimal dimensions (square aspect ratio)
      let { width, height } = img;
      const originalSize = file.size;
      
      // Resize to fit within MAX_DIMENSION while maintaining aspect ratio
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }
      }
      
      // For e-commerce, we want square images - crop to square
      const size = Math.min(width, height);
      canvas.width = size;
      canvas.height = size;
      
      // Draw image centered and cropped to square
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      
      ctx?.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
      
      // Try different quality levels to hit target file size
      let quality = COMPRESSION_QUALITY;
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }
        
        const compressedSize = blob.size;
        const dimensions = `${size}x${size}px`;
        
        // If still too large, try lower quality
        if (compressedSize > TARGET_FILE_SIZE && quality > 0.5) {
          quality = Math.max(0.5, quality - 0.1);
          canvas.toBlob((newBlob) => {
            if (!newBlob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            resolve({
              blob: newBlob,
              originalSize,
              compressedSize: newBlob.size,
              dimensions
            });
          }, 'image/jpeg', quality);
        } else {
          resolve({
            blob,
            originalSize,
            compressedSize,
            dimensions
          });
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (uploadedUrls: string[]) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 20971520, // 20MB default for cannabis e-commerce images
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        // Check file size
        if (file.size > maxFileSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 20MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // Check file type (allow images and videos)
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} must be an image or video file`,
            variant: "destructive",
          });
          continue;
        }

        let fileToUpload: File | Blob = file;
        let uploadFileName = file.name;
        let optimizationMessage = '';

        // Optimize images automatically
        if (file.type.startsWith('image/')) {
          try {
            toast({
              title: "Optimizing image...",
              description: `Processing ${file.name} for best web performance`,
            });

            const { blob, originalSize, compressedSize, dimensions } = await compressImage(file);
            fileToUpload = blob;
            uploadFileName = file.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.jpg'); // Convert to JPEG
            
            const savingsPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);
            optimizationMessage = `Optimized: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${savingsPercent}% smaller, ${dimensions})`;
            
            toast({
              title: "Image optimized!",
              description: optimizationMessage,
              duration: 3000,
            });
          } catch (compressionError) {
            console.error('Image compression failed:', compressionError);
            toast({
              title: "Optimization failed",
              description: `Using original image for ${file.name}`,
              variant: "destructive",
            });
            // Continue with original file if compression fails
          }
        }

        // Upload to Supabase storage
        const fileName = `products/${Date.now()}-${uploadFileName}`;
        const bucketName = file.type.startsWith('video/') ? 'product-videos' : 'product-images';
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error:', error);
          
          // Provide specific error messages for common issues
          let errorMessage = error.message;
          if (error.message.includes('row-level security')) {
            errorMessage = `Storage access denied. Please configure Supabase RLS policies for ${bucketName} bucket.`;
          } else if (error.message.includes('Bucket not found')) {
            errorMessage = `Storage bucket '${bucketName}' not found. Please create it in your Supabase dashboard.`;
          }
          
          toast({
            title: "Upload failed",
            description: `${file.name}: ${errorMessage}`,
            variant: "destructive",
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        toast({
          title: "Upload successful!",
          description: `Uploaded ${uploadedUrls.length} optimized image(s) to storage`,
        });
        onComplete?.(uploadedUrls);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="supabase-file-upload"
        max={maxNumberOfFiles}
      />
      <Button 
        type="button" 
        onClick={() => {
          document.getElementById('supabase-file-upload')?.click();
        }}
        className={buttonClassName}
        data-testid="button-upload-files"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}