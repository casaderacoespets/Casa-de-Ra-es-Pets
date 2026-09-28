import React from 'react';
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
