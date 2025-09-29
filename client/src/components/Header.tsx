import { Button } from '@/components/ui/button';
import { LanguageToggle } from './LanguageToggle';
import { Language } from '@/types';
import { Shield } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onAdminLogin: () => void;
}

export function Header({ currentLanguage, onLanguageChange, onAdminLogin }: HeaderProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Nyo</h1>
            <span className="ml-2 text-sm text-muted-foreground">Premium Cannabis</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageToggle 
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
            
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary hover:text-secondary font-medium"
              onClick={onAdminLogin}
            >
              <Shield className="w-4 h-4 mr-1" />
              Login
            </Button>
          </div>
        </div>
        
        <nav className="flex space-x-8 pb-4">
          <button
            onClick={() => scrollToSection('products')}
            className="text-primary border-b-2 border-primary pb-2 font-medium"
          >
            Products
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="text-muted-foreground hover:text-primary pb-2 transition-colors"
          >
            About Us
          </button>
          <button
            onClick={() => scrollToSection('how-to-order')}
            className="text-muted-foreground hover:text-primary pb-2 transition-colors"
          >
            How to Order
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-muted-foreground hover:text-primary pb-2 transition-colors"
          >
            FAQ
          </button>
        </nav>
      </div>
    </header>
  );
}
