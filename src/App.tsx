import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BenefitsBar } from './components/BenefitsBar';
import { ServicesSection } from './components/ServicesSection';
import { SpeciesCategoryGrid } from './components/SpeciesCategoryGrid';
import { FeaturedBrandsSection } from './components/FeaturedBrandsSection';
import { ProductSection } from './components/ProductSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { StoreLocationsModal } from './components/StoreLocationsModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ToastContainer } from './components/ToastContainer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ImageZoomModal } from './components/ImageZoomModal';
import { Footer } from './components/Footer';

const SmartScrollButton: React.FC = () => {
  const [isGoingUp, setIsGoingUp] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const getSectionStops = (): number[] => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    if (maxScroll <= 0) return [0];

    const headerEl = document.getElementById('main-header');
    const headerOffset = (headerEl ? headerEl.offsetHeight : 80) + 12;

    const elements = Array.from(
      document.querySelectorAll('main > *, footer')
    ) as HTMLElement[];

    const stops: number[] = [0];

    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.height < 40) continue;

      const rawTop = rect.top + scrollY - headerOffset;
      const stopY = Math.max(0, Math.min(maxScroll, Math.round(rawTop)));

      if (stopY - stops[stops.length - 1] >= 160) {
        stops.push(stopY);
      }
    }

    if (maxScroll - stops[stops.length - 1] >= 100) {
      stops.push(maxScroll);
    } else if (stops.length > 1) {
      stops[stops.length - 1] = maxScroll;
    } else {
      stops.push(maxScroll);
    }

    return stops;
  };

  useEffect(() => {
    const evaluateScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      if (maxScroll <= 0 || scrollY <= 24) {
        setIsGoingUp(false);
      } else if (scrollY >= maxScroll - 40) {
        setIsGoingUp(true);
      }
    };

    evaluateScroll();
    window.addEventListener('scroll', evaluateScroll, { passive: true });
    window.addEventListener('resize', evaluateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', evaluateScroll);
      window.removeEventListener('resize', evaluateScroll);
    };
  }, []);

  const animateScrollTo = (targetY: number, onComplete?: () => void) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const startY = window.scrollY || document.documentElement.scrollTop;
    const distance = targetY - startY;

    if (Math.abs(distance) < 4) {
      onComplete?.();
      return;
    }

    const duration = 850;
    const startTime = performance.now();

    const cancelOnUserInput = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('wheel', cancelOnUserInput);
      window.removeEventListener('touchstart', cancelOnUserInput);
    };

    window.addEventListener('wheel', cancelOnUserInput, { passive: true });
    window.addEventListener('touchstart', cancelOnUserInput, { passive: true });

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
        cleanupListeners();
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const handleToggleScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const stops = getSectionStops();

    if (!isGoingUp) {
      const nextStop =
        stops.find((s) => s > scrollY + 24) ?? maxScroll;
      animateScrollTo(nextStop, () => {
        if (nextStop >= maxScroll - 40) {
          setIsGoingUp(true);
        }
      });
    } else {
      const prevStops = stops.filter((s) => s < scrollY - 24);
      const prevStop =
        prevStops.length > 0 ? prevStops[prevStops.length - 1] : 0;
      animateScrollTo(prevStop, () => {
        if (prevStop <= 24) {
          setIsGoingUp(false);
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleScroll}
      title={isGoingUp ? 'Seção anterior' : 'Próxima seção'}
      aria-label={isGoingUp ? 'Voltar para a seção anterior' : 'Ir para a próxima seção'}
      id="smart-scroll-btn"
      className="fixed bottom-24 right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 hover:bg-slate-900 text-amber-400 border border-amber-400/30 shadow-lg hover:shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer"
    >
      <ArrowDown
        className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
          isGoingUp ? 'rotate-180' : 'rotate-0'
        }`}
      />
    </button>
  );
};

const StoreFront: React.FC = () => {
  const { offersProducts = [], bestSellerProducts = [], activeProducts = [], setFilters } = useStore();

  const pharmacyProducts = (activeProducts || []).filter((p) => p.category === 'farmacia');

  const handleViewAllOffers = () => {
    setFilters((prev) => ({ ...prev, onlyOffers: true, searchQuery: '', species: 'all', category: 'all' }));
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewAllBestSellers = () => {
    setFilters((prev) => ({ ...prev, sortBy: 'best_seller', onlyOffers: false, searchQuery: '' }));
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewAllPharmacy = () => {
    setFilters((prev) => ({ ...prev, category: 'farmacia', species: 'all', onlyOffers: false, searchQuery: '' }));
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Main Header & Navigation */}
      <Header />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* Hero Banner Carousel */}
        <HeroBanner />

        {/* Store Trust & Benefits */}
        <BenefitsBar />

        {/* Pet's Family Specialized Services & 24h Clinic */}
        <ServicesSection />

        {/* Species & Category Grid */}
        <SpeciesCategoryGrid />

        {/* Featured Brands: Golden | Magnus | Fórmula Natural */}
        <FeaturedBrandsSection />

        {/* Special Offers Section */}
        {offersProducts.length > 0 && (
          <ProductSection
            title="Ofertas Imperdíveis"
            subtitle="Descontos especiais selecionados para o seu pet com pronta entrega"
            icon="flame"
            products={offersProducts}
            viewAllAction={handleViewAllOffers}
            id="offers-section"
          />
        )}

        {/* Best Sellers Section */}
        {bestSellerProducts.length > 0 && (
          <ProductSection
            title="Os Mais Vendidos"
            subtitle="Os produtos favoritos e mais recomendados pelos tutores e veterinários"
            icon="sparkles"
            products={bestSellerProducts}
            viewAllAction={handleViewAllBestSellers}
            id="bestsellers-section"
          />
        )}

        {/* Pharmacy & Health Section */}
        {pharmacyProducts.length > 0 && (
          <ProductSection
            title="Farmácia Pet & Antipulgas"
            subtitle="Proteção e cuidados essenciais para a saúde do seu pet com garantia de procedência"
            icon="award"
            products={pharmacyProducts}
            viewAllAction={handleViewAllPharmacy}
            id="pharmacy-section"
          />
        )}

        {/* Complete Interactive Catalog & Filter Engine */}
        <ProductCatalog />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Interactive Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <StoreLocationsModal />
      <OrdersHistoryModal />
      <AdminPanelModal />
      <ToastContainer />
      <SmartScrollButton />
      <FloatingWhatsApp />
      <ImageZoomModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreFront />
    </StoreProvider>
  );
}
