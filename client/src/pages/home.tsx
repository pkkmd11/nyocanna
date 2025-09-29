import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { useProducts, useProduct } from '@/hooks/useProducts';
import { useFaqItems } from '@/hooks/useFaq';
import { useContactInfo } from '@/hooks/useContacts';
import { Language, QUALITY_TIERS } from '@/types';

export default function HomePage() {
  const [language, setLanguage] = useState<Language>('my');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [, setLocation] = useLocation();

  const { data: products = [], isLoading } = useProducts(selectedQuality);
  const { data: selectedProduct } = useProduct(selectedProductId || '');
  const { data: faqItems = [] } = useFaqItems();
  const { data: contactInfo = [] } = useContactInfo();

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check admin credentials
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin') {
      setShowAdminLogin(false);
      setLocation('/admin');
      // Store admin session
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert('Invalid credentials. Only admin/admin is allowed.');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-cannabis-bg">
      <Header 
        currentLanguage={language}
        onLanguageChange={setLanguage}
        onAdminLogin={handleAdminLogin}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 font-myanmar">
            အရည်အသွေးမြင့် ကန်နာဗစ်
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Premium Quality Cannabis Products
          </p>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            Carefully curated selection of high-quality cannabis products with direct seller communication
          </p>
        </div>
      </section>
      {/* Product Catalog */}
      <section id="products" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quality Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={selectedQuality === 'all' ? 'default' : 'outline'}
              size="sm"
              className="px-4 py-2 text-sm font-medium"
              onClick={() => setSelectedQuality('all')}
            >
              All Products
            </Button>
            {QUALITY_TIERS.map((tier) => (
              <Button
                key={tier.id}
                variant={selectedQuality === tier.id ? 'default' : 'outline'}
                size="sm"
                className="px-4 py-2 text-sm font-medium"
                onClick={() => setSelectedQuality(tier.id)}
              >
                {tier.label[language]}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 rounded-lg mb-3" style={{ aspectRatio: '9/16', minHeight: '200px' }}></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  onClick={() => setSelectedProductId(product.id)}
                />
              ))}
            </div>
          )}

          {products.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8 font-myanmar">
            ကျွန်ုပ်တို့အကြောင်း
          </h2>
          <div className="prose prose-lg mx-auto">
            <p className="text-muted-foreground mb-6">
              YeYint is Myanmar's premier cannabis provider, committed to delivering the highest quality products 
              through direct seller communication. We ensure authenticity, quality, and customer satisfaction 
              in every transaction.
            </p>
            <p className="text-muted-foreground font-myanmar">ပထမဆုံး အွန်လိုင်း ကန်နဗစ်</p>
          </div>
        </div>
      </section>
      {/* How to Order Section */}
      <section id="how-to-order" className="py-16 bg-cannabis-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 font-myanmar">
            မှာယူပုံ
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactInfo.filter(contact => contact.isActive).map((contact) => {
              const getPlatformConfig = () => {
                switch(contact.platform) {
                  case 'telegram':
                    return { name: 'Telegram', icon: 'fab fa-telegram-plane', color: 'bg-blue-500', desc: 'Fast and secure messaging' };
                  case 'whatsapp':
                    return { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'bg-green-500', desc: 'Direct messaging and calls' };
                  case 'messenger':
                    return { name: 'Messenger', icon: 'fab fa-facebook-messenger', color: 'bg-blue-600', desc: 'Facebook messaging' };
                  default:
                    return { name: contact.platform, icon: 'fas fa-message', color: 'bg-gray-500', desc: 'Contact us' };
                }
              };
              const platformConfig = getPlatformConfig();
              
              return (
                <Card key={contact.platform} className="text-center shadow-lg">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${platformConfig.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <i className={`${platformConfig.icon} text-white text-2xl`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{platformConfig.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {platformConfig.desc}
                    </p>
                    <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      {contact.qrCode ? (
                        <img 
                          src={contact.qrCode} 
                          alt={`${platformConfig.name} QR Code`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">QR Code</span>
                      )}
                    </div>
                    <Button 
                      className={`${platformConfig.color} hover:opacity-90 text-white`}
                      onClick={() => contact.url && window.open(contact.url, '_blank')}
                      disabled={!contact.url}
                    >
                      Contact via {platformConfig.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 font-myanmar">
            မေးလေ့ရှိသောမေးခွန်းများ
          </h2>
          <Accordion type="single" collapsible>
            {faqItems.length > 0 ? (
              faqItems.map((faq, index) => (
                <AccordionItem key={faq.id} value={`item-${index + 1}`}>
                  <AccordionTrigger className={language === 'my' ? 'font-myanmar' : ''}>
                    {language === 'my' && (faq.question as any)?.my 
                      ? (faq.question as any).my 
                      : (faq.question as any)?.en || 'Question not available'}
                  </AccordionTrigger>
                  <AccordionContent className={language === 'my' ? 'font-myanmar' : ''}>
                    {language === 'my' && (faq.answer as any)?.my 
                      ? (faq.answer as any).my 
                      : (faq.answer as any)?.en || 'Answer not available'}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No FAQ items available.</p>
              </div>
            )}
          </Accordion>
        </div>
      </section>
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct || null}
        language={language}
        isOpen={!!selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
      {/* Admin Login Modal */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Admin Login</h2>
            <p className="text-muted-foreground">Enter your credentials to access the admin panel</p>
          </div>
          
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                required 
                data-testid="input-admin-username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                required 
                data-testid="input-admin-password"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAdminLogin(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Login
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
