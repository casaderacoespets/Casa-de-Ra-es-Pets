import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  getDoc,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Product,
  CustomCategory,
  BannerSlide,
  PartnerBrand,
  SiteBenefit,
  StoreLocation,
  Neighborhood,
  MenuItem,
  StoreSettings,
  SiteAppearance,
  WhatsAppTemplateSettings,
  Order,
  ClinicService,
} from '../types';
import { compressImage } from '../utils/imageCompressor';

// ==========================================
// COLLECTION NAMES
// ==========================================
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BANNERS: 'banners',
  BRANDS: 'brands',
  BENEFITS: 'benefits',
  LOCATIONS: 'locations',
  NEIGHBORHOODS: 'neighborhoods',
  MENU_ITEMS: 'menu_items',
  SERVICES: 'services',
  CONFIG: 'config',
  ORDERS: 'orders',
  ADMINS: 'admins',
};

// ==========================================
// REAL-TIME SUBSCRIBERS (onSnapshot)
// ==========================================

export const subscribeToCollection = <T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  if (!db) {
    return () => {};
  }
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as any) } as T);
        });

        if (collectionName === COLLECTIONS.PRODUCTS) {
          console.log('[FIRESTORE PRODUCTS SNAPSHOT]', {
            collection: 'products',
            count: items.length,
            timestamp: new Date().toISOString(),
            products: (items as any[]).map((p) => ({
              productId: p.id,
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice,
              variations: p.variations,
            })),
          });

          (items as any[]).forEach((p) => {
            console.log('[TRACE FIRESTORE PRODUCT]', {
              id: p.id,
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice,
              isPromo: p.isPromo,
              variations: p.variations,
            });
          });
        }

        onData(items);
      },
      (error) => {
        console.warn(`[Firestore] Erro ao sincronizar coleção "${collectionName}":`, error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn(`[Firestore] Falha ao iniciar listener "${collectionName}":`, err);
    if (onError) onError(err);
    return () => {};
  }
};

export const subscribeToProducts = (
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<Product>(COLLECTIONS.PRODUCTS, onData, onError);

export const subscribeToCategories = (
  onData: (categories: CustomCategory[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<CustomCategory>(COLLECTIONS.CATEGORIES, onData, onError);

export const subscribeToBanners = (
  onData: (banners: BannerSlide[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<BannerSlide>(COLLECTIONS.BANNERS, onData, onError);

export const subscribeToBrands = (
  onData: (brands: PartnerBrand[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<PartnerBrand>(COLLECTIONS.BRANDS, onData, onError);

export const subscribeToBenefits = (
  onData: (benefits: SiteBenefit[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<SiteBenefit>(COLLECTIONS.BENEFITS, onData, onError);

export const subscribeToLocations = (
  onData: (locations: StoreLocation[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<StoreLocation>(COLLECTIONS.LOCATIONS, onData, onError);

export const subscribeToNeighborhoods = (
  onData: (neighborhoods: Neighborhood[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<Neighborhood>(COLLECTIONS.NEIGHBORHOODS, onData, onError);

export const subscribeToMenuItems = (
  onData: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<MenuItem>(COLLECTIONS.MENU_ITEMS, onData, onError);

export const subscribeToServices = (
  onData: (services: ClinicService[]) => void,
  onError?: (err: Error) => void
) => subscribeToCollection<ClinicService>(COLLECTIONS.SERVICES, onData, onError);

// Orders
export const subscribeToOrders = (
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
) => {
  if (!auth?.currentUser) {
    return () => {};
  }
  return subscribeToCollection<Order>(COLLECTIONS.ORDERS, onData, onError);
};

export const subscribeToConfigDocs = (
  onData: (config: {
    settings?: StoreSettings;
    appearance?: SiteAppearance;
    whatsapp?: WhatsAppTemplateSettings;
  }) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  if (!db) {
    return () => {};
  }
  try {
    const colRef = collection(db, COLLECTIONS.CONFIG);
    return onSnapshot(
      colRef,
      (snapshot) => {
        let settings: StoreSettings | undefined;
        let appearance: SiteAppearance | undefined;
        let whatsapp: WhatsAppTemplateSettings | undefined;

        snapshot.forEach((d) => {
          if (d.id === 'settings') settings = d.data() as StoreSettings;
          if (d.id === 'appearance') appearance = d.data() as SiteAppearance;
          if (d.id === 'whatsapp') whatsapp = d.data() as WhatsAppTemplateSettings;
        });

        onData({ settings, appearance, whatsapp });
      },
      (err) => {
        console.warn('[Firestore] Erro ao sincronizar configurações:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    return () => {};
  }
};

// ==========================================
// UTILITY: SANITIZE OBJECTS FOR FIRESTORE
// Removes any undefined fields to prevent Firestore serialization errors
// ==========================================
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// ==========================================
// CRUD OPERATIONS (Saves directly to Firestore)
// ==========================================

export const saveProductToFirestore = async (product: Product): Promise<void> => {
  if (!db) {
    const errorMsg = 'Banco de dados Firestore não inicializado.';
    console.error('[FIRESTORE WRITE ERROR]', {
      code: 'uninitialized',
      message: errorMsg,
      collection: COLLECTIONS.PRODUCTS,
      documentId: product.id,
    });
    throw new Error(errorMsg);
  }

  let finalProductImage = product.image || '';
  if (finalProductImage.startsWith('data:image/') || finalProductImage.length > 50000) {
    try {
      finalProductImage = await compressImage(finalProductImage, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
    } catch (e) {
      console.warn('[Firestore] Falha ao comprimir imagem do produto pré-escrita:', e);
    }
  }

  const cleanProductPayload: Record<string, any> = {
    id: product.id,
    name: product.name,
    brand: product.brand || "Pet's Family",
    species: product.species || 'caes',
    category: product.category || 'racoes',
    price: Number(product.price) || 0,
    stock: product.stock !== undefined ? Number(product.stock) : 10,
    unit: product.unit || 'un',
    image: finalProductImage,
    description: product.description || '',
    isPromo: !!product.isPromo,
    isBestSeller: !!product.isBestSeller,
    isNewArrival: !!product.isNewArrival,
    active: product.active !== false,
    updatedAt: new Date().toISOString(),
  };

  if (product.originalPrice !== undefined && product.originalPrice !== null && Number(product.originalPrice) > 0) {
    cleanProductPayload.originalPrice = Number(product.originalPrice);
  } else {
    cleanProductPayload.originalPrice = null;
  }

  if (product.subCategory) cleanProductPayload.subCategory = product.subCategory;
  if (product.nutritionalInfo) cleanProductPayload.nutritionalInfo = product.nutritionalInfo;
  if (product.usageInstructions) cleanProductPayload.usageInstructions = product.usageInstructions;
  if (product.age) cleanProductPayload.age = product.age;
  if (product.size) cleanProductPayload.size = product.size;
  if (product.rating !== undefined) cleanProductPayload.rating = Number(product.rating);
  if (product.reviewCount !== undefined) cleanProductPayload.reviewCount = Number(product.reviewCount);

  if (Array.isArray(product.variations) && product.variations.length > 0) {
    cleanProductPayload.variations = product.variations.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price) || 0,
      originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
      stock: v.stock !== undefined ? Number(v.stock) : 10,
    }));
  } else {
    cleanProductPayload.variations = null;
  }

  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.PRODUCTS,
    documentId: cleanProductPayload.id,
    operation: 'setDoc (authoritative overwrite)',
    data: cleanProductPayload,
  });

  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, cleanProductPayload.id);
    await setDoc(docRef, cleanProductPayload);
    
    console.log('[FIRESTORE WRITE SUCCESS]', {
      collection: 'products',
      productId: cleanProductPayload.id,
      name: cleanProductPayload.name,
      price: cleanProductPayload.price,
      originalPrice: cleanProductPayload.originalPrice,
      variations: cleanProductPayload.variations,
    });

    // Immediate direct read to confirm persistence
    const readSnap = await getDoc(docRef);
    if (!readSnap.exists()) {
      throw new Error(`[Firestore Verification Failed] Documento ${cleanProductPayload.id} não foi encontrado após escrita.`);
    }

    const docData = readSnap.data();
    console.log('[FIRESTORE READ AFTER WRITE]', {
      exists: readSnap.exists(),
      productId: readSnap.id,
      name: docData?.name,
      price: docData?.price,
      originalPrice: docData?.originalPrice,
      variations: docData?.variations,
    });

    // Validar se dados essenciais batem
    if (docData?.price !== cleanProductPayload.price || docData?.name !== cleanProductPayload.name) {
      throw new Error(
        `[Firestore Inconsistency] Dados lidos divergem dos dados gravados. Enviado: ${cleanProductPayload.price}, Gravado: ${docData?.price}`
      );
    }
  } catch (err: any) {
    console.error('[FIRESTORE WRITE ERROR]', {
      code: err?.code || 'unknown',
      message: err?.message || String(err),
      collection: 'products',
      documentId: cleanProductPayload.id,
    });
    throw err;
  }
};

export const deleteProductFromFirestore = async (id: string): Promise<void> => {
  if (!id || typeof id !== 'string') {
    throw new Error('ID do produto inválido para exclusão.');
  }

  if (!db) {
    throw new Error('Banco de dados Firestore não inicializado.');
  }

  console.log('[FIRESTORE DELETE]', {
    collection: 'products',
    documentId: id,
  });

  const docRef = doc(db, 'products', id);

  try {
    await deleteDoc(docRef);

    // Confirmar que o documento realmente não existe mais
    const checkSnap = await getDoc(docRef);
    if (checkSnap.exists()) {
      throw new Error(`[Firestore Delete Failed] O produto ${id} ainda consta no Firestore após deleteDoc.`);
    }

    console.log('[FIRESTORE DELETE SUCCESS]', {
      collection: 'products',
      documentId: id,
    });
  } catch (err: any) {
    console.error('[FIRESTORE DELETE ERROR]', {
      collection: 'products',
      documentId: id,
      code: err?.code || 'unknown',
      message: err?.message || String(err),
    });
    throw err;
  }
};

export const saveCategoryToFirestore = async (category: CustomCategory): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(category);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.CATEGORIES,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.CATEGORIES, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteCategoryFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.CATEGORIES,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await deleteDoc(docRef);
};

export const saveBannerToFirestore = async (banner: BannerSlide): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const payload = { ...banner };
  if (payload.image && (payload.image.startsWith('data:image/') || payload.image.length > 50000)) {
    try {
      payload.image = await compressImage(payload.image, { maxWidth: 1200, maxHeight: 800, quality: 0.82 });
    } catch (e) {
      console.warn('[Firestore] Falha ao comprimir imagem do banner pré-escrita:', e);
    }
  }
  const clean = sanitizeForFirestore(payload);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.BANNERS,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.BANNERS, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteBannerFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.BANNERS,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.BANNERS, id);
  await deleteDoc(docRef);
};

export const saveBrandToFirestore = async (brand: PartnerBrand): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const payload = { ...brand };
  if (payload.logoUrl && (payload.logoUrl.startsWith('data:image/') || payload.logoUrl.length > 50000)) {
    try {
      payload.logoUrl = await compressImage(payload.logoUrl, { maxWidth: 500, maxHeight: 500, quality: 0.85 });
    } catch (e) {
      console.warn('[Firestore] Falha ao comprimir logo da marca pré-escrita:', e);
    }
  }
  const clean = sanitizeForFirestore(payload);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.BRANDS,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.BRANDS, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteBrandFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.BRANDS,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.BRANDS, id);
  await deleteDoc(docRef);
};

export const reconcileBrandsInFirestore = async (
  brandsToSave: PartnerBrand[],
  idsToDelete: string[] = []
): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const batch = writeBatch(db);

  for (const id of idsToDelete) {
    if (id) {
      batch.delete(doc(db, COLLECTIONS.BRANDS, id));
    }
  }

  for (const brand of brandsToSave) {
    const clean = sanitizeForFirestore(brand);
    batch.set(doc(db, COLLECTIONS.BRANDS, clean.id), clean, { merge: true });
  }

  await batch.commit();
};

export const saveBenefitToFirestore = async (benefit: SiteBenefit): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(benefit);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.BENEFITS,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.BENEFITS, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteBenefitFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.BENEFITS,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.BENEFITS, id);
  await deleteDoc(docRef);
};

export const saveLocationToFirestore = async (location: StoreLocation): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(location);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.LOCATIONS,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.LOCATIONS, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteLocationFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.LOCATIONS,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.LOCATIONS, id);
  await deleteDoc(docRef);
};

export const saveNeighborhoodToFirestore = async (neighborhood: Neighborhood): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(neighborhood);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.NEIGHBORHOODS,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.NEIGHBORHOODS, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteNeighborhoodFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.NEIGHBORHOODS,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.NEIGHBORHOODS, id);
  await deleteDoc(docRef);
};

export const saveMenuItemToFirestore = async (item: MenuItem): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(item);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.MENU_ITEMS,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.MENU_ITEMS, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteMenuItemFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.MENU_ITEMS,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
  await deleteDoc(docRef);
};

export const saveServiceToFirestore = async (service: ClinicService): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(service);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.SERVICES,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.SERVICES, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const deleteServiceFromFirestore = async (id: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.SERVICES,
    documentId: id,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.SERVICES, id);
  await deleteDoc(docRef);
};

export const saveSettingsToFirestore = async (settings: StoreSettings): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(settings);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.CONFIG,
    documentId: 'settings',
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.CONFIG, 'settings');
  await setDoc(docRef, clean, { merge: true });
};

export const saveAppearanceToFirestore = async (appearance: SiteAppearance): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const payload = { ...appearance };
  if (payload.customLogoUrl && (payload.customLogoUrl.startsWith('data:image/') || payload.customLogoUrl.length > 50000)) {
    try {
      payload.customLogoUrl = await compressImage(payload.customLogoUrl, { maxWidth: 600, maxHeight: 300, quality: 0.88 });
    } catch (e) {
      console.warn('[Firestore] Falha ao comprimir customLogoUrl pré-escrita:', e);
    }
  }
  if (payload.customFooterLogoUrl && (payload.customFooterLogoUrl.startsWith('data:image/') || payload.customFooterLogoUrl.length > 50000)) {
    try {
      payload.customFooterLogoUrl = await compressImage(payload.customFooterLogoUrl, { maxWidth: 600, maxHeight: 300, quality: 0.88 });
    } catch (e) {
      console.warn('[Firestore] Falha ao comprimir customFooterLogoUrl pré-escrita:', e);
    }
  }
  const clean = sanitizeForFirestore(payload);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.CONFIG,
    documentId: 'appearance',
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.CONFIG, 'appearance');
  await setDoc(docRef, clean, { merge: true });
};

export const saveWhatsAppSettingsToFirestore = async (
  whatsapp: WhatsAppTemplateSettings
): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(whatsapp);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.CONFIG,
    documentId: 'whatsapp',
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.CONFIG, 'whatsapp');
  await setDoc(docRef, clean, { merge: true });
};

// Orders
export const saveOrderToFirestore = async (order: Order): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  const clean = sanitizeForFirestore(order);
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.ORDERS,
    documentId: clean.id,
    operation: 'setDoc',
    data: clean,
  });
  const docRef = doc(db, COLLECTIONS.ORDERS, clean.id);
  await setDoc(docRef, clean, { merge: true });
};

export const updateOrderStatusInFirestore = async (
  orderId: string,
  status: Order['status']
): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.ORDERS,
    documentId: orderId,
    operation: 'updateDoc',
    data: { status },
  });
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await updateDoc(docRef, { status });
};

export const deleteOrderFromFirestore = async (orderId: string): Promise<void> => {
  if (!db) throw new Error('Firestore não inicializado.');
  console.log('[FIRESTORE WRITE]', {
    collection: COLLECTIONS.ORDERS,
    documentId: orderId,
    operation: 'deleteDoc',
  });
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await deleteDoc(docRef);
};

// ==========================================
// MIGRATION & BACKUP UTILS
// ==========================================

export interface FullStoreDataPayload {
  products: Product[];
  neighborhoods: Neighborhood[];
  settings: StoreSettings;
  banners: BannerSlide[];
  customCategories: CustomCategory[];
  benefits: SiteBenefit[];
  brands: PartnerBrand[];
  menuItems: MenuItem[];
  services?: ClinicService[];
  appearance: SiteAppearance;
  whatsappSettings: WhatsAppTemplateSettings;
  storeLocations: StoreLocation[];
}

/**
 * Checks if Firestore has any existing products or settings to avoid accidental overwrites.
 * SAFETY RULE: If an error or doubt occurs, returns true so auto-seed never destroys real data.
 */
export const checkFirestoreHasData = async (): Promise<boolean> => {
  if (!db) return true;
  try {
    const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (!productsSnap.empty) {
      console.log(`[FIRESTORE CHECK] Banco já contém ${productsSnap.size} produto(s). Não requer seed.`);
      return true;
    }
    const settingsDoc = await getDoc(doc(db, COLLECTIONS.CONFIG, 'settings'));
    if (settingsDoc.exists()) {
      console.log('[FIRESTORE CHECK] Documento config/settings já existe. Não requer seed.');
      return true;
    }
    console.log('[FIRESTORE CHECK] Banco de dados vazio detectado. Pronto para receber o catálogo inicial.');
    return false;
  } catch (err: any) {
    console.warn('[FIRESTORE CHECK] Verificação de dados existentes:', err);
    // Return true on error to avoid uncontrolled re-attempts
    return true;
  }
};

/**
 * Safely migrates/seeds all data from local or initial state into Firestore documents.
 */
export const migrateAllStoreDataToFirestore = async (
  data: FullStoreDataPayload
): Promise<{ success: boolean; totalItems: number; error?: string }> => {
  if (!db) {
    return { success: false, totalItems: 0, error: 'Banco de dados Firestore não inicializado.' };
  }
  if (!auth?.currentUser) {
    console.warn('[FIRESTORE SEED BLOCKED] Requer login do administrador no Firebase Auth.');
    return {
      success: false,
      totalItems: 0,
      error: 'Requer autenticação com Firebase Auth para gravar no banco na nuvem.',
    };
  }

  console.log('[FIRESTORE BATCH WRITE START]', {
    productsCount: data.products?.length || 0,
    categoriesCount: data.customCategories?.length || 0,
    bannersCount: data.banners?.length || 0,
    neighborhoodsCount: data.neighborhoods?.length || 0,
  });

  try {
    const batch = writeBatch(db);
    let count = 0;

    // 1. Config Documents
    if (data.settings) {
      batch.set(doc(db, COLLECTIONS.CONFIG, 'settings'), sanitizeForFirestore(data.settings), { merge: true });
      count++;
    }
    if (data.appearance) {
      batch.set(doc(db, COLLECTIONS.CONFIG, 'appearance'), sanitizeForFirestore(data.appearance), { merge: true });
      count++;
    }
    if (data.whatsappSettings) {
      batch.set(doc(db, COLLECTIONS.CONFIG, 'whatsapp'), sanitizeForFirestore(data.whatsappSettings), { merge: true });
      count++;
    }

    // 2. Collections
    (data.products || []).forEach((p) => {
      batch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), sanitizeForFirestore(p), { merge: true });
      count++;
    });

    (data.customCategories || []).forEach((c) => {
      batch.set(doc(db, COLLECTIONS.CATEGORIES, c.id), sanitizeForFirestore(c), { merge: true });
      count++;
    });

    (data.banners || []).forEach((b) => {
      batch.set(doc(db, COLLECTIONS.BANNERS, b.id), sanitizeForFirestore(b), { merge: true });
      count++;
    });

    (data.brands || []).forEach((br) => {
      batch.set(doc(db, COLLECTIONS.BRANDS, br.id), sanitizeForFirestore(br), { merge: true });
      count++;
    });

    (data.benefits || []).forEach((bf) => {
      batch.set(doc(db, COLLECTIONS.BENEFITS, bf.id), sanitizeForFirestore(bf), { merge: true });
      count++;
    });

    (data.storeLocations || []).forEach((loc) => {
      batch.set(doc(db, COLLECTIONS.LOCATIONS, loc.id), sanitizeForFirestore(loc), { merge: true });
      count++;
    });

    (data.neighborhoods || []).forEach((n) => {
      batch.set(doc(db, COLLECTIONS.NEIGHBORHOODS, n.id), sanitizeForFirestore(n), { merge: true });
      count++;
    });

    (data.menuItems || []).forEach((m) => {
      batch.set(doc(db, COLLECTIONS.MENU_ITEMS, m.id), sanitizeForFirestore(m), { merge: true });
      count++;
    });

    (data.services || []).forEach((s) => {
      batch.set(doc(db, COLLECTIONS.SERVICES, s.id), sanitizeForFirestore(s), { merge: true });
      count++;
    });

    await batch.commit();
    console.log(`[FIRESTORE BATCH WRITE SUCCESS] ${count} documentos gravados com sucesso no Firestore!`);
    return { success: true, totalItems: count };
  } catch (err: any) {
    console.error('[FIRESTORE BATCH WRITE ERROR]', err);
    return { success: false, totalItems: 0, error: err?.message || 'Erro desconhecido' };
  }
};
