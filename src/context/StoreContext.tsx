import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Product,
  CartItem,
  Neighborhood,
  Order,
  StoreSettings,
  FilterState,
  PetSpecies,
  ProductCategory,
  BannerSlide,
  CustomCategory,
  SiteBenefit,
  PartnerBrand,
  MenuItem,
  SiteAppearance,
  WhatsAppTemplateSettings,
  StoreLocation,
  ClinicService,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_NEIGHBORHOODS } from '../data/initialData';
import { STORE_SETTINGS, STORE_LOCATIONS } from '../data/stores';
import { INITIAL_SERVICES } from '../data/initialServices';
import {
  INITIAL_BANNERS,
  INITIAL_CUSTOM_CATEGORIES,
  INITIAL_BENEFITS,
  INITIAL_BRANDS,
  INITIAL_MENU_ITEMS,
  INITIAL_APPEARANCE,
  INITIAL_WHATSAPP_SETTINGS,
} from '../data/initialSiteData';
import { getEffectiveProductPricing } from '../utils/pricing';
import { normalizeBannerSlides, reconcileBannerSlides } from '../utils/bannerResolver';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToBanners,
  subscribeToBrands,
  subscribeToBenefits,
  subscribeToLocations,
  subscribeToNeighborhoods,
  subscribeToMenuItems,
  subscribeToServices,
  subscribeToConfigDocs,
  subscribeToOrders,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveBannerToFirestore,
  deleteBannerFromFirestore,
  saveBrandToFirestore,
  deleteBrandFromFirestore,
  saveBenefitToFirestore,
  deleteBenefitFromFirestore,
  saveLocationToFirestore,
  deleteLocationFromFirestore,
  saveNeighborhoodToFirestore,
  deleteNeighborhoodFromFirestore,
  saveMenuItemToFirestore,
  deleteMenuItemFromFirestore,
  saveServiceToFirestore,
  deleteServiceFromFirestore,
  saveSettingsToFirestore,
  saveAppearanceToFirestore,
  saveWhatsAppSettingsToFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  migrateAllStoreDataToFirestore,
  checkFirestoreHasData,
} from '../services/firestoreService';
import {
  subscribeToAdminAuth,
  signInWithEmail,
  signInWithGoogle,
  logoutFirebase,
} from '../services/authService';
import { isFirebaseConfigured, auth } from '../services/firebase';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  // Products & Catalog
  products: Product[];
  activeProducts: Product[];
  offersProducts: Product[];
  bestSellerProducts: Product[];
  featuredProducts: Product[];
  neighborhoods: Neighborhood[];
  settings: StoreSettings;
  banners: BannerSlide[];
  activeBanners: BannerSlide[];
  customCategories: CustomCategory[];
  activeCategories: CustomCategory[];
  benefits: SiteBenefit[];
  activeBenefits: SiteBenefit[];
  brands: PartnerBrand[];
  activeBrands: PartnerBrand[];
  menuItems: MenuItem[];
  activeMenuItems: MenuItem[];
  appearance: SiteAppearance;
  whatsappSettings: WhatsAppTemplateSettings;
  storeLocations: StoreLocation[];
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  freeDeliveryRemaining: number;
  selectedNeighborhoodId: string;
  setSelectedNeighborhoodId: (id: string) => void;
  addToCart: (product: Product, variationId?: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, variationId: string | undefined, deltaOrQty: number, isAbsolute?: boolean) => void;
  removeFromCart: (productId: string, variationId?: string) => void;
  clearCart: () => void;
  getCartItemQuantity: (productId: string, variationId?: string) => number;
  
  // UI States & Auth
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  adminUser: User | null;
  adminEmail: string;
  loginAdminWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  isStoreLocationsOpen: boolean;
  setIsStoreLocationsOpen: (open: boolean) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (p: Product | null) => void;
  zoomedImage: { src: string; alt: string; title?: string } | null;
  setZoomedImage: (img: { src: string; alt: string; title?: string } | null) => void;
  
  // Cloud Sync
  firebaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  syncDataToFirestore: () => Promise<{ success: boolean; totalItems: number; error?: string }>;

  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setSearchQuery: (query: string) => void;
  setSpeciesFilter: (species: PetSpecies | 'all') => void;
  setCategoryFilter: (cat: ProductCategory | 'all') => void;
  resetFilters: () => void;
  
  // Orders & Persistence
  orders: Order[];
  saveOrder: (order: Order) => void;
  repeatOrder: (orderId: string) => { success: boolean; unavailableCount: number; message: string };
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
  
  // Admin Operations - Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  
  // Admin Operations - Categories
  addCustomCategory: (c: Omit<CustomCategory, 'id'>) => void;
  updateCustomCategory: (c: CustomCategory) => void;
  deleteCustomCategory: (id: string) => void;
  toggleCustomCategoryActive: (id: string) => void;

  // Admin Operations - Banners
  addBanner: (b: Omit<BannerSlide, 'id'>) => void;
  updateBanner: (b: BannerSlide) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;

  // Admin Operations - Benefits
  addBenefit: (b: Omit<SiteBenefit, 'id'>) => void;
  updateBenefit: (b: SiteBenefit) => void;
  deleteBenefit: (id: string) => void;
  toggleBenefitActive: (id: string) => void;

  // Admin Operations - Brands
  addBrand: (b: Omit<PartnerBrand, 'id'>) => void;
  updateBrand: (b: PartnerBrand) => void;
  deleteBrand: (id: string) => void;
  toggleBrandActive: (id: string) => void;

  // Admin Operations - Menu
  addMenuItem: (m: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (m: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemActive: (id: string) => void;

  // Admin Operations - Services & Clinic 24h
  services: ClinicService[];
  addService: (s: Omit<ClinicService, 'id'>) => void;
  updateService: (s: ClinicService) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;

  // Admin Operations - Locations
  addStoreLocation: (loc: Omit<StoreLocation, 'id'>) => void;
  updateStoreLocation: (loc: StoreLocation) => void;
  deleteStoreLocation: (id: string) => void;

  // Admin Operations - Delivery
  addNeighborhood: (n: Omit<Neighborhood, 'id'>) => void;
  updateNeighborhood: (n: Neighborhood) => void;
  deleteNeighborhood: (id: string) => void;
  toggleNeighborhoodActive: (id: string) => void;

  // Admin Operations - Settings & Identity
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateAppearance: (newApp: Partial<SiteAppearance>) => void;
  updateWhatsAppSettings: (ws: Partial<WhatsAppTemplateSettings>) => void;
  resetToDefaults: () => void;
  exportBackupData: () => string;
  importBackupData: (jsonStr: string) => boolean;
  
  // Notifications
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'pets_family_cart_v1',
  SELECTED_NEIGHBORHOOD: 'pets_family_selected_neighborhood_v1',
  SERVICES: 'pets_family_services_v1',
};

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  species: 'all',
  category: 'all',
  brand: 'all',
  minPrice: 0,
  maxPrice: 500,
  onlyOffers: false,
  onlyInStock: false,
  age: 'all',
  size: 'all',
  sortBy: 'relevance',
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helper to safely load from local storage
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Erro ao carregar chave ${key}:`, e);
    }
    return fallback;
  };

  // Clean up any legacy product or settings caches from localStorage on boot
  useEffect(() => {
    try {
      localStorage.removeItem('pets_casa_cache_products_v2');
      localStorage.removeItem('pets_casa_cache_settings_v2');
      localStorage.removeItem('pets_casa_products');
      localStorage.removeItem('pets_casa_settings');
      localStorage.removeItem('pets_casa_cart_v2');
      localStorage.removeItem('pets_casa_selected_neighborhood_v2');
      localStorage.removeItem('pets_casa_banners');
      localStorage.removeItem('pets_casa_brands');
      localStorage.removeItem('pets_casa_benefits');
    } catch {}
  }, []);

  // Sync state
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');

  // Products: initialized with clean Pet's Family products, synchronized with Firestore
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Services: Pet's Family specialized services (Clínica 24h, Banho & Tosa, etc.)
  const [services, setServices] = useState<ClinicService[]>(() =>
    loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES)
  );

  // Neighborhoods
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(INITIAL_NEIGHBORHOODS);

  // Store settings
  const [settings, setSettings] = useState<StoreSettings>(STORE_SETTINGS);

  // Banners
  const [banners, setBanners] = useState<BannerSlide[]>(INITIAL_BANNERS);

  // Custom Categories
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(INITIAL_CUSTOM_CATEGORIES);

  // Benefits
  const [benefits, setBenefits] = useState<SiteBenefit[]>(INITIAL_BENEFITS);

  // Brands
  const [brands, setBrands] = useState<PartnerBrand[]>(INITIAL_BRANDS);

  // Menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  // Appearance & Identity
  const [appearance, setAppearance] = useState<SiteAppearance>(INITIAL_APPEARANCE);

  // WhatsApp Templates
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppTemplateSettings>(INITIAL_WHATSAPP_SETTINGS);

  // Store Locations
  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>(STORE_LOCATIONS);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadLocal(STORAGE_KEYS.CART, [])
  );

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Selected neighborhood
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_NEIGHBORHOOD);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return INITIAL_NEIGHBORHOODS[0]?.id || '';
  });

  // Filters state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoreLocationsOpen, setIsStoreLocationsOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string; title?: string } | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // =========================================================================
  // FIREBASE AUTHENTICATION
  // =========================================================================
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');

  useEffect(() => {
    const unsubscribe = subscribeToAdminAuth((user, isAdmin) => {
      setAdminUser(user);
      setIsAdminAuthenticated(isAdmin);
      setAdminEmail(user?.email || '');
    });
    return () => unsubscribe();
  }, []);

  const loginAdminWithEmail = async (email: string, pass: string) => {
    try {
      const user = await signInWithEmail(email, pass);
      setIsAdminAuthenticated(true);
      setAdminUser(user);
      setAdminEmail(user.email || '');
      showToast('Acesso administrativo autorizado com sucesso!', 'success');
      return { success: true };
    } catch (err: any) {
      let errorMsg = 'E-mail ou senha incorretos.';
      if (err.code === 'auth/unauthorized-admin' || err.message?.includes('não possui')) {
        errorMsg = 'Acesso não autorizado. Esta conta não possui privilégios de administrador.';
      } else if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-email'
      ) {
        errorMsg = 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Muitas tentativas consecutivas. Aguarde alguns instantes.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      console.warn('[AUTH LOGIN ATTEMPT]', errorMsg, err?.code);
      return { success: false, error: errorMsg, code: err?.code };
    }
  };

  const loginAdminWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      setIsAdminAuthenticated(true);
      setAdminUser(user);
      setAdminEmail(user.email || '');
      showToast('Login realizado com sucesso!', 'success');
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-admin' || err?.message?.includes('não possui')) {
        return {
          success: false,
          code: 'auth/unauthorized-admin',
          error: 'Acesso não autorizado. A conta Google informada não possui privilégios de administrador.',
        };
      }
      if (err?.code === 'auth/unauthorized-domain') {
        console.warn('[AUTH GOOGLE] Domínio não autorizado no Firebase Console:', window.location.hostname);
        return {
          success: false,
          code: 'auth/unauthorized-domain',
          domain: err.domain || window.location.hostname,
          error: `O domínio atual (${window.location.hostname}) precisa ser adicionado aos Domínios Autorizados no Firebase Console para usar o Login com Google.`,
        };
      }
      if (err?.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          code: 'auth/popup-closed-by-user',
          error: 'A janela de autenticação foi fechada antes de concluir o login.',
        };
      }
      console.warn('[AUTH GOOGLE LOGIN]', err?.message || err);
      return { success: false, error: err?.message || 'Falha ao autenticar com Google.', code: err?.code };
    }
  };

  const logoutAdmin = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Logout Firebase:', e);
    }
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    setAdminEmail('');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Route listener
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin') {
        setIsAdminOpen(true);
      }
    };

    handleLocationCheck();
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  // =========================================================================
  // REAL-TIME FIRESTORE SUBSCRIPTIONS
  // =========================================================================
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseSyncStatus('offline');
      return;
    }

    setFirebaseSyncStatus('syncing');

    // 1. Products: Direct realtime subscription from Firestore /products
    const unsubProducts = subscribeToProducts(
      (cloudProducts) => {
        const parsedProducts: Product[] = (cloudProducts || [])
          .filter((p) => {
            const n = (p.name || '').toLowerCase();
            const b = (p.brand || '').toLowerCase();
            const d = (p.description || '').toLowerCase();
            return !n.includes('dogmil') && !b.includes('dogmil') && !d.includes('dogmil');
          })
          .map((p) => ({
            ...p,
            price: Number(p.price) || 0,
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
            stock: p.stock !== undefined ? Number(p.stock) : 10,
            active: p.active !== false,
            variations: Array.isArray(p.variations) && p.variations.length > 0
              ? p.variations.map((v) => ({
                  ...v,
                  price: Number(v.price) || 0,
                  originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
                  stock: v.stock !== undefined ? Number(v.stock) : 10,
                }))
              : undefined,
          }));

        // Se Firestore tiver produtos, utiliza a fonte remota; caso vazio, mantém INITIAL_PRODUCTS
        if (parsedProducts && parsedProducts.length > 0) {
          setProducts(parsedProducts);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }

        // Trace detalhado de cada documento recebido do Firestore
        parsedProducts.forEach((p) => {
          const pricing = getEffectiveProductPricing(p);
          console.log('[TRACE STORE PRODUCT]', {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            isPromo: p.isPromo,
            variations: p.variations,
            effectivePrice: pricing.effectivePrice,
            effectiveOriginalPrice: pricing.effectiveOriginalPrice,
          });
        });

        console.log('[STORE PRODUCTS UPDATED]', {
          totalProducts: parsedProducts.length,
          products: parsedProducts.map((p) => ({
            productId: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            variations: p.variations,
          })),
        });

        // Reconciliação direta por ID para o Modal de Detalhes
        setSelectedProductForModal((prevModalProd) => {
          if (!prevModalProd) return null;
          const updated = parsedProducts.find((p) => p.id === prevModalProd.id);
          return updated || null;
        });

        // Reconciliação direta dos preços dos itens no Carrinho
        setCart((prevCart) =>
          prevCart.map((item) => {
            const updatedProd = parsedProducts.find((p) => p.id === item.productId);
            if (!updatedProd) return item;
            const pricing = getEffectiveProductPricing(updatedProd, item.variationId);
            return {
              ...item,
              product: updatedProd,
              unitPrice: pricing.effectivePrice,
              variationName: pricing.selectedVariation?.name || item.variationName,
            };
          })
        );

        setFirebaseSyncStatus('synced');
      },
      (err) => {
        console.warn('[Firestore] Erro ao sincronizar produtos em tempo real:', err);
        setFirebaseSyncStatus('error');
      }
    );

    // 2. Categories
    const unsubCategories = subscribeToCategories((cloudCats) => {
      if (cloudCats && cloudCats.length > 0) {
        const sanitizedCats = cloudCats.filter(
          (c) =>
            !c.label?.toLowerCase().includes('dogmil') &&
            !c.sublabel?.toLowerCase().includes('dogmil')
        );
        setCustomCategories(sanitizedCats);
      }
    });

    // 3. Banners
    const unsubBanners = subscribeToBanners((cloudBanners) => {
      setBanners((prev) => reconcileBannerSlides(cloudBanners, prev));
    });

    // 4. Brands
    const unsubBrands = subscribeToBrands((cloudBrands) => {
      if (cloudBrands && cloudBrands.length > 0) {
        const defaultFeaturedMap: Record<string, { logoUrl: string; order: number }> = {
          golden: {
            logoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
            order: 1,
          },
          magnus: {
            logoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop&q=80',
            order: 2,
          },
          'fórmula natural': {
            logoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80',
            order: 3,
          },
          'formula natural': {
            logoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80',
            order: 3,
          },
        };

        const sanitizedBrands = cloudBrands
          .filter((b) => !b.name?.toLowerCase().includes('dogmil'))
          .map((b) => {
            const key = (b.name || '').trim().toLowerCase();
            const def = defaultFeaturedMap[key];
            if (def && b.featured === undefined) {
              return {
                ...b,
                featured: true,
                logoUrl: b.logoUrl || def.logoUrl,
              };
            }
            return b;
          });
        setBrands(sanitizedBrands);
      }
    });

    // 5. Benefits
    const unsubBenefits = subscribeToBenefits((cloudBenefits) => {
      if (cloudBenefits && cloudBenefits.length > 0) {
        const sanitizedBenefits = cloudBenefits.map((b) => {
          const searchable = `${b.title || ''} ${b.description || ''} ${b.id || ''}`.toLowerCase();
          const isLegacyStoreBenefit =
            searchable.includes('3 loja') ||
            searchable.includes('lojas físicas') ||
            searchable.includes('lojas fisicas') ||
            searchable.includes('eliana') ||
            searchable.includes('pedras') ||
            searchable.includes('cocaia') ||
            searchable.includes('pedro escobar') ||
            searchable.includes('carlos barbosa') ||
            searchable.includes('portela') ||
            b.id === 'ben-3' && (b.iconName === 'Store' || b.actionType === 'stores');

          if (isLegacyStoreBenefit) {
            return {
              ...b,
              title: 'Nossa Loja Física',
              description: 'Av. Dona Belmira Marin, 3618 - Loja 1 - Grajaú, São Paulo - SP, 04846-000',
              iconName: 'Store',
              iconColor: 'text-blue-600 bg-blue-50',
              actionType: 'stores' as const,
              active: true,
            };
          }
          return b;
        });
        setBenefits(sanitizedBenefits);
      } else {
        setBenefits(INITIAL_BENEFITS);
      }
    });

    // 6. Locations: Enforce single official Pet's Family store (Av. Dona Belmira Marin, 3618 - Loja 1)
    const unsubLocations = subscribeToLocations(() => {
      // Pet's Family has strictly ONE store: Av. Dona Belmira Marin, 3618 - Loja 1 - Grajaú, SP, 04846-000
      setStoreLocations(STORE_LOCATIONS);
    });

    // 7. Neighborhoods
    const unsubNeighborhoods = subscribeToNeighborhoods((cloudNeighborhoods) => {
      if (cloudNeighborhoods && cloudNeighborhoods.length > 0) {
        setNeighborhoods(cloudNeighborhoods);
      }
    });

    // 8. Menu Items
    const unsubMenuItems = subscribeToMenuItems((cloudMenu) => {
      if (cloudMenu && cloudMenu.length > 0) {
        setMenuItems(cloudMenu);
      }
    });

    // 8.5 Services: Never allow "Todos os Serviços" and enforce official messages
    const unsubServices = subscribeToServices((cloudServices) => {
      if (cloudServices && cloudServices.length > 0) {
        const validServices = cloudServices
          .filter((s) => s.id !== 'all' && s.title !== 'Todos os Serviços')
          .map((s) => {
            if (s.category === 'banho_tosa' || s.title?.toLowerCase().includes('banho')) {
              return {
                ...s,
                whatsappDefaultMessage: 'Quero agendar Banho e Tosa sou cliente do instagram',
              };
            }
            if (s.category === 'clinica' || s.title?.toLowerCase().includes('clínica') || s.title?.toLowerCase().includes('clinica')) {
              return {
                ...s,
                whatsappDefaultMessage: 'Olá! Sou cliente do Instagram e preciso de atendimento na Clínica Veterinária 24h.',
              };
            }
            if (s.category === 'petshop' || s.title?.toLowerCase().includes('pet shop')) {
              return {
                ...s,
                whatsappDefaultMessage: 'Olá! Sou cliente do Instagram e gostaria de informações sobre produtos e atendimento do Pet Shop.',
              };
            }
            if (s.category === 'entrega' || s.title?.toLowerCase().includes('entrega')) {
              return {
                ...s,
                whatsappDefaultMessage: 'Olá! Sou cliente do Instagram e gostaria de informações sobre entrega na região.',
              };
            }
            return s;
          });

        if (validServices.length > 0) {
          setServices(validServices.sort((a, b) => (a.order || 0) - (b.order || 0)));
        } else {
          setServices(INITIAL_SERVICES);
        }
      }
    });

    // 9. Config Docs: Protect against legacy Firestore documents overriding Pet's Family
    const unsubConfig = subscribeToConfigDocs(({ settings: s, appearance: a, whatsapp: w }) => {
      if (s) {
        const isLegacySettings =
          s.primaryWhatsapp?.includes('94624') ||
          s.storeName?.toLowerCase().includes('casa de rações') ||
          s.announcementText?.includes('94624') ||
          s.pixKey?.includes('94624') ||
          s.address?.includes('3610') ||
          s.address?.toLowerCase().includes('carlos barbosa');

        if (isLegacySettings) {
          setSettings({
            ...STORE_SETTINGS,
            ...s,
            storeName: "Pet's Family",
            primaryWhatsapp: '5511975158424',
            primaryWhatsappDisplay: '(11) 97515-8424',
            primaryPhone: '(11) 2495-0511',
            address: 'Av. Dona Belmira Marin, 3618 - Loja 1',
            cep: '04846-000',
            city: 'São Paulo - SP',
            serviceRegion: 'Grajaú e Apurá — São Paulo/SP',
            instagram: 'familypet1',
            linktree: 'familypet1',
            pixKey: '11975158424',
            pixKeyType: 'Celular (WhatsApp)',
            pixReceiverName: "Pet's Family Clínica Veterinária",
            announcementText: "🐾 Pet's Family — Clínica Veterinária 24h • Banho & Tosa • Pet Shop • Entrega em Grajaú e Apurá!",
            slogan: 'Clínica Veterinária 24 Horas • Pet Shop • Banho & Tosa • Entrega na Região',
          });
        } else {
          setSettings({
            ...STORE_SETTINGS,
            ...s,
            primaryWhatsapp: s.primaryWhatsapp && !s.primaryWhatsapp.includes('94624') ? s.primaryWhatsapp : '5511975158424',
            address: s.address && !s.address.includes('3610') && !s.address.toLowerCase().includes('carlos barbosa') ? s.address : 'Av. Dona Belmira Marin, 3618 - Loja 1',
            cep: s.cep && !s.cep.includes('04846-010') ? s.cep : '04846-000',
          });
        }
      }
      if (a) setAppearance(a);
      if (w) {
        const isLegacyWhatsapp =
          w.primaryNumber?.includes('94624') ||
          w.defaultContactMessage?.toLowerCase().includes('casa de rações');

        if (isLegacyWhatsapp) {
          setWhatsappSettings({
            ...INITIAL_WHATSAPP_SETTINGS,
            primaryNumber: '5511975158424',
            secondaryNumber: '',
            defaultContactMessage: 'Cliente do Instagram. Tenhos Dúvidas ',
          });
        } else {
          setWhatsappSettings({
            ...INITIAL_WHATSAPP_SETTINGS,
            ...w,
            primaryNumber: w.primaryNumber && !w.primaryNumber.includes('94624') ? w.primaryNumber : '5511975158424',
          });
        }
      }
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBanners();
      unsubBrands();
      unsubBenefits();
      unsubLocations();
      unsubNeighborhoods();
      unsubMenuItems();
      unsubServices();
      unsubConfig();
    };
  }, []);

  // 10. Orders & Admin Sync: Only subscribe when admin is authenticated in Firebase Auth
  useEffect(() => {
    if (!isFirebaseConfigured() || !isAdminAuthenticated || !adminUser) {
      return;
    }

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders) {
        // Sort orders newest first
        const sorted = [...cloudOrders].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setOrders(sorted);
      }
    });

    return () => {
      unsubOrders();
    };
  }, [isAdminAuthenticated, adminUser]);

  // Save Cart to LocalStorage (User-specific session data)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Erro ao persistir carrinho:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_NEIGHBORHOOD, selectedNeighborhoodId);
    } catch (e) {
      console.warn('Erro ao persistir bairro selecionado:', e);
    }
  }, [selectedNeighborhoodId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.warn('Erro ao persistir serviços:', e);
    }
  }, [services]);

  // Derived Active Lists
  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);
  const offersProducts = useMemo(() => activeProducts.filter((p) => p.isPromo || (p.originalPrice && p.originalPrice > p.price)), [activeProducts]);
  const bestSellerProducts = useMemo(() => activeProducts.filter((p) => p.isBestSeller), [activeProducts]);
  const featuredProducts = useMemo(() => activeProducts.filter((p) => p.isNewArrival || p.isBestSeller || p.isPromo), [activeProducts]);
  
  const activeBanners = useMemo(() => banners.filter((b) => b.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)), [banners]);
  const activeCategories = useMemo(() => customCategories.filter((c) => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)), [customCategories]);
  const activeBenefits = useMemo(() => benefits.filter((b) => b.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)), [benefits]);
  const activeBrands = useMemo(() => brands.filter((b) => b.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)), [brands]);
  const activeMenuItems = useMemo(() => menuItems.filter((m) => m.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)), [menuItems]);

  // Calculations
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0), [cart]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (settings.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold) {
      return 0;
    }
    const found = neighborhoods.find((n) => n.id === selectedNeighborhoodId);
    return found ? found.fee : 5.0;
  }, [subtotal, settings.freeDeliveryThreshold, neighborhoods, selectedNeighborhoodId]);

  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  const freeDeliveryRemaining = useMemo(() => {
    if (!settings.freeDeliveryThreshold) return 0;
    const rem = settings.freeDeliveryThreshold - subtotal;
    return rem > 0 ? rem : 0;
  }, [settings.freeDeliveryThreshold, subtotal]);

  // Cart operations
  const addToCart = (product: Product, variationId?: string, quantity = 1) => {
    const pricing = getEffectiveProductPricing(product, variationId);
    const unitPrice = pricing.effectivePrice;
    const variationName = pricing.selectedVariation?.name;
    const safeQty = Math.max(1, Math.round(quantity));

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variationId === variationId
      );

      const maxStock = variationId && product.variations
        ? (product.variations.find((v) => v.id === variationId)?.stock ?? product.stock)
        : product.stock;

      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = Math.min(maxStock, item.quantity + safeQty);

        return prev.map((it, idx) => {
          if (idx !== existingIndex) return it;
          return {
            ...it,
            quantity: newQty,
          };
        });
      } else {
        const finalQty = Math.min(maxStock, safeQty);
        return [
          ...prev,
          {
            productId: product.id,
            product,
            variationId,
            variationName,
            quantity: finalQty,
            unitPrice,
          },
        ];
      }
    });

    showToast(`${product.name} adicionado ao carrinho!`, 'success');
  };

  const updateCartQuantity = (
    productId: string,
    variationId: string | undefined,
    deltaOrQty: number,
    isAbsolute = false
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === productId && item.variationId === variationId
      );
      if (existingIndex === -1) return prev;

      const item = prev[existingIndex];
      const maxStock = variationId && item.product.variations
        ? (item.product.variations.find((v) => v.id === variationId)?.stock ?? item.product.stock)
        : item.product.stock;

      const step = Math.round(deltaOrQty);
      const calculatedQty = isAbsolute ? step : item.quantity + step;

      if (calculatedQty <= 0) {
        return prev.filter((_, idx) => idx !== existingIndex);
      }

      const newQty = Math.min(maxStock, calculatedQty);

      return prev.map((it, idx) => {
        if (idx !== existingIndex) return it;
        return {
          ...it,
          quantity: newQty,
        };
      });
    });
  };

  const removeFromCart = (productId: string, variationId?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variationId === variationId))
    );
    showToast('Item removido do carrinho.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartItemQuantity = (productId: string, variationId?: string) => {
    const matching = cart.filter(
      (item) => item.productId === productId && (variationId ? item.variationId === variationId : true)
    );
    return matching.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Filters
  const setSearchQuery = (query: string) => setFilters((prev) => ({ ...prev, searchQuery: query }));
  const setSpeciesFilter = (species: PetSpecies | 'all') => setFilters((prev) => ({ ...prev, species }));
  const setCategoryFilter = (category: ProductCategory | 'all') => setFilters((prev) => ({ ...prev, category }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Orders
  const saveOrder = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    try {
      await saveOrderToFirestore(order);
    } catch (err) {
      console.warn('Erro ao salvar pedido no Firestore:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      await updateOrderStatusInFirestore(orderId, status);
      showToast('Status do pedido atualizado no Firestore!', 'success');
    } catch (err) {
      console.warn('Erro ao atualizar status no Firestore:', err);
      showToast('Status do pedido atualizado!', 'success');
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await deleteOrderFromFirestore(orderId);
      showToast('Pedido removido.', 'info');
    } catch (err) {
      console.warn('Erro ao remover pedido no Firestore:', err);
    }
  };

  const clearAllOrders = () => {
    orders.forEach((o) => deleteOrder(o.id));
    setOrders([]);
    showToast('Histórico de pedidos limpo.', 'info');
  };

  const repeatOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, unavailableCount: 0, message: 'Pedido não encontrado.' };
    }

    let addedCount = 0;
    let unavailableCount = 0;
    const newCartItems: CartItem[] = [];

    order.items.forEach((item) => {
      const currentProduct = products.find((p) => p.id === item.productId && p.active !== false);
      if (!currentProduct || currentProduct.stock <= 0) {
        unavailableCount++;
        return;
      }

      let unitPrice = currentProduct.price;
      let variationName = item.variationName;

      if (item.variationId && currentProduct.variations) {
        const v = currentProduct.variations.find((varItem) => varItem.id === item.variationId);
        if (v && v.stock > 0) {
          unitPrice = v.price;
          variationName = v.name;
        } else if (v && v.stock <= 0) {
          unavailableCount++;
          return;
        }
      }

      newCartItems.push({
        productId: currentProduct.id,
        product: currentProduct,
        variationId: item.variationId,
        variationName,
        quantity: Math.min(item.quantity, currentProduct.stock),
        unitPrice,
      });
      addedCount++;
    });

    if (newCartItems.length > 0) {
      setCart(newCartItems);
      if (order.customer.neighborhoodId) {
        setSelectedNeighborhoodId(order.customer.neighborhoodId);
      }
      setIsCartOpen(true);
      const msg = unavailableCount > 0
        ? `Pedido recarregado com ${addedCount} itens! (${unavailableCount} indisponíveis no momento).`
        : `Todos os itens do pedido anterior foram adicionados com os preços atualizados!`;
      showToast(msg, 'success');
      return { success: true, unavailableCount, message: msg };
    } else {
      showToast('Nenhum dos produtos desse pedido está disponível no momento.', 'warning');
      return { success: false, unavailableCount, message: 'Itens indisponíveis.' };
    }
  };

  // Product Actions
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      active: productData.active ?? true,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
    };
    try {
      await saveProductToFirestore(newProduct);
      setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newId)]);
      showToast('Novo produto salvo no Firestore!', 'success');
      return newProduct;
    } catch (e: any) {
      console.error('Erro ao salvar produto no Firestore:', e);
      showToast(`Erro ao salvar no Firestore: ${e?.message || 'Falha de gravação'}`, 'error');
      throw e;
    }
  };

  const updateProduct = async (updated: Product) => {
    try {
      await saveProductToFirestore(updated);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setCart((prev) =>
        prev.map((item) =>
          item.productId === updated.id
            ? { ...item, product: updated, unitPrice: updated.price }
            : item
        )
      );
      showToast('Produto salvo com sucesso no Firestore!', 'success');
    } catch (e: any) {
      console.error('Erro ao atualizar produto no Firestore:', e);
      showToast(`Erro ao gravar no Firestore: ${e?.message || 'Permissão negada'}`, 'error');
      throw e;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteProductFromFirestore(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((item) => item.productId !== id));
      setSelectedProductForModal((prev) => (prev?.id === id ? null : prev));
    } catch (e: any) {
      console.error('[FIRESTORE DELETE ERROR]', {
        collection: 'products',
        documentId: id,
        error: e,
      });
      throw e;
    }
  };

  const duplicateProduct = async (id: string) => {
    const orig = products.find((p) => p.id === id);
    if (!orig) return;
    const duplicated: Product = {
      ...orig,
      id: `prod-${Date.now()}`,
      name: `${orig.name} (Cópia)`,
      active: true,
    };
    try {
      await saveProductToFirestore(duplicated);
      setProducts((prev) => [duplicated, ...prev]);
      showToast(`Produto duplicado e salvo no Firestore!`, 'success');
    } catch (e: any) {
      console.error('Erro ao duplicar produto no Firestore:', e);
      showToast(`Erro ao salvar cópia no Firestore: ${e?.message || 'Falha'}`, 'error');
    }
  };

  const toggleProductActive = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const updated = { ...prod, active: !prod.active };
    try {
      await saveProductToFirestore(updated);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Status do produto alterado.', 'info');
    } catch (e: any) {
      console.error('Erro ao alterar status do produto:', e);
      showToast(`Erro ao alterar status: ${e?.message || 'Falha'}`, 'error');
    }
  };

  // Category Actions
  const addCustomCategory = async (data: Omit<CustomCategory, 'id'>) => {
    const newCat: CustomCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      active: data.active ?? true,
      order: data.order || customCategories.length + 1,
    };
    setCustomCategories((prev) => [...prev, newCat]);
    try {
      await saveCategoryToFirestore(newCat);
      showToast('Nova categoria salva no Firestore!', 'success');
    } catch (e) {
      showToast('Nova categoria cadastrada!', 'success');
    }
  };

  const updateCustomCategory = async (updated: CustomCategory) => {
    setCustomCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await saveCategoryToFirestore(updated);
      showToast('Categoria atualizada no Firestore!', 'success');
    } catch (e) {
      showToast('Categoria atualizada!', 'success');
    }
  };

  const deleteCustomCategory = async (id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCategoryFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Categoria removida.', 'info');
  };

  const toggleCustomCategoryActive = async (id: string) => {
    const cat = customCategories.find((c) => c.id === id);
    if (!cat) return;
    const updated = { ...cat, active: !cat.active };
    setCustomCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    try {
      await saveCategoryToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
  };

  // Banner Actions
  const addBanner = async (data: Omit<BannerSlide, 'id'>) => {
    const newBanner: BannerSlide = {
      ...data,
      id: `banner-${Date.now()}`,
      active: data.active ?? true,
      order: data.order || banners.length + 1,
    };
    setBanners((prev) => [...prev, newBanner]);
    try {
      await saveBannerToFirestore(newBanner);
      showToast('Novo banner salvo no Firestore!', 'success');
    } catch (e) {
      showToast('Novo banner adicionado!', 'success');
    }
  };

  const updateBanner = async (updated: BannerSlide) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      await saveBannerToFirestore(updated);
      showToast('Banner atualizado no Firestore!', 'success');
    } catch (e) {
      showToast('Banner atualizado!', 'success');
    }
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBannerFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Banner removido.', 'info');
  };

  const toggleBannerActive = async (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (!banner) return;
    const updated = { ...banner, active: !banner.active };
    setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
    try {
      await saveBannerToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
  };

  // Benefit Actions
  const addBenefit = async (data: Omit<SiteBenefit, 'id'>) => {
    const newBenefit: SiteBenefit = {
      ...data,
      id: `ben-${Date.now()}`,
      active: data.active ?? true,
      order: data.order || benefits.length + 1,
    };
    setBenefits((prev) => [...prev, newBenefit]);
    try {
      await saveBenefitToFirestore(newBenefit);
      showToast('Novo benefício salvo no Firestore!', 'success');
    } catch (e) {
      showToast('Novo benefício adicionado!', 'success');
    }
  };

  const updateBenefit = async (updated: SiteBenefit) => {
    setBenefits((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      await saveBenefitToFirestore(updated);
      showToast('Benefício atualizado no Firestore!', 'success');
    } catch (e) {
      showToast('Benefício atualizado!', 'success');
    }
  };

  const deleteBenefit = async (id: string) => {
    setBenefits((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBenefitFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Benefício removido.', 'info');
  };

  const toggleBenefitActive = async (id: string) => {
    const benefit = benefits.find((b) => b.id === id);
    if (!benefit) return;
    const updated = { ...benefit, active: !benefit.active };
    setBenefits((prev) => prev.map((b) => (b.id === id ? updated : b)));
    try {
      await saveBenefitToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
  };

  // Brand Actions
  const addBrand = async (data: Omit<PartnerBrand, 'id'>) => {
    const newBrand: PartnerBrand = {
      ...data,
      id: `brand-${Date.now()}`,
      active: data.active ?? true,
      order: data.order || brands.length + 1,
    };
    setBrands((prev) => [...prev, newBrand]);
    try {
      await saveBrandToFirestore(newBrand);
      showToast('Marca salva no Firestore!', 'success');
    } catch (e) {
      showToast('Marca adicionada!', 'success');
    }
  };

  const updateBrand = async (updated: PartnerBrand) => {
    setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      await saveBrandToFirestore(updated);
      showToast('Marca atualizada no Firestore!', 'success');
    } catch (e) {
      showToast('Marca atualizada!', 'success');
    }
  };

  const deleteBrand = async (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBrandFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Marca removida.', 'info');
  };

  const toggleBrandActive = async (id: string) => {
    const brand = brands.find((b) => b.id === id);
    if (!brand) return;
    const updated = { ...brand, active: !brand.active };
    setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
    try {
      await saveBrandToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
  };

  // Menu Actions
  const addMenuItem = async (data: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...data,
      id: `menu-${Date.now()}`,
      active: data.active ?? true,
      order: data.order || menuItems.length + 1,
    };
    setMenuItems((prev) => [...prev, newItem]);
    try {
      await saveMenuItemToFirestore(newItem);
    } catch (e) {
      console.warn(e);
    }
    showToast('Item de menu adicionado!', 'success');
  };

  const updateMenuItem = async (updated: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    try {
      await saveMenuItemToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
    showToast('Menu atualizado!', 'success');
  };

  const deleteMenuItem = async (id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMenuItemFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Item de menu removido.', 'info');
  };

  const toggleMenuItemActive = async (id: string) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    const updated = { ...item, active: !item.active };
    setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
    try {
      await saveMenuItemToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
  };

  // Services Actions
  const addService = async (data: Omit<ClinicService, 'id'>) => {
    const newService: ClinicService = {
      ...data,
      id: `service-${Date.now()}`,
      active: data.active ?? true,
      order: data.order || services.length + 1,
    };
    setServices((prev) => [...prev, newService]);
    try {
      await saveServiceToFirestore(newService);
    } catch (e) {
      console.warn(e);
    }
    showToast('Serviço adicionado!', 'success');
  };

  const updateService = async (updated: ClinicService) => {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    try {
      await saveServiceToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
    showToast('Serviço atualizado!', 'success');
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteServiceFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Serviço removido.', 'info');
  };

  const toggleServiceActive = async (id: string) => {
    const item = services.find((s) => s.id === id);
    if (!item) return;
    const updated = { ...item, active: !item.active };
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    try {
      await saveServiceToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
  };

  // Location Actions
  const addStoreLocation = async (data: Omit<StoreLocation, 'id'>) => {
    const newLoc: StoreLocation = {
      ...data,
      id: `store-${Date.now()}`,
    };
    setStoreLocations((prev) => [...prev, newLoc]);
    try {
      await saveLocationToFirestore(newLoc);
      showToast('Unidade física salva no Firestore!', 'success');
    } catch (e) {
      showToast('Unidade física adicionada!', 'success');
    }
  };

  const updateStoreLocation = async (updated: StoreLocation) => {
    setStoreLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    try {
      await saveLocationToFirestore(updated);
      showToast('Unidade atualizada no Firestore!', 'success');
    } catch (e) {
      showToast('Unidade física atualizada!', 'success');
    }
  };

  const deleteStoreLocation = async (id: string) => {
    setStoreLocations((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteLocationFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Unidade removida.', 'info');
  };

  // Neighborhood Actions
  const addNeighborhood = async (data: Omit<Neighborhood, 'id'>) => {
    const newId = `b-${Date.now()}`;
    const newNeighborhood: Neighborhood = { ...data, id: newId, active: true };
    setNeighborhoods((prev) => [...prev, newNeighborhood]);
    try {
      await saveNeighborhoodToFirestore(newNeighborhood);
      showToast('Bairro salvo no Firestore!', 'success');
    } catch (e) {
      showToast('Bairro de entrega adicionado!', 'success');
    }
  };

  const updateNeighborhood = async (updated: Neighborhood) => {
    setNeighborhoods((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    try {
      await saveNeighborhoodToFirestore(updated);
      showToast('Taxa e bairro atualizados no Firestore!', 'success');
    } catch (e) {
      showToast('Taxa e bairro atualizados com sucesso!', 'success');
    }
  };

  const deleteNeighborhood = async (id: string) => {
    setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNeighborhoodFromFirestore(id);
    } catch (e) {
      console.warn(e);
    }
    showToast('Bairro removido.', 'info');
  };

  const toggleNeighborhoodActive = async (id: string) => {
    const n = neighborhoods.find((item) => item.id === id);
    if (!n) return;
    const updated = { ...n, active: !n.active };
    setNeighborhoods((prev) => prev.map((item) => (item.id === id ? updated : item)));
    try {
      await saveNeighborhoodToFirestore(updated);
    } catch (e) {
      console.warn(e);
    }
  };

  // Settings & Identity
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await saveSettingsToFirestore(updated);
      showToast('Configurações salvas no Firestore!', 'success');
    } catch (e) {
      showToast('Configurações da loja salvas com sucesso!', 'success');
    }
  };

  const updateAppearance = async (newApp: Partial<SiteAppearance>) => {
    const updated = { ...appearance, ...newApp };
    setAppearance(updated);
    try {
      await saveAppearanceToFirestore(updated);
      showToast('Identidade salva no Firestore!', 'success');
    } catch (e) {
      showToast('Aparência e identidade salvas com sucesso!', 'success');
    }
  };

  const updateWhatsAppSettings = async (ws: Partial<WhatsAppTemplateSettings>) => {
    const updated = { ...whatsappSettings, ...ws };
    setWhatsappSettings(updated);
    try {
      await saveWhatsAppSettingsToFirestore(updated);
      showToast('Configurações do WhatsApp salvas no Firestore!', 'success');
    } catch (e) {
      showToast('Configurações do WhatsApp atualizadas!', 'success');
    }
  };

  const resetToDefaults = async () => {
    setProducts(INITIAL_PRODUCTS);
    setNeighborhoods(INITIAL_NEIGHBORHOODS);
    setSettings(STORE_SETTINGS);
    setBanners(INITIAL_BANNERS);
    setCustomCategories(INITIAL_CUSTOM_CATEGORIES);
    setBenefits(INITIAL_BENEFITS);
    setBrands(INITIAL_BRANDS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setServices(INITIAL_SERVICES);
    setAppearance(INITIAL_APPEARANCE);
    setWhatsappSettings(INITIAL_WHATSAPP_SETTINGS);
    setStoreLocations(STORE_LOCATIONS);

    try {
      await migrateAllStoreDataToFirestore({
        products: INITIAL_PRODUCTS,
        neighborhoods: INITIAL_NEIGHBORHOODS,
        settings: STORE_SETTINGS,
        banners: INITIAL_BANNERS,
        customCategories: INITIAL_CUSTOM_CATEGORIES,
        benefits: INITIAL_BENEFITS,
        brands: INITIAL_BRANDS,
        menuItems: INITIAL_MENU_ITEMS,
        services: INITIAL_SERVICES,
        appearance: INITIAL_APPEARANCE,
        whatsappSettings: INITIAL_WHATSAPP_SETTINGS,
        storeLocations: STORE_LOCATIONS,
      });
      showToast('Dados de fábrica sincronizados no Firestore!', 'info');
    } catch (e) {
      showToast('Dados restaurados para os padrões originais!', 'info');
    }
  };

  const syncDataToFirestore = async () => {
    setFirebaseSyncStatus('syncing');
    const res = await migrateAllStoreDataToFirestore({
      products,
      neighborhoods,
      settings,
      banners,
      customCategories,
      benefits,
      brands,
      menuItems,
      services,
      appearance,
      whatsappSettings,
      storeLocations,
    });

    if (res.success) {
      setFirebaseSyncStatus('synced');
      showToast(`${res.totalItems} registros sincronizados com o Firestore!`, 'success');
    } else {
      setFirebaseSyncStatus('error');
      showToast(`Erro na sincronização: ${res.error}`, 'error');
    }
    return res;
  };

  const exportBackupData = (): string => {
    const backupObj = {
      version: '3.0-firebase',
      exportedAt: new Date().toISOString(),
      products,
      neighborhoods,
      settings,
      banners,
      customCategories,
      benefits,
      brands,
      menuItems,
      services,
      appearance,
      whatsappSettings,
      storeLocations,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importBackupData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.neighborhoods && Array.isArray(data.neighborhoods)) setNeighborhoods(data.neighborhoods);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      if (data.banners && Array.isArray(data.banners)) setBanners(data.banners);
      if (data.customCategories && Array.isArray(data.customCategories)) setCustomCategories(data.customCategories);
      if (data.benefits && Array.isArray(data.benefits)) setBenefits(data.benefits);
      if (data.brands && Array.isArray(data.brands)) setBrands(data.brands);
      if (data.menuItems && Array.isArray(data.menuItems)) setMenuItems(data.menuItems);
      if (data.services && Array.isArray(data.services)) setServices(data.services);
      if (data.appearance) setAppearance((prev) => ({ ...prev, ...data.appearance }));
      if (data.whatsappSettings) setWhatsappSettings((prev) => ({ ...prev, ...data.whatsappSettings }));
      if (data.storeLocations && Array.isArray(data.storeLocations)) setStoreLocations(data.storeLocations);

      // Also sync imported data to Firestore in background
      migrateAllStoreDataToFirestore({
        products: data.products || products,
        neighborhoods: data.neighborhoods || neighborhoods,
        settings: data.settings || settings,
        banners: data.banners || banners,
        customCategories: data.customCategories || customCategories,
        benefits: data.benefits || benefits,
        brands: data.brands || brands,
        menuItems: data.menuItems || menuItems,
        services: data.services || services,
        appearance: data.appearance || appearance,
        whatsappSettings: data.whatsappSettings || whatsappSettings,
        storeLocations: data.storeLocations || storeLocations,
      }).catch(console.warn);

      showToast('Backup importado e sincronizado no Firestore!', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Erro ao importar backup: arquivo JSON inválido.', 'error');
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        activeProducts,
        offersProducts,
        bestSellerProducts,
        featuredProducts,
        neighborhoods,
        settings,
        banners,
        activeBanners,
        customCategories,
        activeCategories,
        benefits,
        activeBenefits,
        brands,
        activeBrands,
        menuItems,
        activeMenuItems,
        appearance,
        whatsappSettings,
        storeLocations,
        cart,
        cartCount,
        subtotal,
        deliveryFee,
        total,
        freeDeliveryRemaining,
        selectedNeighborhoodId,
        setSelectedNeighborhoodId,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getCartItemQuantity,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        isAdminOpen,
        setIsAdminOpen,
        isAdminAuthenticated,
        adminUser,
        adminEmail,
        loginAdminWithEmail,
        loginAdminWithGoogle,
        logoutAdmin,
        firebaseSyncStatus,
        syncDataToFirestore,
        isStoreLocationsOpen,
        setIsStoreLocationsOpen,
        selectedProductForModal,
        setSelectedProductForModal,
        zoomedImage,
        setZoomedImage,
        filters,
        setFilters,
        setSearchQuery,
        setSpeciesFilter,
        setCategoryFilter,
        resetFilters,
        orders,
        saveOrder,
        repeatOrder,
        updateOrderStatus,
        deleteOrder,
        clearAllOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductActive,
        addCustomCategory,
        updateCustomCategory,
        deleteCustomCategory,
        toggleCustomCategoryActive,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        addBenefit,
        updateBenefit,
        deleteBenefit,
        toggleBenefitActive,
        addBrand,
        updateBrand,
        deleteBrand,
        toggleBrandActive,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemActive,
        services,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        addStoreLocation,
        updateStoreLocation,
        deleteStoreLocation,
        addNeighborhood,
        updateNeighborhood,
        deleteNeighborhood,
        toggleNeighborhoodActive,
        updateSettings,
        updateAppearance,
        updateWhatsAppSettings,
        resetToDefaults,
        exportBackupData,
        importBackupData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
