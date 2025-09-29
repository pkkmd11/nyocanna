import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ContactInfo, InsertContactInfo } from '@shared/schema';
import { z } from 'zod';
import { Save, Upload, X, MessageCircle, Phone, Facebook, ExternalLink, QrCode } from 'lucide-react';
import { ObjectUploader } from './ObjectUploader';

const contactFormSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  isActive: z.boolean(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactManagementProps {
  contactInfo: ContactInfo[];
  isLoading: boolean;
  onUpdate: (platform: string, data: Partial<InsertContactInfo>) => void;
  isUpdating?: boolean;
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  urlLabel: string;
  placeholder: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: <MessageCircle className="w-5 h-5" />,
    color: 'bg-blue-500',
    urlLabel: 'Telegram Link',
    placeholder: 'https://t.me/yourusername'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <Phone className="w-5 h-5" />,
    color: 'bg-green-500',
    urlLabel: 'WhatsApp Link',
    placeholder: 'https://wa.me/1234567890'
  },
  {
    id: 'messenger',
    name: 'Messenger',
    icon: <Facebook className="w-5 h-5" />,
    color: 'bg-blue-600',
    urlLabel: 'Messenger Link',
    placeholder: 'https://m.me/yourpage'
  }
];

export function ContactManagement({ contactInfo, isLoading, onUpdate, isUpdating }: ContactManagementProps) {
  const { toast } = useToast();
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [uploadingQR, setUploadingQR] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      url: '',
      isActive: true,
    },
  });

  const getContactForPlatform = (platform: string) => {
    return contactInfo.find(contact => contact.platform === platform);
  };

  const handleEdit = (platform: string) => {
    const contact = getContactForPlatform(platform);
    if (contact) {
      form.reset({
        url: contact.url,
        isActive: contact.isActive ?? true,
      });
    } else {
      form.reset({
        url: '',
        isActive: true,
      });
    }
    setEditingPlatform(platform);
  };

  const handleCancel = () => {
    setEditingPlatform(null);
    form.reset();
  };

  const handleSubmit = (formData: ContactFormData) => {
    if (!editingPlatform) return;

    try {
      const contactData: Partial<InsertContactInfo> = {
        platform: editingPlatform,
        url: formData.url,
        isActive: formData.isActive,
      };

      onUpdate(editingPlatform, contactData);
      setEditingPlatform(null);
      form.reset();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Update Error",
        description: "Failed to update contact information",
        variant: "destructive",
      });
    }
  };

  const handleQRUploadComplete = async (platform: string, uploadedUrls: string[]) => {
    if (uploadedUrls.length > 0) {
      const qrCodeUrl = uploadedUrls[0]; // Take the first uploaded image
      
      try {
        onUpdate(platform, { qrCode: qrCodeUrl });
        setUploadingQR(null);
        
        toast({
          title: "QR Code Updated",
          description: `QR code for ${PLATFORMS.find(p => p.id === platform)?.name} has been updated`,
        });
      } catch (error) {
        console.error('Error updating QR code:', error);
        toast({
          title: "Update Error",
          description: "Failed to update QR code",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Contact Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLATFORMS.map((platform) => (
            <Card key={platform.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contact Management</h2>
      <p className="text-muted-foreground">
        Manage your messaging platform links and QR codes for customer contact.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const contact = getContactForPlatform(platform.id);
          const isEditing = editingPlatform === platform.id;

          return (
            <Card key={platform.id} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-white ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{platform.name}</div>
                    <Badge variant={contact?.isActive ? 'default' : 'secondary'} className="mt-1">
                      {contact?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{platform.urlLabel}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={platform.placeholder}
                                data-testid={`input-url-${platform.id}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Active</FormLabel>
                              <div className="text-xs text-muted-foreground">
                                Show this contact option
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid={`switch-active-${platform.id}`}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isUpdating}
                          data-testid={`button-save-${platform.id}`}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          {isUpdating ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          data-testid={`button-cancel-${platform.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Current Link</div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm break-all" data-testid={`text-url-${platform.id}`}>
                          {contact?.url || 'No link set'}
                        </div>
                        {contact?.url && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto"
                            onClick={() => window.open(contact.url, '_blank')}
                            data-testid={`button-open-${platform.id}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">QR Code</div>
                      {contact?.qrCode ? (
                        <div className="relative">
                          <img 
                            src={contact.qrCode} 
                            alt={`${platform.name} QR Code`}
                            className="w-24 h-24 rounded-lg border object-cover"
                            data-testid={`img-qr-${platform.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => setUploadingQR(platform.id)}
                            data-testid={`button-change-qr-${platform.id}`}
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            Change QR Code
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setUploadingQR(platform.id)}
                          data-testid={`button-upload-qr-${platform.id}`}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload QR Code
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEdit(platform.id)}
                      data-testid={`button-edit-${platform.id}`}
                    >
                      Edit {platform.name}
                    </Button>
                  </div>
                )}
              </CardContent>

              {uploadingQR === platform.id && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg p-4 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Upload QR Code for {platform.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadingQR(null)}
                      data-testid={`button-close-upload-${platform.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    onComplete={(urls: string[]) => handleQRUploadComplete(platform.id, urls)}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload QR code image
                      </p>
                    </div>
                  </ObjectUploader>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}