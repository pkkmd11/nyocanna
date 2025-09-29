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
// Removed Uppy import - now using Supabase storage directly

// Create a form-specific schema that matches our form fields
const productFormSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameMy: z.string().min(1, 'Myanmar name is required'),
  descriptionEn: z.string().min(1, 'English description is required'),
  descriptionMy: z.string().min(1, 'Myanmar description is required'),
  quality: z.enum(['high', 'medium', 'low']),
  specificationsEn: z.string().optional(),
  specificationsMy: z.string().optional(),
  isActive: z.boolean().optional(),
  existingImages: z.array(z.string()).optional(),
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
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialData?.existingImages || []);
  
  const handleSupabaseUploadComplete = async (uploadedUrls: string[]) => {
    try {
      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedUrls.length} image(s) to Supabase storage`,
      });
      
    } catch (error) {
      console.error('Error processing Supabase upload:', error);
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
      specificationsEn: '',
      specificationsMy: '',
      isActive: true,
      existingImages: [],
      ...initialData,
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      console.log('Form submission data:', data);
      
      // Use uploaded images only (no manual URL input)
      const allImages = uploadedImages;
      
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
        videos: [], // Videos will be handled by separate upload functionality
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
                      <Input placeholder="Enter English name" {...field} data-testid="input-name-en" />
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
                      <Input placeholder="မြန်မာအမည်ထည့်ပါ" {...field} className="font-myanmar" data-testid="input-name-my" />
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
                      <Textarea placeholder="Enter English description" {...field} data-testid="textarea-description-en" />
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
                      <Textarea placeholder="မြန်မာဖော်ပြချက်ထည့်ပါ" {...field} className="font-myanmar" data-testid="textarea-description-my" />
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
                          onComplete={handleSupabaseUploadComplete}
                          buttonClassName="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload to Supabase Storage
                        </ObjectUploader>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <p>⚠️ Files must be uploaded to Supabase storage for proper functionality</p>
                          <p>Supports: Images (JPG, PNG, GIF) and Videos (MP4, MOV, AVI) up to 20MB</p>
                          <p>If upload fails, check Supabase storage bucket configuration</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Product Images {initialData?.existingImages && initialData.existingImages.length > 0 ? `(${uploadedImages.length} total)` : `(${uploadedImages.length} uploaded)`}:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => {
                        const isExistingImage = initialData?.existingImages?.includes(image);
                        return (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`${isExistingImage ? 'Existing' : 'Uploaded'} image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            {isExistingImage && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                                Existing
                              </div>
                            )}
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
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* URL Input Section removed - using Supabase uploads only */}
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
                onClick={(e) => {
                  console.log('Create Product button clicked!');
                  console.log('Form errors:', form.formState.errors);
                  console.log('Form values:', form.getValues());
                  console.log('Form is valid:', form.formState.isValid);
                  
                  if (!form.formState.isValid) {
                    console.log('Form validation failed, preventing submission');
                    toast({
                      title: "Form Validation Error",
                      description: "Please fill in all required fields (English name, Myanmar name, English description, Myanmar description)",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-create-product"
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
