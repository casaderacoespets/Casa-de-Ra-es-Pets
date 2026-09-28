import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Power,
  Sparkles,
  Flame,
  Check,
  X,
  Image as ImageIcon,
  Tag,
  Package,
  Layers,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, PetSpecies, ProductCategory, ProductVariation } from '../../types';
import { auth } from '../../services/firebase';
import { compressImage } from '../../utils/imageCompressor';

export const AdminProductsTab: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    toggleProductActive,
    customCategories,
    showToast,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Variations local state
  const [variationsList, setVariationsList] = useState<ProductVariation[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarOriginalPrice, setNewVarOriginalPrice] = useState('');
  const [newVarStock, setNewVarStock] = useState('10');

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSpecies = selectedSpecies === 'all' || p.species === selectedSpecies;
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && p.active !== false) ||
        (filterStatus === 'inactive' && p.active === false);

      return matchesSearch && matchesSpecies && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedSpecies, selectedCategory, filterStatus]);

  const handleStartCreate = () => {
    setEditingProduct({
      name: '',
      brand: '',
      species: 'caes',
      category: 'racoes',
      price: 0,
      originalPrice: undefined,
      stock: 10,
      unit: 'kg',
      image: '',
      description: '',
      isPromo: false,
      isBestSeller: false,
      isNewArrival: false,
      active: true,
    });
    setVariationsList([]);
    setSaveError(null);
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (p: Product) => {
    console.log('[TRACE ADMIN PRODUCT]', {
      stage: 'ADMIN_START_EDIT',
      productId: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      isPromo: p.isPromo,
      variations: p.variations,
    });
    setEditingProduct({ ...p });
    setVariationsList(p.variations ? p.variations.map((v) => ({ ...v })) : []);
    setSaveError(null);
    setIsNew(false);
    setIsEditing(true);
  };

  const handleDeleteRequest = (prod: Product) => {
    console.log('[ADMIN DELETE REQUEST]', {
      productId: prod.id,
      productName: prod.name,
    });
    setDeleteError(null);
    setProductToDelete(prod);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setProductToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || isDeleting) return;

    console.log('[ADMIN DELETE CONFIRM]', {
      productId: productToDelete.id,
      productName: productToDelete.name,
    });

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteProduct(productToDelete.id);
      console.log('[FIRESTORE DELETE SUCCESS]', {
        collection: 'products',
        documentId: productToDelete.id,
      });
      showToast('Produto excluído com sucesso.', 'success');
      setProductToDelete(null);
    } catch (err: any) {
      console.error('[FIRESTORE DELETE ERROR]', {
        collection: 'products',
        documentId: productToDelete.id,
        code: err?.code || 'unknown',
        message: err?.message || String(err),
      });
      const errorMsg =
        err?.code === 'permission-denied'
          ? 'Permissão negada. O usuário administrativo não possui privilégios para excluir este produto.'
          : 'Não foi possível excluir o produto. Tente novamente.';
      setDeleteError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddVariation = () => {
    if (!newVarName.trim() || !newVarPrice) return;
    const newV: ProductVariation = {
      id: `var-${Date.now()}`,
      name: newVarName.trim(),
      price: Number(newVarPrice) || 0,
      originalPrice: newVarOriginalPrice ? Number(newVarOriginalPrice) : undefined,
      stock: Number(newVarStock) || 10,
    };
    setVariationsList([...variationsList, newV]);
    setNewVarName('');
    setNewVarPrice('');
    setNewVarOriginalPrice('');
    setNewVarStock('10');
  };

  const handleUpdateVariation = (id: string, field: 'name' | 'price' | 'originalPrice' | 'stock', value: any) => {
    setVariationsList((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        if (field === 'price' || field === 'stock' || field === 'originalPrice') {
          const num = value === '' ? undefined : Number(value);
          return { ...v, [field]: num };
        }
        return { ...v, [field]: value };
      })
    );
  };

  const handleRemoveVariation = (id: string) => {
    setVariationsList(variationsList.filter((v) => v.id !== id));
  };

  const handleClearAllVariations = () => {
    setVariationsList([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || editingProduct.price === undefined) return;

    console.log('[FIREBASE AUTH]', {
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    });

    setIsSaving(true);
    setSaveError(null);
    try {
      let finalImage = editingProduct.image?.trim() || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80';
      if (finalImage.startsWith('data:image/') || finalImage.length > 50000) {
        finalImage = await compressImage(finalImage, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
      }

      const baseProduct: Omit<Product, 'id'> = {
        name: editingProduct.name.trim(),
        brand: editingProduct.brand?.trim() || "Pet's Family",
        species: (editingProduct.species as PetSpecies) || 'caes',
        category: (editingProduct.category as ProductCategory) || 'racoes',
        price: Number(editingProduct.price) || 0,
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
        stock: Number(editingProduct.stock ?? 10),
        unit: editingProduct.unit?.trim() || 'un',
        image: finalImage,
        description: editingProduct.description || '',
        isPromo: !!editingProduct.isPromo,
        isBestSeller: !!editingProduct.isBestSeller,
        isNewArrival: !!editingProduct.isNewArrival,
        active: editingProduct.active !== false,
        variations: variationsList.length > 0 ? variationsList.map((v) => ({
          id: v.id,
          name: v.name.trim(),
          price: Number(v.price) || 0,
          originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
          stock: Number(v.stock) || 10,
        })) : undefined,
      };

      console.log('[TRACE ADMIN PRODUCT]', {
        stage: 'BEFORE_SAVE',
        productId: isNew ? 'NEW_GENERATED' : editingProduct.id,
        name: baseProduct.name,
        price: baseProduct.price,
        originalPrice: baseProduct.originalPrice,
        isPromo: baseProduct.isPromo,
        variations: baseProduct.variations,
      });

      if (isNew) {
        await addProduct(baseProduct);
      } else if (editingProduct.id) {
        await updateProduct({
          ...baseProduct,
          id: editingProduct.id,
        });
      }

      console.log('[TRACE ADMIN PRODUCT]', {
        stage: 'AFTER_SAVE_SUCCESS',
        productId: isNew ? 'NEW_GENERATED' : editingProduct.id,
        name: baseProduct.name,
        price: baseProduct.price,
        originalPrice: baseProduct.originalPrice,
        variations: baseProduct.variations,
      });

      setIsEditing(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Erro ao salvar formulário de produto:', err);
      setSaveError(err?.message || 'Falha ao salvar no Firestore. Verifique suas permissões de administrador.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Gerenciamento de Produtos</h3>
            <p className="text-xs text-slate-500">
              {products.length} cadastrados • {products.filter((p) => p.active !== false).length} ativos no catálogo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          id="admin-add-product-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative col-span-1 sm:col-span-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, marca..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0B2B6D]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div>
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white"
          >
            <option value="all">Todas as Espécies</option>
            <option value="caes">Cães 🐶</option>
            <option value="gatos">Gatos 🐱</option>
            <option value="aves">Aves 🐦</option>
            <option value="peixes">Peixes 🐠</option>
            <option value="outros">Outros Pets 🐰</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white"
          >
            <option value="all">Todas as Categorias</option>
            <option value="racoes">Rações</option>
            <option value="petiscos">Petiscos & Bifinhos</option>
            <option value="farmacia">Farmácia & Antipulgas</option>
            <option value="higiene">Higiene & Areias</option>
            <option value="acessorios">Acessórios & Coleiras</option>
            <option value="brinquedos">Brinquedos</option>
            <option value="gaiolas">Gaiolas & Viveiros</option>
            <option value="aquarios-filtros">Aquários & Filtros</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white"
          >
            <option value="all">Status: Todos</option>
            <option value="active">Somente Ativos</option>
            <option value="inactive">Somente Inativos</option>
          </select>
        </div>
      </div>

      {/* Product Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-3">Espécie / Categoria</th>
                <th className="py-3.5 px-3">Preço</th>
                <th className="py-3.5 px-3">Estoque</th>
                <th className="py-3.5 px-3">Destaques</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum produto encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      prod.active === false ? 'opacity-50 bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 max-w-[240px]">
                          <p className="font-bold text-slate-900 truncate leading-tight">{prod.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{prod.brand || 'Sem marca'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 capitalize">{prod.species}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{prod.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {prod.variations && prod.variations.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded inline-block">
                            {prod.variations.length} Variações:
                          </div>
                          <div className="text-xs font-semibold text-slate-800 space-y-0.5">
                            {prod.variations.map((v) => (
                              <div key={v.id} className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-bold text-slate-600">{v.name}:</span>
                                <span className="font-bold text-emerald-700">
                                  {v.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                {v.originalPrice && (
                                  <span className="text-[9px] text-slate-400 line-through">
                                    {v.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Base: {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-slate-900">
                            {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          {prod.originalPrice && (
                            <div className="text-[10px] text-slate-400 line-through">
                              {prod.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          prod.stock > 5
                            ? 'bg-emerald-50 text-emerald-700'
                            : prod.stock > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {prod.stock} un
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {prod.isPromo && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded text-[9px]">
                            Oferta
                          </span>
                        )}
                        {prod.isBestSeller && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px]">
                            Mais Vendido
                          </span>
                        )}
                        {prod.isNewArrival && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[9px]">
                            Novo
                          </span>
                        )}
                        {prod.variations && prod.variations.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 font-bold rounded text-[9px]">
                            {prod.variations.length} Variações
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleProductActive(prod.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          prod.active !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Clique para alternar ativação"
                      >
                        {prod.active !== false ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateProduct(prod.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Duplicar Produto"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(prod)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Produto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(prod)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isEditing && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {isNew ? 'Cadastrar Novo Produto' : 'Editar Produto'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ex: Ração Premier Fórmula Cães Adultos 15kg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca / Fabricante</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="Ex: Premier, Royal Canin, Golden, Whiskas"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Espécie do Animal *</label>
                  <select
                    value={editingProduct.species || 'caes'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, species: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0B2B6D]"
                  >
                    <option value="caes">Cães 🐶</option>
                    <option value="gatos">Gatos 🐱</option>
                    <option value="aves">Aves 🐦</option>
                    <option value="peixes">Peixes 🐠</option>
                    <option value="outros">Outros Roedores / Pets 🐰</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={editingProduct.category || 'racoes'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0B2B6D]"
                  >
                    <option value="racoes">Rações</option>
                    <option value="petiscos">Petiscos & Snacks</option>
                    <option value="farmacia">Farmácia & Medicamentos</option>
                    <option value="higiene">Higiene & Areias</option>
                    <option value="acessorios">Acessórios & Coleiras</option>
                    <option value="brinquedos">Brinquedos</option>
                    <option value="gaiolas">Gaiolas & Viveiros</option>
                    <option value="aquarios-filtros">Aquários & Filtros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade de Medida</label>
                  <input
                    type="text"
                    value={editingProduct.unit || 'kg'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    placeholder="Ex: kg, un, pacote, frasco"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                {/* Preço e Estoque - Produto sem variações */}
                {variationsList.length === 0 ? (
                  <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Preço e Estoque</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Este produto usa preço único. Esses valores serão exibidos no site.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Preço Único
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Preço Base de Venda (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingProduct.price ?? ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold outline-none focus:border-[#0B2B6D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Preço Original / De (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.originalPrice ?? ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="Opcional para desconto"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-[#0B2B6D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Estoque Disponível
                        </label>
                        <input
                          type="number"
                          value={editingProduct.stock ?? 10}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0B2B6D]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Preço Base - Produto com variações ativas */
                  <div className="sm:col-span-2 p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-purple-950">Preço base do produto</h4>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-full border border-purple-200">
                          Não utilizado quando há variações
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/90 border border-purple-200 rounded-xl text-[11px] text-purple-900 leading-relaxed">
                      <p className="font-semibold flex items-center gap-1.5 text-purple-950">
                        <Info className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        Este produto possui variações de preço. O preço exibido no site é definido individualmente em cada variação abaixo.
                      </p>
                      <p className="text-[10px] text-purple-700 mt-1 font-medium">
                        💡 Este valor NÃO controla os preços das variações.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Preço Base no Cadastro (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingProduct.price ?? ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 font-bold outline-none focus:border-purple-600"
                        />
                        <p className="text-[9px] text-purple-600 font-medium mt-1">
                          Não controla as variações
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Preço Original / De Base (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.originalPrice ?? ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="Opcional"
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-700 outline-none focus:border-purple-600"
                        />
                        <p className="text-[9px] text-purple-600 font-medium mt-1">
                          Configure o preço original em cada variação abaixo
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Estoque Geral do Cadastro
                        </label>
                        <input
                          type="number"
                          value={editingProduct.stock ?? 10}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 outline-none focus:border-purple-600"
                        />
                        <p className="text-[9px] text-purple-600 font-medium mt-1">
                          Estoque específico em cada variação
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Foto do Produto (Selecionar do Dispositivo) *
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {editingProduct.image ? (
                      <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                        <img
                          src={editingProduct.image}
                          alt="Foto do produto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[9px] mt-0.5 font-bold">Sem foto</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0B2B6D] hover:bg-[#081F50] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span>{editingProduct.image ? 'Trocar Foto do Dispositivo' : 'Escolher Foto do Dispositivo'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)
                            if (file.size > MAX_FILE_SIZE_BYTES) {
                              const sizeInMB = (file.size / (1024 * 1024)).toFixed(1).replace('.', ',');
                              showToast(
                                `Imagem muito grande (${sizeInMB} MB). O limite máximo permitido é de 1 MB. Escolha uma imagem menor.`,
                                'error'
                              );
                              e.target.value = '';
                              return;
                            }

                            try {
                              const compressed = await compressImage(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.85 });
                              if (compressed) {
                                setEditingProduct((prev) => (prev ? { ...prev, image: compressed } : prev));
                                showToast('Foto selecionada com sucesso!', 'success');
                              }
                            } catch (err) {
                              console.error('Erro ao processar imagem:', err);
                              showToast('Erro ao processar imagem. Tente outra foto.', 'error');
                            }
                          }}
                        />
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Selecione a imagem salva no seu computador ou celular (máx. 1 MB — JPG, PNG ou WEBP).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Detalhada</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Informe benefícios, composição, modo de uso ou orientações..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                {/* Flags / Badges */}
                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isPromo}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isPromo: e.target.checked })}
                      className="rounded text-[#0B2B6D] w-4 h-4"
                    />
                    <span>Destacar em Promoções</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isBestSeller}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                      className="rounded text-[#0B2B6D] w-4 h-4"
                    />
                    <span>Mais Vendido</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isNewArrival}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                      className="rounded text-[#0B2B6D] w-4 h-4"
                    />
                    <span>Lançamento</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.active !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                      className="rounded text-[#0B2B6D] w-4 h-4"
                    />
                    <span>Ativo na Loja</span>
                  </label>
                </div>
              </div>

              {/* Variations Sub-Section */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-500" />
                        <span>Variações de Peso / Sabor</span>
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {variationsList.length} {variationsList.length === 1 ? 'variação cadastrada' : 'variações cadastradas'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cada variação possui seu próprio preço, preço original e estoque. Esses valores são os utilizados no site quando o cliente seleciona a variação.
                    </p>
                  </div>
                  {variationsList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllVariations}
                      className="self-start sm:self-auto px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-rose-200 shrink-0"
                      title="Remover todas as variações e usar preço único"
                    >
                      Limpar Variações
                    </button>
                  )}
                </div>

                {variationsList.length > 0 && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                    <span className="text-sm">💡</span>
                    <span>Os preços abaixo das variações têm prioridade no site.</span>
                  </div>
                )}

                {/* Lista de Variações Existentes em Cards Individuais */}
                {variationsList.length > 0 && (
                  <div className="space-y-3">
                    {variationsList.map((v, index) => (
                      <div
                        key={v.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-slate-300 transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#0B2B6D] text-white text-[10px] font-extrabold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-extrabold text-slate-800 text-xs">
                              Variação {index + 1}: {v.name || '(Sem nome)'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariation(v.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Remover esta variação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover variação</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Nome da Variação *
                            </label>
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => handleUpdateVariation(v.id, 'name', e.target.value)}
                              placeholder="Ex: 4kg, 12kg, Sabor Frango"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B2B6D]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Preço de Venda (R$) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={v.price}
                              onChange={(e) => handleUpdateVariation(v.id, 'price', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-amber-700 outline-none focus:border-[#0B2B6D]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Preço Original / De (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={v.originalPrice ?? ''}
                              onChange={(e) => handleUpdateVariation(v.id, 'originalPrice', e.target.value)}
                              placeholder="Opcional (De R$)"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-[#0B2B6D]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Estoque da Variação
                            </label>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariation(v.id, 'stock', e.target.value)}
                              placeholder="Estoque"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0B2B6D]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bloco para Adicionar Nova Variação */}
                <div className="p-4 bg-slate-50/60 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                    <Plus className="w-4 h-4 text-[#0B2B6D]" />
                    <span>Adicionar Nova Variação</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Nome / Tamanho *</label>
                      <input
                        type="text"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        placeholder="Ex: 4kg, 12kg Econômico"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0B2B6D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Preço de Venda (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newVarPrice}
                        onChange={(e) => setNewVarPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0B2B6D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Preço Original / De (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newVarOriginalPrice}
                        onChange={(e) => setNewVarOriginalPrice(e.target.value)}
                        placeholder="Opcional"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0B2B6D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Estoque</label>
                      <input
                        type="number"
                        value={newVarStock}
                        onChange={(e) => setNewVarStock(e.target.value)}
                        placeholder="10"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0B2B6D]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddVariation}
                      className="px-4 py-2 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Variação</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Error Notification */}
              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Salvando no Firestore...' : 'Salvar Produto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Excluir produto</h3>
                <p className="text-xs text-slate-500">Tem certeza que deseja excluir o produto?</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="font-extrabold text-slate-900 text-xs line-clamp-2">
                {productToDelete.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span className="font-mono text-[10px]">ID: {productToDelete.id}</span>
                <span>•</span>
                <span className="font-bold text-slate-700">
                  {productToDelete.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Esta ação não pode ser desfeita. O produto será removido permanentemente do catálogo e do Firestore.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleCancelDelete}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Excluindo...' : 'Sim, excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
