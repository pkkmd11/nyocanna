import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { insertProductSchema, InsertProduct } from '@shared/schema';
import { z } from 'zod';

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

  const handleSubmit = (data: ProductFormData) => {
    const productData: InsertProduct = {
      name: {
        en: data.nameEn,
        my: data.nameMy,
      },
      description: {
        en: data.descriptionEn,
        my: data.descriptionMy,
      },
      quality: data.quality,
      images: data.imageUrls ? data.imageUrls.split('\n').filter(Boolean) : [],
      videos: data.videoUrls ? data.videoUrls.split('\n').filter(Boolean) : [],
      specifications: {
        en: data.specificationsEn ? data.specificationsEn.split('\n').filter(Boolean) : [],
        my: data.specificationsMy ? data.specificationsMy.split('\n').filter(Boolean) : [],
      },
      isActive: data.isActive ?? true,
    };

    onSubmit(productData);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URLs</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter image URLs (one per line)" 
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
                onClick={onCancel}
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
