import { 
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type SiteContent,
  type ContactInfo,
  type FaqItem,
  products,
  users,
  siteContent,
  contactInfo,
  faqItems
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from './database';
import { eq, and } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(quality?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Site content methods
  getSiteContent(): Promise<SiteContent[]>;
  getSiteContentBySection(section: string): Promise<SiteContent | undefined>;
  updateSiteContent(section: string, content: any): Promise<SiteContent>;
  
  // Contact info methods
  getContactInfo(): Promise<ContactInfo[]>;
  getAllContactInfo(): Promise<ContactInfo[]>;
  updateContactInfo(platform: string, info: Partial<ContactInfo>): Promise<ContactInfo>;
  
  // FAQ methods
  getFaqItems(): Promise<FaqItem[]>;
  getAllFaqItems(): Promise<FaqItem[]>;
  createFaqItem(item: any): Promise<FaqItem>;
  updateFaqItem(id: string, item: any): Promise<FaqItem | undefined>;
  deleteFaqItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private siteContent: Map<string, SiteContent>;
  private contactInfo: Map<string, ContactInfo>;
  private faqItems: Map<string, FaqItem>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.siteContent = new Map();
    this.contactInfo = new Map();
    this.faqItems = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample products
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: { en: "Premium OG Kush", my: "ပရီမီယံ OG Kush" },
        description: { 
          en: "Premium grade OG Kush with exceptional quality and potency. Carefully cultivated and processed to ensure maximum satisfaction.",
          my: "အရည်အသွေးမြင့် OG Kush ထူးထူးခြားခြား အရည်အသွေးနှင့် စွမ်းအားရှိသော။ အများဆုံးကျေနပ်မှုရရှိစေရန် ဂရုတစိုက်စိုက်ပျိုးပြီး ပြုပြင်ထားသည်။"
        },
        quality: "high",
        images: [
          "https://images.unsplash.com/photo-1536939459926-301728717817?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800",
          "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
        ],
        videos: [],
        specifications: {
          en: ["Quality: Premium High Grade", "Type: Indica Dominant Hybrid", "Origin: Indoor cultivation"],
          my: ["အရည်အသွေး: ပရီမီယံမြင့်မားသောအဆင့်", "အမျိုးအစား: Indica လွှမ်းမိုးနေသော မျိုးရိုးရိုး", "မူလ: အိမ်တွင်းစိုက်ပျိုးမှု"]
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: { en: "White Widow Elite", my: "White Widow အထူး" },
        description: { 
          en: "Elite strain of White Widow known for its balanced effects and crystal-covered buds.",
          my: "ကျွန်ုပ်တို့၏ အခြေအနေရှိတဲ့ သက်ရောက်မှုများနှင့် ကျောက်မျက်ရတနာပြည့်နှံ့သော ပွင့်များအတွက် လူသိများသော White Widow ၏ အထူးမျိုးရိုး။"
        },
        quality: "high",
        images: [
          "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1536939459926-301728717817?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
        ],
        videos: [],
        specifications: {
          en: ["Quality: Elite Grade", "Type: Balanced Hybrid", "THC: High Content"],
          my: ["အရည်အသွေး: အထူးအဆင့်", "အမျိုးအစား: အခြေအနေရှိမျိုးရိုး", "THC: မြင့်မားသောပါဝင်မှု"]
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: { en: "Green Crack Standard", my: "Green Crack စံ" },
        description: { 
          en: "Standard quality Green Crack with energizing effects perfect for daytime use.",
          my: "နေ့အချိန်အသုံးပြုရန် ပြီးပြည့်စုံသော စွမ်းအင်ပေးသော သက်ရောက်မှုများရှိသော Green Crack စံအရည်အသွေး။"
        },
        quality: "medium",
        images: [
          "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videos: [],
        specifications: {
          en: ["Quality: Standard Grade", "Type: Sativa Dominant", "Effect: Energizing"],
          my: ["အရည်အသွေး: စံအဆင့်", "အမျိုးအစား: Sativa လွှမ်းမိုး", "သက်ရောက်မှု: စွမ်းအင်ပေး"]
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Sample contact info
    const sampleContacts: ContactInfo[] = [
      {
        id: randomUUID(),
        platform: 'telegram',
        url: 'https://t.me/yeyint_cannabis',
        qrCode: null,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        platform: 'whatsapp',
        url: 'https://wa.me/959123456789',
        qrCode: null,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        platform: 'messenger',
        url: 'https://m.me/yeyint.cannabis',
        qrCode: null,
        isActive: true,
        updatedAt: new Date(),
      }
    ];

    sampleContacts.forEach(contact => {
      this.contactInfo.set(contact.id, contact);
    });

    // Sample FAQ items
    const sampleFaq: FaqItem[] = [
      {
        id: randomUUID(),
        question: { 
          en: "How do I place an order?", 
          my: "မှာယူမှုကို ဘယ်လိုလုပ်ရမလဲ?" 
        },
        answer: { 
          en: "Contact us directly through any of our messaging platforms (Telegram, WhatsApp, or Messenger) with your product inquiry.",
          my: "သင်၏ ထုတ်ကုန်မေးမြန်းမှုနှင့်အတူ ကျွန်ုပ်တို့၏ မက်ဆေ့ချ် ပလပ်ဖောင်းများ (Telegram, WhatsApp, သို့မဟုတ် Messenger) မှတစ်ဆင့် တိုက်ရိုက်ဆက်သွယ်ပါ။"
        },
        order: 1,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        question: { 
          en: "What payment methods do you accept?", 
          my: "မည်သည့်ငွေပေးချေမှုနည်းလမ်းများကို လက်ခံပါသလဲ?" 
        },
        answer: { 
          en: "Payment details will be discussed directly with our sales team through your preferred messaging platform.",
          my: "ငွေပေးချေမှုအသေးစိတ်များကို သင်နှစ်သက်သော မက်ဆေ့ချ်ပလပ်ဖောင်းမှတစ်ဆင့် ကျွန်ုပ်တို့၏ရောင်းချရေးအဖွဲ့နှင့် တိုက်ရိုက်ဆွေးနွေးပါမည်။"
        },
        order: 2,
        isActive: true,
        updatedAt: new Date(),
      }
    ];

    sampleFaq.forEach(faq => {
      this.faqItems.set(faq.id, faq);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(quality?: string): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (quality && quality !== 'all') {
      products = products.filter(product => product.quality === quality);
    }
    
    return products.filter(product => product.isActive)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      ...product,
      id,
      images: product.images || [],
      videos: product.videos || [],
      specifications: product.specifications || { en: [], my: [] },
      isActive: product.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...product,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Site content methods
  async getSiteContent(): Promise<SiteContent[]> {
    return Array.from(this.siteContent.values());
  }

  async getSiteContentBySection(section: string): Promise<SiteContent | undefined> {
    return Array.from(this.siteContent.values()).find(content => content.section === section);
  }

  async updateSiteContent(section: string, content: any): Promise<SiteContent> {
    const existing = await this.getSiteContentBySection(section);
    
    if (existing) {
      const updated: SiteContent = {
        ...existing,
        content,
        updatedAt: new Date(),
      };
      this.siteContent.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newContent: SiteContent = {
        id,
        section,
        content,
        updatedAt: new Date(),
      };
      this.siteContent.set(id, newContent);
      return newContent;
    }
  }

  // Contact info methods
  async getContactInfo(): Promise<ContactInfo[]> {
    return Array.from(this.contactInfo.values()).filter(contact => contact.isActive);
  }

  async getAllContactInfo(): Promise<ContactInfo[]> {
    return Array.from(this.contactInfo.values());
  }

  async updateContactInfo(platform: string, info: Partial<ContactInfo>): Promise<ContactInfo> {
    const existing = Array.from(this.contactInfo.values()).find(contact => contact.platform === platform);
    
    if (existing) {
      const updated: ContactInfo = {
        ...existing,
        ...info,
        updatedAt: new Date(),
      };
      this.contactInfo.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newContact: ContactInfo = {
        id,
        platform,
        url: '',
        qrCode: null,
        isActive: true,
        ...info,
        updatedAt: new Date(),
      };
      this.contactInfo.set(id, newContact);
      return newContact;
    }
  }

  // FAQ methods
  async getFaqItems(): Promise<FaqItem[]> {
    return Array.from(this.faqItems.values())
      .filter(item => item.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getAllFaqItems(): Promise<FaqItem[]> {
    return Array.from(this.faqItems.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async createFaqItem(item: any): Promise<FaqItem> {
    const id = randomUUID();
    const newItem: FaqItem = {
      ...item,
      id,
      updatedAt: new Date(),
    };
    this.faqItems.set(id, newItem);
    return newItem;
  }

  async updateFaqItem(id: string, item: any): Promise<FaqItem | undefined> {
    const existing = this.faqItems.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: FaqItem = {
      ...existing,
      ...item,
      updatedAt: new Date(),
    };
    this.faqItems.set(id, updated);
    return updated;
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    return this.faqItems.delete(id);
  }
}

// Database storage implementation
export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Product methods
  async getProducts(quality?: string): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    
    if (quality && quality !== 'all') {
      query = db.select().from(products).where(
        and(
          eq(products.isActive, true),
          eq(products.quality, quality)
        )
      );
    }
    
    const result = await query.orderBy(products.createdAt);
    return result;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Site content methods
  async getSiteContent(): Promise<SiteContent[]> {
    return await db.select().from(siteContent);
  }

  async getSiteContentBySection(section: string): Promise<SiteContent | undefined> {
    const result = await db.select().from(siteContent).where(eq(siteContent.section, section)).limit(1);
    return result[0];
  }

  async updateSiteContent(section: string, content: any): Promise<SiteContent> {
    const existing = await this.getSiteContentBySection(section);
    
    if (existing) {
      const result = await db.update(siteContent)
        .set({ content, updatedAt: new Date() })
        .where(eq(siteContent.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(siteContent)
        .values({ section, content })
        .returning();
      return result[0];
    }
  }

  // Contact info methods
  async getContactInfo(): Promise<ContactInfo[]> {
    return await db.select().from(contactInfo).where(eq(contactInfo.isActive, true));
  }

  async getAllContactInfo(): Promise<ContactInfo[]> {
    return await db.select().from(contactInfo);
  }

  async updateContactInfo(platform: string, info: Partial<ContactInfo>): Promise<ContactInfo> {
    const existing = await db.select().from(contactInfo).where(eq(contactInfo.platform, platform)).limit(1);
    
    if (existing[0]) {
      const result = await db.update(contactInfo)
        .set({ ...info, updatedAt: new Date() })
        .where(eq(contactInfo.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(contactInfo)
        .values({ platform, url: '', ...info })
        .returning();
      return result[0];
    }
  }

  // FAQ methods
  async getFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems)
      .where(eq(faqItems.isActive, true))
      .orderBy(faqItems.order);
  }

  async getAllFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems)
      .orderBy(faqItems.order);
  }

  async createFaqItem(item: any): Promise<FaqItem> {
    const result = await db.insert(faqItems).values(item).returning();
    return result[0];
  }

  async updateFaqItem(id: string, item: any): Promise<FaqItem | undefined> {
    const result = await db.update(faqItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(faqItems.id, id))
      .returning();
    return result[0];
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    try {
      await db.delete(faqItems).where(eq(faqItems.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      return false;
    }
  }
}

// Use database storage if DATABASE_URL is available, otherwise use memory storage
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
