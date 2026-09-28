import { BannerSlide } from '../types';
import petsFamilyHeroBanner from '../assets/images/pets_family_hero_1789737334138.jpg';
import { INITIAL_BANNERS } from '../data/initialSiteData';

/**
 * Resolves a banner image URL/path to a robust, loadable asset reference.
 * Handles production Vite assets, Base64 strings, HTTP/HTTPS URLs,
 * and static assets. Always falls back safely to Pet's Family official banner.
 */
export const resolveBannerImage = (image?: string, _bannerId?: string): string => {
  const fallback = petsFamilyHeroBanner;

  if (!image || typeof image !== 'string' || image.trim() === '') {
    return fallback;
  }

  const trimmed = image.trim();

  // 1. If it's a valid Data URL (Base64) or Blob URL, keep it
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 2. If it's an external HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('pets_family_hero') || trimmed.includes('pets_hero_banner')) {
      return petsFamilyHeroBanner;
    }
    return trimmed;
  }

  // 3. Match pets family hero banner
  if (trimmed.includes('pets_family_hero') || trimmed.includes('1789737334138') || trimmed.includes('pets_hero_banner')) {
    return petsFamilyHeroBanner;
  }

  // 4. If it starts with /src/ or /assets/images/ (invalid production paths)
  if (trimmed.startsWith('/src/') || trimmed.startsWith('/assets/images/')) {
    return fallback;
  }

  // 5. If it's already a resolved production asset path (e.g., /assets/pets_...-Ldxs6oEi.jpg)
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('./assets/')) {
    return trimmed;
  }

  return trimmed || fallback;
};

/**
 * Validates whether a banner candidate is genuine, complete, and free of legacy/dogmil content.
 */
export const isValidBannerSlide = (banner: any): banner is BannerSlide => {
  if (!banner || typeof banner !== 'object') return false;
  if (typeof banner.id !== 'string' || !banner.id.trim()) return false;
  if (typeof banner.title !== 'string' || !banner.title.trim()) return false;

  const searchable = `${banner.id} ${banner.title} ${banner.highlightText || ''} ${banner.badge || ''} ${banner.ctaTarget || ''} ${banner.image || ''}`.toLowerCase();

  // Strictly filter out any legacy Dogmil content
  if (searchable.includes('dogmil') || searchable.includes('whey protein') || searchable.includes('30% de proteína')) {
    return false;
  }

  // Filter out obsolete prototype placeholder texts from previous iterations
  if (
    banner.title.includes('Tudo para cuidar de quem faz parte da família') ||
    banner.highlightText?.includes('Mais que uma loja, um lar de carinho')
  ) {
    return false;
  }

  return true;
};

/**
 * Normalizes a single BannerSlide to ensure its image is always a valid asset.
 */
export const normalizeBannerSlide = (banner: BannerSlide): BannerSlide => {
  if (!banner) return banner;
  return {
    ...banner,
    image: resolveBannerImage(banner.image, banner.id),
  };
};

/**
 * Normalizes an array of BannerSlides received from Firestore or local state.
 */
export const normalizeBannerSlides = (banners: BannerSlide[]): BannerSlide[] => {
  if (!banners || !Array.isArray(banners)) return [];
  return banners.map(normalizeBannerSlide);
};

/**
 * Reconciles incoming Firestore banners with current valid banners and canonical INITIAL_BANNERS.
 * Guarantees that:
 * 1. The carousel NEVER collapses to 0 or 1 static banner.
 * 2. Canonical banners (Clínica 24h, Banho & Tosa, Golden/Magnus/Fórmula Natural) are preserved.
 * 3. Legitimate merchant updates from Firestore are merged cleanly.
 * 4. Image paths are permanently resolved to real production assets.
 */
export const reconcileBannerSlides = (
  cloudBanners: BannerSlide[] | null | undefined,
  currentBanners: BannerSlide[] = INITIAL_BANNERS
): BannerSlide[] => {
  // If Firestore provides nothing or empty, keep the current valid banners (or INITIAL_BANNERS)
  if (!cloudBanners || !Array.isArray(cloudBanners) || cloudBanners.length === 0) {
    return currentBanners.length >= 2 ? currentBanners : INITIAL_BANNERS;
  }

  // Filter valid cloud items and normalize asset paths
  const validCloud = cloudBanners
    .filter(isValidBannerSlide)
    .map(normalizeBannerSlide);

  // If all cloud items were invalid (e.g. only legacy Dogmil or obsolete placeholders),
  // preserve the full official set
  if (validCloud.length === 0) {
    return currentBanners.length >= 2 ? currentBanners : INITIAL_BANNERS;
  }

  // Build the merged set starting from canonical INITIAL_BANNERS
  const baseBanners = INITIAL_BANNERS.map(normalizeBannerSlide);
  const cloudMap = new Map<string, BannerSlide>();
  validCloud.forEach((b) => cloudMap.set(b.id, b));

  // Merge canonical banners with any valid cloud updates
  const merged: BannerSlide[] = baseBanners.map((canon) => {
    const cloudVersion = cloudMap.get(canon.id);
    if (cloudVersion) {
      cloudMap.delete(canon.id);
      return {
        ...canon,
        ...cloudVersion,
        image: resolveBannerImage(cloudVersion.image, cloudVersion.id),
        active: cloudVersion.active !== false,
      };
    }
    return canon;
  });

  // Append any valid custom banners created by the merchant in Firestore
  cloudMap.forEach((customBanner) => {
    merged.push(customBanner);
  });

  // Ensure active status and sort by order
  const finalBanners = merged.sort((a, b) => (a.order || 0) - (b.order || 0));

  // If for any reason fewer than 2 banners are active, ensure all canonical banners are active
  const activeCount = finalBanners.filter((b) => b.active !== false).length;
  if (activeCount < 2) {
    return baseBanners;
  }

  return finalBanners;
};

