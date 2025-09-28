import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { insertProductSchema, InsertProduct } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { z } from 'zod';
import { useState } from 'react';
import { ObjectUploader } from './ObjectUploader';
import type { UploadResult } from '@uppy/core';

const productFormSchema = insertProductSchema.extend({
  nameEn: z.string().min(1, 'English name is required'),
  nameMy: z.string().min(1, 'Myanmar name is required'),
  descriptionEn: z.string().min(1, 'English description is required'),
  descriptionMy: z.string().min(1, 'Myanmar description is required'),
  imageUrls: z.string().optional(),
  videoUrls: z.string().optional(),
  specificationsEn: z.string().optional(),
  specificationsMy: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: InsertProduct) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductForm({ initialData, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      toast({
        title: "Upload Error",
        description: "Failed to prepare file upload",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      const uploadedFiles = result.successful || [];
      const newImageUrls: string[] = [];
      
      for (const file of uploadedFiles) {
        const uploadURL = file.uploadURL as string;
        if (!uploadURL) continue;
        
        // Set ACL policy for the uploaded image
        const response = await fetch('/api/product-images', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageURL: uploadURL }),
        });
        
        if (response.ok) {
          const { objectPath } = await response.json();
          newImageUrls.push(`/objects${objectPath}`);
        } else {
          console.error('Failed to set ACL for uploaded image');
          newImageUrls.push(uploadURL); // Fallback to direct URL
        }
      }
      
      setUploadedImages(prev => [...prev, ...newImageUrls]);
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedFiles?.length || 0} image(s)`,
      });
      
    } catch (error) {
      console.error('Error processing upload:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process uploaded files",
        variant: "destructive",
      });
    }
  };
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nameEn: '',
      nameMy: '',
      descriptionEn: '',
      descriptionMy: '',
      quality: 'medium',
      imageUrls: '',
      videoUrls: '',
      specificationsEn: '',
      specificationsMy: '',
      isActive: true,
      ...initialData,
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      alert('Submit button clicked! Processing product form...');
      console.log('Form submission data:', data);
      
      // Combine uploaded images with URL images
      const urlImages = data.imageUrls ? data.imageUrls.split('\n').filter(Boolean) : [];
      const allImages = [...uploadedImages, ...urlImages];
      
      const productData: InsertProduct = {
        name: {
          en: data.nameEn.trim(),
          my: data.nameMy.trim(),
        },
        description: {
          en: data.descriptionEn.trim(),
          my: data.descriptionMy.trim(),
        },
        quality: data.quality,
        images: allImages,
        videos: data.videoUrls ? data.videoUrls.split('\n').filter(Boolean) : [],
        specifications: {
          en: data.specificationsEn ? data.specificationsEn.split('\n').filter(Boolean) : [],
          my: data.specificationsMy ? data.specificationsMy.split('\n').filter(Boolean) : [],
        },
        isActive: data.isActive ?? true,
      };

      console.log('Processed product data:', productData);
      
      await onSubmit(productData);
      
      toast({
        title: "Success",
        description: initialData ? "Product updated successfully" : "Product created successfully",
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) { // 20MB limit
          toast({
            title: "Error",
            description: `File ${file.name} is too large. Maximum size is 20MB.`,
            variant: "destructive",
          });
          continue;
        }
        
        // For now, create a temporary URL (in production, upload to object storage)
        const tempUrl = URL.createObjectURL(file);
        setUploadedImages(prev => [...prev, tempUrl]);
        
        toast({
          title: "File uploaded",
          description: `${file.name} has been prepared for upload.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process uploaded files",
        variant: "destructive",
      });
    }
  };
  
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter English name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameMy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-myanmar">Product Name (မြန်မာ)</FormLabel>
                    <FormControl>
                      <Input placeholder="မြန်မာအမည်ထည့်ပါ" {...field} className="font-myanmar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter English description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionMy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-myanmar">Description (မြန်မာ)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="မြန်မာဖော်ပြချက်ထည့်ပါ" {...field} className="font-myanmar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quality */}
            <FormField
              control={form.control}
              name="quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quality Tier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High Quality</SelectItem>
                      <SelectItem value="medium">Medium Quality</SelectItem>
                      <SelectItem value="low">Low Quality</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media */}
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-4">
                <FormLabel>Product Images</FormLabel>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <p className="mt-2 block text-sm font-medium text-foreground">
                        Upload images (max 20MB each)
                      </p>
                      <p className="mt-1 block text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 20MB
                      </p>
                      <div className="mt-4">
                        <ObjectUploader
                          maxNumberOfFiles={10}
                          maxFileSize={20971520}
                          onGetUploadParameters={handleGetUploadParameters}
                          onComplete={handleUploadComplete}
                          buttonClassName="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </ObjectUploader>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeUploadedImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* URL Input Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imageUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Image URLs (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter additional image URLs (one per line)" 
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="videoUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URLs</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter video URLs (one per line)" 
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

            {/* Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="specificationsEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specifications (English)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter specifications (one per line)" 
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specificationsMy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-myanmar">Specifications (မြန်မာ)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="စပက်ဖွင့်ခေးရှင်းများထည့်ပါ (တစ်ကြောင်းလျှင် တစ်ခု)" 
                        {...field}
                        rows={4}
                        className="font-myanmar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  alert('Cancel button clicked! Closing form...');
                  onCancel();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
