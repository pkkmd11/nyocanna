import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InsertFaqItem } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Save, X } from 'lucide-react';

// Create a form-specific schema that matches our form fields
const faqFormSchema = z.object({
  questionEn: z.string().min(1, 'English question is required'),
  questionMy: z.string().min(1, 'Myanmar question is required'),
  answerEn: z.string().min(1, 'English answer is required'),
  answerMy: z.string().min(1, 'Myanmar answer is required'),
  order: z.number().min(0, 'Order must be 0 or greater').optional(),
  isActive: z.boolean().optional(),
});

type FaqFormData = z.infer<typeof faqFormSchema>;

interface FaqFormProps {
  initialData?: Partial<FaqFormData>;
  onSubmit: (data: InsertFaqItem) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function FaqForm({ initialData, onSubmit, onCancel, isSubmitting, isEditing }: FaqFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FaqFormData>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      questionEn: '',
      questionMy: '',
      answerEn: '',
      answerMy: '',
      order: 0,
      isActive: true,
      ...initialData,
    },
  });

  const handleSubmit = (formData: FaqFormData) => {
    try {
      console.log('FAQ Form submission data:', formData);
      
      // Transform form data to match the database schema
      const faqData: InsertFaqItem = {
        question: {
          en: formData.questionEn,
          my: formData.questionMy,
        },
        answer: {
          en: formData.answerEn,
          my: formData.answerMy,
        },
        order: formData.order || 0,
        isActive: formData.isActive ?? true,
      };

      console.log('Processed FAQ data:', faqData);
      onSubmit(faqData);
    } catch (error) {
      console.error('Error processing FAQ form:', error);
      toast({
        title: "Form Error",
        description: "Failed to process form data",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Save className="w-5 h-5" />
              Edit FAQ Item
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Create New FAQ Item
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Question */}
              <FormField
                control={form.control}
                name="questionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter question in English..."
                        className="min-h-[80px]"
                        data-testid="input-question-en"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Myanmar Question */}
              <FormField
                control={form.control}
                name="questionMy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question (Myanmar)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="မြန်မာလို မေးခွန်းရိုက်ထည့်ပါ..."
                        className="min-h-[80px] font-myanmar"
                        data-testid="input-question-my"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Answer */}
              <FormField
                control={form.control}
                name="answerEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed answer in English..."
                        className="min-h-[120px]"
                        data-testid="input-answer-en"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Myanmar Answer */}
              <FormField
                control={form.control}
                name="answerMy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer (Myanmar)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="မြန်မာလို အပြည့်အစုံ ဖြေကြားချက်ရိုက်ထည့်ပါ..."
                        className="min-h-[120px] font-myanmar"
                        data-testid="input-answer-my"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order */}
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        data-testid="input-order"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Status
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Show this FAQ item on the website
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update FAQ' : 'Create FAQ')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}