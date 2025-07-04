
import { z } from 'zod';

export type Product = {
  id: string;
  name: string;
  description: string;
  price?: number; // for dynamic display, not stored in DB
  prices: {
    kakiLima: number;
    umkm: number;
    ecommerce: number;
  };
  category: string;
  image: string;
  hint: string;
};

export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'Menunggu Konfirmasi'
  | 'Menunggu Antrian'
  | 'Dalam Pengerjaan'
  | 'Menunggu Pengiriman Draf'
  | 'Menunggu Respon Klien'
  | 'Menunggu Input Revisi'
  | 'G-Meet Terjadwal'
  | 'Menunggu Approval Upgrade'
  | 'Menunggu Revisi Brief'
  | 'Selesai'
  | 'Dibatalkan (Refund Pra-Lunas)'
  | 'Dibatalkan (Refund Pra-DP)'
  | 'Dibatalkan (Refund Pasca-Lunas)'
  | 'Dibatalkan (Refund Pasca-DP)';

export type OrderItemStatus =
  | 'Dalam Pengerjaan'
  | 'Menunggu Respon Klien'
  | 'Revisi'
  | 'Disetujui';

export type Brief = {
  content: string;
  timestamp: Date;
  revisionNumber: number;
}

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  itemStatus: OrderItemStatus;
  budgetTier: 'Kaki Lima' | 'UMKM' | 'E-Commerce';
  briefs: Brief[];
  revisionCount?: number;
  driveLink?: string;
  dimensions?: string;
};


export type Order = {
  id?: string; // Firestore document ID
  orderCode: string;
  customerName: string;
  customerTelegram: string;
  customerPhone: string;
  telegramChatId?: number;
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  paymentMethod: 'LUNAS' | 'DP 50%';
  status: OrderStatus;
  queue?: { week: number; position: number; total: number };
  revisionCount?: number;
  driveFolderUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  couponCode?: string;
  couponDiscount?: number;
  isCancelled?: boolean;
  lastReminderSentAt?: Date;
};

export type UserRole = 'Owner' | 'Admin' | 'Designer';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
};

export type Promo = {
  id: string;
  name: string;
  productId: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  image: string;
};

export type Coupon = {
  id: string;
  code: string;
  name: string;
  discountPercentage: number;
  image: string;
  isActive: boolean;
};

export type Banner = {
  id: string;
  title: string;
  image: string;
  isActive: boolean;
  link: string;
};

export type Refund = {
  id:string;
  orderCode: string;
  refundAmount: number;
  reason: string;
  processedAt: Date;
  processedBy: string;
};

export type TelegramActivity = {
  time: string;
  user: string;
  message: string;
};

export type CartItem = {
  id:string; // Unique ID for this specific item in the cart
  product: Product;
  budgetTier: 'Kaki Lima' | 'UMKM' | 'E-Commerce';
  brief: string;
  driveLink: string;
  dimensions: string;
};

export type AnimatedGradient = {
  duration: number;
  colors: string;
}

export type ThemeColors = {
  background: string;
  primary: string;
  accent: string;
  animatedGradient: AnimatedGradient;
};

export type ThemeSettings = {
  light: ThemeColors;
};

export type CapacitySettings = {
  weekly: number;
  monthly: number;
}

// Added for mobile bottom nav
export type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

// Schemas for analyze-brief-complexity flow
export const AnalyzeBriefComplexityInputSchema = z.object({
  budgetTier: z.enum(['Kaki Lima', 'UMKM', 'E-Commerce'])
    .describe('The budget tier selected by the customer.'),
  designBrief: z
    .string()
    .describe('The design brief provided by the customer.'),
  driveLink: z
    .string()
    .optional()
    .describe('An optional Google Drive link for assets or references provided by the customer. The presence of ANY link is an automatic red flag for the Kaki Lima tier.'),
});
export type AnalyzeBriefComplexityInput = z.infer<typeof AnalyzeBriefComplexityInputSchema>;

export const AnalyzeBriefComplexityOutputSchema = z.object({
  isMatch: z.boolean().describe('Whether the brief complexity is an appropriate match for the selected budget tier.'),
  reasoning: z.string().describe('A concise explanation for the match assessment, addressing the client directly but professionally.'),
  recommendation: z.enum(['Kaki Lima', 'UMKM', 'E-Commerce']).nullable().describe('The recommended budget tier if the current one is not a match. Null if it is a match.'),
});
export type AnalyzeBriefComplexityOutput = z.infer<typeof AnalyzeBriefComplexityOutputSchema>;

// Schemas for suggest-brief-improvement flow
export const SuggestBriefImprovementInputSchema = z.object({
  budgetTier: z.enum(['Kaki Lima', 'UMKM', 'E-Commerce'])
    .describe('Tingkat budget yang dipilih oleh pelanggan.'),
  designBrief: z
    .string()
    .describe('Brief desain yang diberikan oleh pelanggan.'),
  driveLink: z.string().optional().describe('Link Google Drive opsional yang diberikan oleh pelanggan.'),
});
export type SuggestBriefImprovementInput = z.infer<typeof SuggestBriefImprovementInputSchema>;

export const SuggestBriefImprovementOutputSchema = z.object({
  isMatch: z.boolean().describe('Apakah kompleksitas brief sesuai dengan tingkat budget yang dipilih.'),
  reasoning: z.string().describe('Penjelasan singkat untuk penilaian kesesuaian, ditujukan kepada klien secara langsung namun profesional.'),
  suggestion: z.string().describe("Saran yang jelas dan dapat ditindaklanjuti bagi pengguna tentang cara memodifikasi brief mereka agar sesuai dengan tier. Berikan contoh konkret. Misalnya, alih-alih 'Hapus kata-kata kompleks', katakan 'Coba hapus kata `filosofi` dan ganti dengan deskripsi visual yang lebih jelas.'")
});
export type SuggestBriefImprovementOutput = z.infer<typeof SuggestBriefImprovementOutputSchema>;


export const SummarizeDesignBriefInputSchema = z.object({
  designBrief: z.string().describe('Brief desain yang diberikan oleh pelanggan.'),
});
export type SummarizeDesignBriefInput = z.infer<typeof SummarizeDesignBriefInputSchema>;

export const SummarizeDesignBriefOutputSchema = z.object({
  summary: z.string().describe('Ringkasan singkat dari brief desain.'),
});
export type SummarizeDesignBriefOutput = z.infer<typeof SummarizeDesignBriefOutputSchema>;

// Schemas for extract-design-elements flow
export const ExtractDesignElementsInputSchema = z.object({
  designBrief: z.string().describe("The user's design brief."),
});
export type ExtractDesignElementsInput = z.infer<typeof ExtractDesignElementsInputSchema>;

export const ExtractDesignElementsOutputSchema = z.object({
  summary: z.string().describe('A short, bulleted list of the most critical requirements.'),
  colorPalette: z.array(z.string()).describe('An array of 4-5 hex color codes.'),
  imageKeywords: z.array(z.string()).describe('An array of 3-5 keywords for image searching.'),
  suggestedHeadline: z.string().describe('A short, catchy headline suggestion.'),
});
export type ExtractDesignElementsOutput = z.infer<typeof ExtractDesignElementsOutputSchema>;
