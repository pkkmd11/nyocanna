import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Upload } from "lucide-react";

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

    alert('Upload button clicked! Starting Supabase storage upload...');
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

        // Upload to Supabase storage (try different bucket names)
        const fileName = `products/${Date.now()}-${file.name}`;
        const bucketName = file.type.startsWith('video/') ? 'product-videos' : 'product-images';
        
        // Try uploading with better error handling
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
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
          .from('product-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${uploadedUrls.length} image(s) to Supabase`,
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