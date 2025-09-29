import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/AdminSidebar';
import { ProductForm } from '@/components/ProductForm';
import { FaqForm } from '@/components/FaqForm';
import { FaqTable } from '@/components/FaqTable';
import { ContactManagement } from '@/components/ContactManagement';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useFaqItems, useCreateFaqItem, useUpdateFaqItem, useDeleteFaqItem } from '@/hooks/useFaq';
import { useContactInfo, useUpdateContactInfo } from '@/hooks/useContacts';
import { Product, InsertProduct, FaqItem, InsertFaqItem, InsertContactInfo } from '@shared/schema';
import { QUALITY_TIERS } from '@/types';
import { BarChart3, Leaf, Images, MessageSquare, Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // FAQ state
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      // Redirect to home if not authenticated
      setLocation('/');
    }
  }, [setLocation]);

  // Product hooks
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // FAQ hooks
  const { data: faqItems = [], isLoading: faqLoading } = useFaqItems();
  const createFaqItem = useCreateFaqItem();
  const updateFaqItem = useUpdateFaqItem();
  const deleteFaqItem = useDeleteFaqItem();

  // Contact hooks
  const { data: contactInfo = [], isLoading: contactLoading } = useContactInfo();
  const updateContactInfo = useUpdateContactInfo();

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setLocation('/');
  };

  const handleCreateProduct = async (productData: InsertProduct) => {
    try {
      console.log('Creating product with data:', productData);
      await createProduct.mutateAsync(productData);
      setShowProductForm(false);
      console.log('Product created successfully');
      
      // Redirect to client homepage after successful creation
      setTimeout(() => {
        setLocation('/');
      }, 1500); // Small delay to show success message
    } catch (error) {
      console.error('Error creating product:', error);
      throw error; // Re-throw so the form can handle it
    }
  };

  const handleUpdateProduct = async (productData: InsertProduct) => {
    if (editingProduct) {
      try {
        console.log('Updating product with data:', productData);
        await updateProduct.mutateAsync(
          { id: editingProduct.id, product: productData }
        );
        setShowProductForm(false);
        setEditingProduct(null);
        console.log('Product updated successfully');
      } catch (error) {
        console.error('Error updating product:', error);
        throw error; // Re-throw so the form can handle it
      }
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(productId);
    }
  };

  const handleDeleteAllProducts = async () => {
    // Simplified confirmation process
    const userConfirmation = prompt(
      `⚠️ WARNING: This will delete ALL ${products.length} products permanently!\n\nThis action cannot be undone.\n\nType "DELETE ALL" to confirm:`
    );
    
    if (userConfirmation === 'DELETE ALL') {
      let successCount = 0;
      let failCount = 0;
      const failedProducts = [];

      // Delete each product individually with better error handling
      for (const product of products) {
        try {
          await deleteProduct.mutateAsync(product.id);
          successCount++;
        } catch (error) {
          console.error(`Error deleting product ${product.id}:`, error);
          failCount++;
          failedProducts.push((product.name as any)?.en || product.id);
        }
      }

      // Provide detailed feedback to user
      if (failCount === 0) {
        alert(`✅ Success! All ${successCount} products have been deleted.`);
      } else if (successCount === 0) {
        alert(`❌ Failed to delete any products. Please try again or delete products individually.`);
      } else {
        alert(`⚠️ Partial success: ${successCount} products deleted, ${failCount} failed.\n\nFailed products: ${failedProducts.join(', ')}`);
      }
    }
  };

  // FAQ handlers
  const handleCreateFaqItem = async (faqData: InsertFaqItem) => {
    try {
      await createFaqItem.mutateAsync(faqData);
      setShowFaqForm(false);
      console.log('FAQ item created successfully');
    } catch (error) {
      console.error('Error creating FAQ item:', error);
      throw error;
    }
  };

  const handleUpdateFaqItem = async (faqData: InsertFaqItem) => {
    if (editingFaq) {
      try {
        await updateFaqItem.mutateAsync({ id: editingFaq.id, faqItem: faqData });
        setShowFaqForm(false);
        setEditingFaq(null);
        console.log('FAQ item updated successfully');
      } catch (error) {
        console.error('Error updating FAQ item:', error);
        throw error;
      }
    }
  };

  const handleDeleteFaqItem = (id: string) => {
    deleteFaqItem.mutate(id);
  };

  const handleEditFaqItem = (faqItem: FaqItem) => {
    setEditingFaq(faqItem);
    setShowFaqForm(true);
  };

  const handleAddFaqItem = () => {
    setEditingFaq(null);
    setShowFaqForm(true);
  };

  // Contact handlers
  const handleUpdateContactInfo = async (platform: string, contactData: Partial<InsertContactInfo>) => {
    try {
      await updateContactInfo.mutateAsync({ platform, contactInfo: contactData });
      console.log('Contact info updated successfully');
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  };

  const getQualityBadgeClass = (quality: string) => {
    const tier = QUALITY_TIERS.find(t => t.id === quality);
    return tier?.className || 'bg-muted text-muted-foreground';
  };

  const getQualityLabel = (quality: string) => {
    const tier = QUALITY_TIERS.find(t => t.id === quality);
    return tier?.label.en || quality;
  };

  const stats = {
    totalProducts: products.length,
    highQuality: products.filter(p => p.quality === 'high').length,
    mediumQuality: products.filter(p => p.quality === 'medium').length,
    lowQuality: products.filter(p => p.quality === 'low').length,
    activeProducts: products.filter(p => p.isActive).length,
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">High Quality</p>
                <p className="text-2xl font-bold">{stats.highQuality}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Images className="w-6 h-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{stats.activeProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => {
              const name = (product.name as any)?.en || 'Product';
              return (
                <div key={product.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Product "{name}" updated</span>
                  <span className="text-xs text-muted-foreground ml-auto">Recently</span>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleDeleteAllProducts} 
            variant="destructive"
            size="sm"
            disabled={products.length === 0}
          >
            Delete All Products
          </Button>
          <Button onClick={() => setShowProductForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      {showProductForm ? (
        <ProductForm
          initialData={editingProduct ? {
            nameEn: (editingProduct.name as any)?.en || '',
            nameMy: (editingProduct.name as any)?.my || '',
            descriptionEn: (editingProduct.description as any)?.en || '',
            descriptionMy: (editingProduct.description as any)?.my || '',
            quality: editingProduct.quality as "high" | "medium" | "low",
            existingImages: editingProduct.images || [],
            specificationsEn: ((editingProduct.specifications as any)?.en || []).join('\n'),
            specificationsMy: ((editingProduct.specifications as any)?.my || []).join('\n'),
            isActive: editingProduct.isActive ?? true,
          } : undefined}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          isSubmitting={createProduct.isPending || updateProduct.isPending}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        No products found. Create your first product to get started.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const name = (product.name as any)?.en || 'Product';
                      const description = (product.description as any)?.my || '';
                      const previewImage = product.images?.[0];
                      
                      return (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {previewImage ? (
                                  <img 
                                    className="h-10 w-10 rounded-lg object-cover" 
                                    src={previewImage} 
                                    alt={name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Images className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-foreground">{name}</div>
                                <div className="text-sm text-muted-foreground font-myanmar line-clamp-1">
                                  {description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getQualityBadgeClass(product.quality)}>
                              {getQualityLabel(product.quality)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {product.images?.length || 0} images
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={product.isActive ? 'default' : 'secondary'}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'media':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Media Management</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Media management functionality coming soon.</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'content':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Content Management</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Content management functionality coming soon.</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'contacts':
        return (
          <ContactManagement
            contactInfo={contactInfo}
            isLoading={contactLoading}
            onUpdate={handleUpdateContactInfo}
            isUpdating={updateContactInfo.isPending}
          />
        );
      case 'faq':
        return (
          <div className="space-y-6">
            {showFaqForm ? (
              <FaqForm
                initialData={editingFaq ? {
                  questionEn: (editingFaq.question as any)?.en || '',
                  questionMy: (editingFaq.question as any)?.my || '',
                  answerEn: (editingFaq.answer as any)?.en || '',
                  answerMy: (editingFaq.answer as any)?.my || '',
                  order: editingFaq.order || 0,
                  isActive: editingFaq.isActive ?? true,
                } : undefined}
                onSubmit={editingFaq ? handleUpdateFaqItem : handleCreateFaqItem}
                onCancel={() => {
                  setShowFaqForm(false);
                  setEditingFaq(null);
                }}
                isSubmitting={createFaqItem.isPending || updateFaqItem.isPending}
                isEditing={!!editingFaq}
              />
            ) : (
              <FaqTable
                faqItems={faqItems}
                isLoading={faqLoading}
                onEdit={handleEditFaqItem}
                onDelete={handleDeleteFaqItem}
                onAdd={handleAddFaqItem}
              />
            )}
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-cannabis-bg flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
