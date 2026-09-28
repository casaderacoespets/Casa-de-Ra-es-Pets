import React, { useState } from 'react';
import { Download, Upload, RotateCcw, ShieldAlert, Cloud, RefreshCw, FileJson, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminBackupTab: React.FC = () => {
  const {
    exportBackupData,
    importBackupData,
    resetToDefaults,
    syncDataToFirestore,
    firebaseSyncStatus,
    showToast,
    products,
    banners,
    customCategories,
    neighborhoods,
    orders,
  } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleExportDownload = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_pets_family_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download do backup JSON iniciado!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackupData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncDataToFirestore();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-[#0B2B6D] rounded-xl">
            <Cloud className="w-6 h-6 text-[#0B2B6D]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Banco de Dados Firebase Firestore</h3>
            <p className="text-xs text-slate-500">
              Projeto: <span className="font-mono font-bold text-slate-700">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "pets-family-sp"}</span> • Região: <span className="font-mono font-bold text-slate-700">southamerica-east1</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Forçar Sincronização Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 block font-medium">Status do Firestore</span>
          <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4" />
            {firebaseSyncStatus === 'synced' ? 'Sincronizado' : 'Ativo'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 block font-medium">Produtos no Catálogo</span>
          <span className="text-base font-extrabold text-slate-900 mt-1 block">{products.length} itens</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 block font-medium">Categorias & Banners</span>
          <span className="text-base font-extrabold text-slate-900 mt-1 block">{customCategories.length + banners.length} registros</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 block font-medium">Bairros & Pedidos</span>
          <span className="text-base font-extrabold text-slate-900 mt-1 block">{neighborhoods.length} bairros / {orders.length} pedidos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Exportar Backup Completo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gera um arquivo .json contendo todos os seus produtos, banners, bairros de entrega,
              categorias e configurações atuais do Firestore.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo de Backup</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Restaurar de Arquivo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Selecione um arquivo de backup (.json) exportado anteriormente para restaurar sua loja e sincronizar diretamente no Firestore.
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer border border-dashed border-slate-300">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Selecionar arquivo .JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/60 p-6 rounded-2xl border border-rose-200/80 space-y-4">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>Zona de Restauração de Fábrica</span>
        </div>
        <p className="text-xs text-rose-600 leading-relaxed max-w-2xl">
          Restaura todo o banco de dados do Firestore para os produtos, banners e configurações de demonstração
          originais. Esta ação é irreversível se você não tiver feito um backup antes.
        </p>

        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                'ATENÇÃO: Deseja restaurar todos os produtos e dados para o estado inicial de fábrica no Firestore?'
              )
            ) {
              resetToDefaults();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar Padrões Originais</span>
        </button>
      </div>
    </div>
  );
};
