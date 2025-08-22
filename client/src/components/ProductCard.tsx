import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { Product } from '@shared/schema';
import { Language, QUALITY_TIERS } from '@/types';

interface ProductCardProps {
  product: Product;
  language: Language;
  onClick: () => void;
}

export function ProductCard({ product, language, onClick }: ProductCardProps) {
  const name = (product.name as any)?.[language] || 'Product Name';
  const description = (product.description as any)?.[language] || 'Product Description';
  
  const qualityTier = QUALITY_TIERS.find(tier => tier.id === product.quality);
  const qualityLabel = qualityTier?.label[language] || product.quality;
  
  const previewImage = product.images?.[0] || 'https://images.unsplash.com/photo-1536939459926-301728717817?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';

  return (
    <Card 
      className="product-card cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: product.images?.[0] ? 'auto' : '4/3', minHeight: '200px' }}>
        <img 
          src={previewImage} 
          alt={name}
          className="w-full h-full object-cover"
          style={{ aspectRatio: 'auto' }}
        />
        <div className="absolute top-3 right-3">
          <Badge className={qualityTier?.className || 'bg-muted text-muted-foreground'}>
            {qualityLabel}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{name}</h3>
        <p className={`text-muted-foreground text-sm mb-3 line-clamp-2 ${
          language === 'my' ? 'font-myanmar' : ''
        }`}>
          {description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-primary font-bold">Contact for Price</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
