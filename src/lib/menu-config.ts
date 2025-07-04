import {
  Crown,
  Users,
  Box,
  ClipboardList,
  Wallet,
  Tag,
  Ticket,
  ImageIcon,
  Palette,
  CircleDollarSign,
  Settings,
  User,
  Paintbrush,
  AppWindow,
  Globe,
  Lock,
  Workflow,
} from 'lucide-react';

export type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export type MenuGroup = {
  groupLabel: string;
  groupIcon: React.ElementType;
  items: MenuItem[];
};

export const menuConfig: (MenuItem | MenuGroup)[] = [
  {
    groupLabel: 'RUANG OWNER',
    groupIcon: Crown,
    items: [
      { label: 'Kontrol Pesanan', href: '/panel/owner/orders', icon: ClipboardList },
      { label: 'Alur Bot', href: '/panel/owner/bot-flow', icon: Workflow }, // <-- Ditambahkan
      { label: 'Kontrol Produk', href: '/panel/owner/products', icon: Paintbrush },
      { label: 'Kontrol Pengguna', href: '/panel/owner/users', icon: Users },
      { label: 'Kontrol Kapasitas', href: '/panel/owner/capacity', icon: Box },
    ],
  },
  {
    groupLabel: 'RUANG FINANCE',
    groupIcon: Wallet,
    items: [
      { label: 'Promo', href: '/panel/finance/promos', icon: Tag },
      { label: 'Kupon', href: '/panel/finance/coupons', icon: Ticket },
      { label: 'Banner', href: '/panel/finance/banners', icon: ImageIcon },
      { label: 'Refund', href: '/panel/finance/refunds', icon: CircleDollarSign },
    ],
  },
  {
    groupLabel: 'RUANG DESAINER',
    groupIcon: Palette,
    items: [
      { label: 'Brief & Status', href: '/panel/designer/briefs', icon: ClipboardList },
    ],
  },
  {
    groupLabel: 'PENGATURAN',
    groupIcon: Settings,
    items: [
        { label: 'Akun & Keamanan', href: '/panel/settings/account', icon: Lock },
        { label: 'Tampilan', href: '/panel/settings/display', icon: AppWindow },
        { label: 'Integrasi', href: '/panel/settings/integrations', icon: Globe },
    ]
  }
];
