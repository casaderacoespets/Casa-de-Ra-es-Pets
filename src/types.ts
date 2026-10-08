export type PetSpecies = 'caes' | 'gatos' | 'aves' | 'peixes' | 'outros';

export type ProductCategory = 
  | 'racoes'
  | 'petiscos'
  | 'farmacia'
  | 'higiene'
  | 'acessorios'
  | 'brinquedos'
  | 'camas-casinhas'
  | 'aquarios-filtros'
  | 'gaiolas';

export type PetAge = 'filhote' | 'adulto' | 'senior' | 'todas';
export type PetSize = 'pequeno' | 'medio' | 'grande' | 'todos';

export interface ProductVariation {
  id: string;
  name: string; // e.g. "1kg", "3kg", "10.1kg", "15kg", "20kg", "Azul", "Vermelho"
  price: number;
  originalPrice?: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  species: PetSpecies;
  category: ProductCategory;
  subCategory?: string;
  description: string;
  nutritionalInfo?: string;
  usageInstructions?: string;
  price: number;
  originalPrice?: number;
  isPromo?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  image: string;
  secondaryImages?: string[];
  stock: number;
  age?: PetAge;
  size?: PetSize;
  variations?: ProductVariation[];
  unit?: string; // e.g. "15kg", "500g", "Unidade"
  rating?: number;
  reviewCount?: number;
  active: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  variationId?: string;
  variationName?: string;
  quantity: number;
  unitPrice: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  fee: number;
  city: string;
  estimatedTime: string; // e.g. "30-60 min"
  active: boolean;
}

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  whatsapp: string;
  hours: string;
  mapUrl?: string;
  mapsUrl?: string;
  isActive?: boolean;
}

export interface CustomerAddress {
  fullName: string;
  whatsapp: string;
  deliveryType: DeliveryType;
  pickupStoreId?: string;
  neighborhoodId: string;
  street: string;
  number: string;
  complement?: string;
  reference?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  cardBrand?: string; // 'Visa', 'Mastercard', 'Elo', 'Hipercard'
  needsChange?: boolean;
  changeForAmount?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  customer: CustomerAddress;
  payment: PaymentDetails;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  neighborhoodName: string;
  status: 'enviado_whatsapp' | 'confirmado' | 'em_preparo' | 'em_entrega' | 'concluido' | 'cancelado';
  notes?: string;
}

export interface FilterState {
  searchQuery: string;
  species?: PetSpecies | 'all';
  category?: ProductCategory | 'all';
  brand?: string | 'all';
  minPrice?: number;
  maxPrice?: number;
  onlyOffers?: boolean;
  onlyInStock?: boolean;
  age?: PetAge | 'all';
  size?: PetSize | 'all';
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'best_seller' | 'newest' | 'discount';
}

export interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  highlightText: string;
  ctaText: string;
  ctaActionType: 'catalog' | 'whatsapp' | 'brand' | 'category';
  ctaTarget?: string;
  secondaryCta?: string;
  secondaryActionType?: 'catalog' | 'whatsapp' | 'brand' | 'category';
  secondaryTarget?: string;
  image: string;
  bgGradient?: string;
  active: boolean;
  order: number;
}

export interface CustomCategory {
  id: string;
  label: string;
  sublabel: string;
  emoji: string;
  type: 'species' | 'category';
  targetKey: string;
  bgColor: string;
  iconBg: string;
  active: boolean;
  order: number;
}

export interface SiteBenefit {
  id: string;
  iconName: 'Truck' | 'MessageCircle' | 'Store' | 'ShieldCheck' | 'Heart' | 'Clock' | 'Sparkles' | 'Award' | 'Tag' | 'CreditCard' | 'Activity' | 'Scissors';
  title: string;
  description: string;
  iconColor: string;
  actionType: 'none' | 'whatsapp' | 'stores' | 'catalog';
  active: boolean;
  order: number;
}

export interface PartnerBrand {
  id: string;
  name: string;
  logoUrl?: string;
  featured?: boolean;
  active: boolean;
  order: number;
}

export interface MenuItem {
  id: string;
  label: string;
  targetType: 'species' | 'category' | 'offers' | 'stores' | 'whatsapp' | 'catalog' | 'section' | 'external';
  targetValue: string;
  emoji?: string;
  icon?: string;
  type?: 'species' | 'category' | 'offers' | 'stores' | 'whatsapp' | 'catalog' | 'section' | 'external';
  href?: string;
  active: boolean;
  order: number;
}

export interface SiteAppearance {
  primaryColor: string;
  secondaryColor: string;
  customLogoUrl?: string;
  customFooterLogoUrl?: string;
  bannerIntervalSeconds: number;
}

export interface WhatsAppTemplateSettings {
  primaryNumber: string;
  secondaryNumber: string;
  defaultContactMessage: string;
  orderConfirmationNote: string;
}

export interface ClinicService {
  id: string;
  title: string;
  category: 'clinica' | 'banho_tosa' | 'petshop' | 'entrega' | 'outros';
  shortDescription: string;
  fullDescription?: string;
  iconName: 'Activity' | 'Scissors' | 'ShoppingBag' | 'Truck' | 'Heart' | 'Clock' | 'ShieldCheck' | 'Sparkles';
  badge?: string;
  features: string[];
  whatsappActionText: string;
  whatsappDefaultMessage: string;
  active: boolean;
  order: number;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  primaryWhatsapp: string;
  secondaryWhatsapp?: string;
  primaryWhatsappDisplay?: string;
  primaryPhone?: string;
  address?: string;
  cep?: string;
  city?: string;
  serviceRegion?: string;
  instagram: string;
  linktree?: string;
  facebook?: string;
  announcementText: string;
  minOrderValue: number;
  freeDeliveryThreshold?: number;
  pixKey: string;
  pixKeyType: string;
  pixReceiverName: string;
  aboutText?: string;
  copyrightText?: string;
  cnpj?: string;
}


