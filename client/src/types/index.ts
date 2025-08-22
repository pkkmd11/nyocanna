export type Language = 'en' | 'my';

export interface MultilingualText {
  en: string;
  my: string;
}

export interface QualityTier {
  id: 'high' | 'medium' | 'low';
  label: MultilingualText;
  className: string;
}

export const QUALITY_TIERS: QualityTier[] = [
  {
    id: 'high',
    label: { en: 'High Quality', my: 'အရည်အသွေးမြင့်' },
    className: 'quality-high'
  },
  {
    id: 'medium', 
    label: { en: 'Medium Quality', my: 'အလယ်အလတ်' },
    className: 'quality-medium'
  },
  {
    id: 'low',
    label: { en: 'Low Quality', my: 'သက်သာသောစျေးနှုန်း' },
    className: 'quality-low'
  }
];

export const CONTACT_PLATFORMS = [
  { id: 'telegram', name: 'Telegram', icon: 'fab fa-telegram-plane', color: 'bg-blue-500' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'bg-green-500' },
  { id: 'messenger', name: 'Messenger', icon: 'fab fa-facebook-messenger', color: 'bg-blue-600' },
];
