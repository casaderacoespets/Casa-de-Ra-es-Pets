import React, { useState } from 'react';
import {
  Activity,
  Scissors,
  ShoppingBag,
  Truck,
  Heart,
  Clock,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ClinicService } from '../../types';

export const AdminServicesTab: React.FC = () => {
  const { services, addService, updateService, deleteService, toggleServiceActive } = useStore();
  const [editingService, setEditingService] = useState<Partial<ClinicService> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const handleStartEdit = (service: ClinicService) => {
    setEditingService({ ...service });
    setIsCreating(false);
    setFeatureInput('');
  };

  const handleStartCreate = () => {
    setEditingService({
      title: '',
      category: 'clinica',
      shortDescription: '',
      fullDescription: '',
      badge: '',
      iconName: 'Activity',
      features: [],
      whatsappActionText: 'Falar no WhatsApp',
      whatsappDefaultMessage: "Olá! Gostaria de informações sobre atendimento na Pet's Family.",
      active: true,
      order: (services?.length || 0) + 1,
    });
    setIsCreating(true);
    setFeatureInput('');
  };

  const handleSave = () => {
    if (!editingService || !editingService.title) return;

    if (isCreating) {
      addService({
        title: editingService.title,
        category: editingService.category || 'clinica',
        shortDescription: editingService.shortDescription || '',
        fullDescription: editingService.fullDescription || '',
        badge: editingService.badge || '',
        iconName: editingService.iconName || 'Heart',
        features: editingService.features || [],
        whatsappActionText: editingService.whatsappActionText || 'Falar no WhatsApp',
        whatsappDefaultMessage: editingService.whatsappDefaultMessage || '',
        active: editingService.active ?? true,
        order: editingService.order || 1,
      });
    } else if (editingService.id) {
      updateService(editingService as ClinicService);
    }

    setEditingService(null);
    setIsCreating(false);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim() || !editingService) return;
    const currentFeatures = editingService.features || [];
    setEditingService({
      ...editingService,
      features: [...currentFeatures, featureInput.trim()],
    });
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingService) return;
    const currentFeatures = editingService.features || [];
    setEditingService({
      ...editingService,
      features: currentFeatures.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6" id="admin-services-tab">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Gerenciador de Serviços & Clínica 24h
          </h3>
          <p className="text-xs text-slate-500">
            Cadastre e edite os serviços apresentados no site (Clínica Veterinária, Banho & Tosa, Pet Shop, Entrega na Região).
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md border border-[#D4AF37]/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(services || []).map((service) => (
          <div
            key={service.id}
            className={`p-5 rounded-2xl border transition-all ${
              service.active
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  {service.iconName === 'Scissors' ? (
                    <Scissors className="w-5 h-5" />
                  ) : service.iconName === 'Truck' ? (
                    <Truck className="w-5 h-5" />
                  ) : service.iconName === 'ShoppingBag' ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : (
                    <Activity className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{service.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {service.category}
                    </span>
                    {service.badge && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        • {service.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleServiceActive(service.id)}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    service.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                  title={service.active ? 'Ativo (clique para ocultar)' : 'Oculto (clique para ativar)'}
                >
                  {service.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(service)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteService(service.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3">{service.shortDescription}</p>

            {service.features && service.features.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                {service.features.map((f, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    ✓ {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {isCreating ? 'Novo Serviço' : 'Editar Serviço'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título do Serviço *</label>
                <input
                  type="text"
                  value={editingService.title || ''}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  placeholder="Ex: Clínica Veterinária 24 Horas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={editingService.category || 'clinica'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                  >
                    <option value="clinica">Clínica 24h</option>
                    <option value="banho_tosa">Banho & Tosa</option>
                    <option value="petshop">Pet Shop</option>
                    <option value="entrega">Entrega na Região</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ícone</label>
                  <select
                    value={editingService.iconName || 'Activity'}
                    onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                  >
                    <option value="Activity">Clínica / Saúde (Activity)</option>
                    <option value="Scissors">Banho & Tosa (Scissors)</option>
                    <option value="ShoppingBag">Pet Shop (ShoppingBag)</option>
                    <option value="Truck">Entrega (Truck)</option>
                    <option value="Heart">Cuidado / Amor (Heart)</option>
                    <option value="ShieldCheck">Segurança (ShieldCheck)</option>
                    <option value="Sparkles">Estética (Sparkles)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Selo / Badge em Destaque</label>
                <input
                  type="text"
                  value={editingService.badge || ''}
                  onChange={(e) => setEditingService({ ...editingService, badge: e.target.value })}
                  placeholder="Ex: Plantão 24 Horas, Agendamento, Grajaú e Apurá"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição Curta *</label>
                <textarea
                  rows={3}
                  value={editingService.shortDescription || ''}
                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  placeholder="Resumo do atendimento para exibição no card..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Itens em Destaque (Diferenciais)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Adicionar diferencial (Ex: Atendimento ininterrupto)..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                {editingService.features && editingService.features.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {editingService.features.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span>{f}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(i)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Texto do Botão WhatsApp</label>
                <input
                  type="text"
                  value={editingService.whatsappActionText || ''}
                  onChange={(e) => setEditingService({ ...editingService, whatsappActionText: e.target.value })}
                  placeholder="Ex: Falar com Plantão 24h"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensagem Padrão do WhatsApp</label>
                <textarea
                  rows={2}
                  value={editingService.whatsappDefaultMessage || ''}
                  onChange={(e) => setEditingService({ ...editingService, whatsappDefaultMessage: e.target.value })}
                  placeholder="Ex: Olá! Preciso de atendimento na Clínica Veterinária 24 Horas da Pet's Family."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="service-active-check"
                  checked={editingService.active ?? true}
                  onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="service-active-check" className="font-bold text-slate-800 cursor-pointer">
                  Serviço Ativo e Visível no Site
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md border border-[#D4AF37]/40 cursor-pointer"
              >
                Salvar Serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
