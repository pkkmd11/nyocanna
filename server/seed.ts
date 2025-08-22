import { db } from './database';
import { products, contactInfo, faqItems } from '@shared/schema';

// Sample product data with 9:16 aspect ratio images
const sampleProducts = [
  {
    name: { 
      en: "Premium OG Kush", 
      my: "ပရီမီယံ OG Kush" 
    },
    description: { 
      en: "Premium grade OG Kush with exceptional quality and potency. Carefully cultivated and processed to ensure maximum satisfaction.",
      my: "အရည်အသွေးမြင့် OG Kush ထူးထူးခြားခြား အရည်အသွေးနှင့် စွမ်းအားရှိသော။ အများဆုံးကျေနပ်မှုရရှိစေရန် ဂရုတစိုက်စိုက်ပျိုးပြီး ပြုပြင်ထားသည်။"
    },
    quality: "high",
    images: [
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700",
      "https://images.unsplash.com/photo-1617792369039-b4b1b8f67e8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700",
      "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700"
    ],
    videos: [],
    specifications: {
      en: ["Quality: Premium High Grade", "Type: Indica Dominant Hybrid", "Origin: Indoor cultivation"],
      my: ["အရည်အသွေး: ပရီမီယံမြင့်မားသောအဆင့်", "အမျိုးအစား: Indica လွှမ်းမိုးနေသော မျိုးရိုးရိုး", "မူလ: အိမ်တွင်းစိုက်ပျိုးမှု"]
    },
    isActive: true,
  },
  {
    name: { 
      en: "White Widow Elite", 
      my: "White Widow အထူး" 
    },
    description: { 
      en: "Elite strain of White Widow known for its balanced effects and crystal-covered buds.",
      my: "ကျွန်ုပ်တို့၏ အခြေအနေရှိတဲ့ သက်ရောက်မှုများနှင့် ကျောက်မျက်ရတနာပြည့်နှံ့သော ပွင့်များအတွက် လူသိများသော White Widow ၏ အထူးမျိုးရိုး။"
    },
    quality: "high",
    images: [
      "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700"
    ],
    videos: [],
    specifications: {
      en: ["Quality: Elite Grade", "Type: Balanced Hybrid", "THC: High Content"],
      my: ["အရည်အသွေး: အထူးအဆင့်", "အမျိုးအစား: အခြေအနေရှိမျိုးရိုး", "THC: မြင့်မားသောပါဝင်မှု"]
    },
    isActive: true,
  },
  {
    name: { 
      en: "Blue Dream Standard", 
      my: "Blue Dream စံ" 
    },
    description: { 
      en: "Standard quality Blue Dream with balanced sativa-indica effects perfect for any time use.",
      my: "အချိန်မရွေး အသုံးပြုရန် ပြီးပြည့်စုံသော sativa-indica အခြေအနေရှိ သက်ရောက်မှုများရှိသော Blue Dream စံအရည်အသွေး။"
    },
    quality: "medium",
    images: [
      "https://images.unsplash.com/photo-1536939459926-301728717817?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700",
      "https://images.unsplash.com/photo-1617792369039-b4b1b8f67e8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700"
    ],
    videos: [],
    specifications: {
      en: ["Quality: Standard Grade", "Type: Balanced Hybrid", "Effect: Versatile"],
      my: ["အရည်အသွေး: စံအဆင့်", "အမျိုးအစား: အခြေအနေရှိမျိုးရိုး", "သက်ရောက်မှု: အမျိုးမျိုး"]
    },
    isActive: true,
  },
  {
    name: { 
      en: "Green Crack Budget", 
      my: "Green Crack ငွေကုန်နည်း" 
    },
    description: { 
      en: "Budget-friendly Green Crack with energizing effects, great value for money.",
      my: "စွမ်းအင်ပေးသော သက်ရောက်မှုများရှိသော ငွေကုန်နည်းသော Green Crack၊ ငွေတန်ဖိုးကောင်းမွန်သော။"
    },
    quality: "low",
    images: [
      "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700"
    ],
    videos: [],
    specifications: {
      en: ["Quality: Budget Grade", "Type: Sativa Dominant", "Effect: Energizing"],
      my: ["အရည်အသွေး: ငွေကုန်နည်းအဆင့်", "အမျိုးအစား: Sativa လွှမ်းမိုး", "သက်ရောက်မှု: စွမ်းအင်ပေး"]
    },
    isActive: true,
  },
  {
    name: { 
      en: "Purple Haze Premium", 
      my: "Purple Haze ပရီမီယံ" 
    },
    description: { 
      en: "Classic Purple Haze strain with distinctive purple coloration and uplifting effects.",
      my: "ထူးခြားသော ခရမ်းရောင်နှင့် စိတ်ဓာတ်မြှင့်တင်သော သက်ရောက်မှုများရှိသော ဂန္တဝင် Purple Haze မျိုးရိုး။"
    },
    quality: "high",
    images: [
      "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700",
      "https://images.unsplash.com/photo-1617792369039-b4b1b8f67e8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700"
    ],
    videos: [],
    specifications: {
      en: ["Quality: Premium Grade", "Type: Sativa Dominant", "Color: Purple tints"],
      my: ["အရည်အသွေး: ပရီမီယံအဆင့်", "အမျိုးအစား: Sativa လွှမ်းမိုး", "အရောင်: ခရမ်းရောင်ရောစပ်"]
    },
    isActive: true,
  },
  {
    name: { 
      en: "Afghani Standard", 
      my: "Afghani စံ" 
    },
    description: { 
      en: "Traditional Afghani indica strain with relaxing and sedating effects.",
      my: "အပန်းဖြေစေသော နှင့် အေးချမ်းစေသော သက်ရောက်မှုများရှိသော ရိုးရာ Afghani indica မျိုးရိုး။"
    },
    quality: "medium",
    images: [
      "https://images.unsplash.com/photo-1536939459926-301728717817?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700",
      "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700"
    ],
    videos: [],
    specifications: {
      en: ["Quality: Standard Grade", "Type: Pure Indica", "Effect: Relaxing"],
      my: ["အရည်အသွေး: စံအဆင့်", "အမျိုးအစား: စစ်စစ် Indica", "သက်ရောက်မှု: အပန်းဖြေ"]
    },
    isActive: true,
  }
];

const sampleContacts = [
  {
    platform: 'telegram',
    url: 'https://t.me/yeyint_cannabis',
    qrCode: null,
    isActive: true,
  },
  {
    platform: 'whatsapp',
    url: 'https://wa.me/959123456789',
    qrCode: null,
    isActive: true,
  },
  {
    platform: 'messenger',
    url: 'https://m.me/yeyint.cannabis',
    qrCode: null,
    isActive: true,
  }
];

const sampleFaq = [
  {
    question: { 
      en: "How do I place an order?", 
      my: "မှာယူမှုကို ဘယ်လိုလုပ်ရမလဲ?" 
    },
    answer: { 
      en: "Contact us directly through any of our messaging platforms (Telegram, WhatsApp, or Messenger) with your product inquiry. Our team will guide you through the process.",
      my: "သင်၏ ထုတ်ကုန်မေးမြန်းမှုနှင့်အတူ ကျွန်ုပ်တို့၏ မက်ဆေ့ချ် ပလပ်ဖောင်းများ (Telegram, WhatsApp, သို့မဟုတ် Messenger) မှတစ်ဆင့် တိုက်ရိုက်ဆက်သွယ်ပါ။ ကျွန်ုပ်တို့အဖွဲ့က လုပ်ငန်းစဉ်ကို လမ်းညွှန်ပေးပါမည်။"
    },
    order: 1,
    isActive: true,
  },
  {
    question: { 
      en: "What payment methods do you accept?", 
      my: "မည်သည့်ငွေပေးချေမှုနည်းလမ်းများကို လက်ခံပါသလဲ?" 
    },
    answer: { 
      en: "Payment details will be discussed directly with our sales team through your preferred messaging platform. We ensure secure and convenient payment options.",
      my: "ငွေပေးချေမှုအသေးစိတ်များကို သင်နှစ်သက်သော မက်ဆေ့ချ်ပလပ်ဖောင်းမှတစ်ဆင့် ကျွန်ုပ်တို့၏ရောင်းချရေးအဖွဲ့နှင့် တိုက်ရိုက်ဆွေးနွေးပါမည်။ ကျွန်ုပ်တို့သည် လုံခြုံပြီး အဆင်ပြေသော ငွေပေးချေမှုရွေးချယ်စရာများကို အာမခံပါသည်။"
    },
    order: 2,
    isActive: true,
  },
  {
    question: { 
      en: "How do you ensure product quality?", 
      my: "ပစ္စည်းများအရည်အသွေးကို ဘယ်လိုအာမခံပါသလဲ?" 
    },
    answer: { 
      en: "We conduct quality checks on every product and guarantee customer satisfaction. All products are carefully sourced and tested before being offered.",
      my: "ကျွန်ုပ်တို့သည် ထုတ်ကုန်တိုင်းအတွက် အရည်အသွေးစစ်ဆေးမှုများ ပြုလုပ်ပြီး၊ သုံးစွဲသူများ၏ စိတ်ကျေနပ်မှုကို အာမခံပါသည်။ ထုတ်ကုန်အားလုံးကို ကမ်းလှမ်းခြင်းမပြုမီ ဂရုတစိုက်ရယူပြီး စမ်းသပ်ထားပါသည်။"
    },
    order: 3,
    isActive: true,
  }
];

export async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Insert sample products
    for (const product of sampleProducts) {
      await db.insert(products).values(product).onConflictDoNothing();
    }
    
    // Insert sample contacts
    for (const contact of sampleContacts) {
      await db.insert(contactInfo).values(contact).onConflictDoNothing();
    }
    
    // Insert sample FAQ
    for (const faq of sampleFaq) {
      await db.insert(faqItems).values(faq).onConflictDoNothing();
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}