import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Package,
  Tag,
  ImageIcon,
  ShieldCheck,
  Award,
  Menu as MenuIcon,
  Truck,
  ShoppingBag,
  Store,
  Palette,
  Settings,
  FileJson,
  KeyRound,
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AdminProductsTab } from './admin/AdminProductsTab';
import { AdminServicesTab } from './admin/AdminServicesTab';
import { AdminCategoriesTab } from './admin/AdminCategoriesTab';
import { AdminBannersTab } from './admin/AdminBannersTab';
import { AdminBenefitsTab } from './admin/AdminBenefitsTab';
import { AdminBrandsTab } from './admin/AdminBrandsTab';
import { AdminMenuTab } from './admin/AdminMenuTab';
import { AdminDeliveryTab } from './admin/AdminDeliveryTab';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminLocationsTab } from './admin/AdminLocationsTab';
import { AdminIdentityTab } from './admin/AdminIdentityTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';
import { AdminBackupTab } from './admin/AdminBackupTab';

type AdminTab =
  | 'products'
  | 'services'
  | 'categories'
  | 'banners'
  | 'benefits'
  | 'brands'
  | 'menu'
  | 'delivery'
  | 'orders'
  | 'locations'
  | 'identity'
  | 'settings'
  | 'backup';

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    isAdminAuthenticated,
    loginAdminWithEmail,
    logoutAdmin,
    settings,
    orders,
    products,
    services,
    firebaseSyncStatus,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAdminOpen) return null;

  const handleClose = () => {
    setIsAdminOpen(false);
    setEmailInput('');
    setPasswordInput('');
    setLoginError(null);
    if (
      window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin/') ||
      window.location.hash === '#admin'
    ) {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    const cleanPass = passwordInput.trim();
    if (!cleanEmail || !cleanPass) {
      setLoginError('Por favor, informe seu e-mail e senha.');
      return;
    }
    setIsSubmitting(true);
    setLoginError(null);

    const res = await loginAdminWithEmail(cleanEmail, cleanPass);
    if (res.success) {
      setEmailInput('');
      setPasswordInput('');
      setLoginError(null);
      setIsSubmitting(false);
      return;
    }

    setLoginError(res.error || 'E-mail ou senha incorretos.');
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setEmailInput('');
    setPasswordInput('');
    setLoginError(null);
  };

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string }[] = [
    { id: 'products', label: 'Produtos & Estoque', icon: Package, badge: products.length },
    { id: 'services', label: 'Serviços & Clínica 24h', icon: Stethoscope, badge: services.length },
    { id: 'orders', label: 'Pedidos Recebidos', icon: ShoppingBag, badge: orders.filter(o => o.status === 'pending').length || undefined },
    { id: 'categories', label: 'Categorias & Espécies', icon: Tag },
    { id: 'banners', label: 'Banners & Hero', icon: ImageIcon },
    { id: 'benefits', label: 'Barra de Vantagens', icon: ShieldCheck },
    { id: 'brands', label: 'Marcas Parceiras', icon: Award },
    { id: 'menu', label: 'Menu de Navegação', icon: MenuIcon },
    { id: 'delivery', label: 'Entregas & Bairros', icon: Truck },
    { id: 'locations', label: 'Loja Física', icon: Store },
    { id: 'identity', label: 'Identidade & Logos', icon: Palette },
    { id: 'settings', label: 'Dados & WhatsApp', icon: Settings },
    { id: 'backup', label: 'Backup & Firebase', icon: FileJson },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full h-full sm:h-[92vh] max-w-7xl bg-slate-100 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        id="admin-master-panel"
      >
        {/* Top Header Bar */}
        <div className="bg-[#0B2B6D] text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
                Painel Administrativo • {settings.storeName || "Pet's Family"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-slate-200">
              <Cloud className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {firebaseSyncStatus === 'synced'
                  ? 'Firestore Conectado'
                  : firebaseSyncStatus === 'syncing'
                  ? 'Sincronizando...'
                  : 'Modo Local / Cache'}
              </span>
            </div>

            {isAdminAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium text-slate-200">
                  Administrador
                </span>
              </div>
            )}

            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
                title="Encerrar Sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Fechar Painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Guard Screen */}
        {!isAdminAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md space-y-6 text-center"
            >
              <div className="w-14 h-14 bg-blue-50 text-[#0B2B6D] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Acesso Administrativo</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Digite seu e-mail e senha autorizados para gerenciar o catálogo e dados em tempo real.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Digite seu e-mail"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0B2B6D] rounded-xl text-sm outline-none focus:bg-white transition-all font-sans"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Digite sua senha"
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0B2B6D] rounded-xl text-sm outline-none focus:bg-white transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !emailInput || !passwordInput}
                  className="w-full py-3 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <span>Entrar no Painel</span>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                💡 <strong>Acesso com E-mail e Senha:</strong> Você pode acessar o painel digitando seu e-mail e senha cadastrados no formulário acima e clicando em <strong>"Entrar no Painel"</strong>.
              </p>
            </motion.div>
          </div>
        ) : (
          /* Main Authenticated Layout */
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Sidebar */}
            <aside
              className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
                isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`}
            >
              <div className="p-4 space-y-1 overflow-y-auto flex-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-3 py-1 block">
                  Módulos de Gerenciamento
                </span>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0B2B6D] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-tight">
                  <strong className="text-slate-900">Firestore em Tempo Real:</strong> Alterações sincronizadas com todos os clientes.
                </p>
              </div>
            </aside>

            {/* Mobile backdrop */}
            {isMobileSidebarOpen && (
              <div
                className="fixed inset-0 bg-slate-950/40 z-20 lg:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}

            {/* Right Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-100">
              <div className="max-w-5xl mx-auto">
                {activeTab === 'products' && <AdminProductsTab />}
                {activeTab === 'services' && <AdminServicesTab />}
                {activeTab === 'orders' && <AdminOrdersTab />}
                {activeTab === 'categories' && <AdminCategoriesTab />}
                {activeTab === 'banners' && <AdminBannersTab />}
                {activeTab === 'benefits' && <AdminBenefitsTab />}
                {activeTab === 'brands' && <AdminBrandsTab />}
                {activeTab === 'menu' && <AdminMenuTab />}
                {activeTab === 'delivery' && <AdminDeliveryTab />}
                {activeTab === 'locations' && <AdminLocationsTab />}
                {activeTab === 'identity' && <AdminIdentityTab />}
                {activeTab === 'settings' && <AdminSettingsTab />}
                {activeTab === 'backup' && <AdminBackupTab />}
              </div>
            </main>
          </div>
        )}
      </motion.div>
    </div>
  );
};
