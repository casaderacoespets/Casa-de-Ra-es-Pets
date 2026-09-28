import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Truck,
  Store,
  Phone,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, DeliveryType, Order } from '../types';
import { BrandLogo } from './BrandLogo';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    subtotal,
    deliveryFee: calculatedDeliveryFee,
    total: calculatedTotal,
    neighborhoods,
    selectedNeighborhoodId,
    setSelectedNeighborhoodId,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    saveOrder,
    settings,
    storeLocations,
    showToast,
  } = useStore();

  const activeStores = storeLocations.filter((s) => s.isActive !== false);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [pickupStoreId, setPickupStoreId] = useState(() => activeStores[0]?.id || storeLocations[0]?.id || 'loja-1');

  // Address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardBrand, setCardBrand] = useState('Cartão de Crédito / Débito na Entrega');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeForAmount, setChangeForAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [orderCompleted, setOrderCompleted] = useState<Order | null>(null);

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setOrderCompleted(null);
    setCurrentStep(1);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
  };

  if (!isCheckoutOpen) return null;

  // Selected neighborhood & Delivery calculations
  const selectedNeighborhood = neighborhoods.find((n) => n.id === selectedNeighborhoodId);
  const actualDeliveryFee = deliveryType === 'pickup' ? 0 : calculatedDeliveryFee;
  const isPix = paymentMethod === 'pix';
  const discountAmount = isPix ? subtotal * 0.05 : 0;
  const finalTotal = Math.max(0, subtotal + actualDeliveryFee - discountAmount);

  // Change calculation
  const numericChangeFor = parseFloat(changeForAmount.replace(',', '.')) || 0;
  const changeDue = needsChange && numericChangeFor > finalTotal ? numericChangeFor - finalTotal : 0;

  // Helper formatting for phone
  const handlePhoneChange = (val: string) => {
    // Keep only digits
    const cleaned = val.replace(/\D/g, '').slice(0, 11);
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }
    if (cleaned.length > 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    setWhatsapp(formatted);
  };

  // Validation
  const validateStep1 = () => {
    if (!fullName.trim()) {
      showToast('Por favor, informe seu nome completo.', 'warning');
      return false;
    }
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Por favor, informe um WhatsApp válido com DDD (ex: 11 9XXXX-XXXX).', 'warning');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (deliveryType === 'delivery') {
      if (!selectedNeighborhoodId) {
        showToast('Selecione o bairro de entrega.', 'warning');
        return false;
      }
      if (!street.trim()) {
        showToast('Informe o nome da sua Rua / Avenida.', 'warning');
        return false;
      }
      if (!number.trim()) {
        showToast('Informe o número da residência.', 'warning');
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    if (paymentMethod === 'dinheiro' && needsChange) {
      if (!numericChangeFor || numericChangeFor <= finalTotal) {
        showToast(
          `O valor para troco deve ser maior que o total da compra (${finalTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}).`,
          'warning'
        );
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    showToast('Chave PIX copiada para a área de transferência!', 'success');
    setTimeout(() => setCopiedPix(false), 3000);
  };

  // Final Order Generation & WhatsApp dispatch
  const handleFinishOrder = () => {
    if (isSubmittingRef.current || isSubmitting || orderCompleted) {
      return;
    }
    if (!cart || cart.length === 0) {
      showToast('Seu carrinho está vazio.', 'warning');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const orderNumber = `PCR-${Math.floor(1000 + Math.random() * 9000)}`;
    const pickupStore = storeLocations.find((s) => s.id === pickupStoreId);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      items: [...cart],
      customer: {
        fullName: fullName.trim(),
        whatsapp: whatsapp.trim(),
        deliveryType,
        pickupStoreId: deliveryType === 'pickup' ? pickupStoreId : undefined,
        neighborhoodId: selectedNeighborhoodId,
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        reference: reference.trim(),
      },
      payment: {
        method: paymentMethod,
        cardBrand: paymentMethod.startsWith('cartao') ? cardBrand : undefined,
        needsChange,
        changeForAmount: needsChange ? numericChangeFor : undefined,
      },
      subtotal,
      deliveryFee: actualDeliveryFee,
      discount: discountAmount,
      total: finalTotal,
      neighborhoodName:
        deliveryType === 'pickup'
          ? `Retirada na ${pickupStore?.name}`
          : selectedNeighborhood?.name || 'Região',
      status: 'enviado_whatsapp',
      notes: notes.trim(),
    };

    // Save order
    saveOrder(newOrder);
    setOrderCompleted(newOrder);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Format WhatsApp Message
    const itemsText = cart
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.name}${
            item.variationName ? ` (${item.variationName})` : ''
          } - ${(item.unitPrice * item.quantity).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}`
      )
      .join('\n');

    const paymentMethodLabel = {
      pix: 'PIX (com 5% de desconto)',
      cartao_credito: 'Cartão de Crédito (na entrega)',
      cartao_debito: 'Cartão de Débito (na entrega)',
      dinheiro: 'Dinheiro',
    }[paymentMethod];

    const changeText =
      paymentMethod === 'dinheiro' && needsChange
        ? `\nTroco para: ${numericChangeFor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })} (Troco a levar: ${changeDue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })})`
        : '';

    const addressSection =
      deliveryType === 'pickup'
        ? `📍 RETIRADA EM LOJA:\nUnidade: ${pickupStore?.name}\nEndereço: ${pickupStore?.address}, ${pickupStore?.neighborhood}`
        : `📍 ENDEREÇO DE ENTREGA:\nBairro: ${selectedNeighborhood?.name}\nRua: ${street}\nNúmero: ${number}${
            complement ? `\nComplemento: ${complement}` : ''
          }${reference ? `\nPonto de Referência: ${reference}` : ''}`;

    const whatsappMessage = `*NOVO PEDIDO — ${settings.storeName.toUpperCase()} 🐾*
*Pedido:* #${orderNumber}

👤 *CLIENTE:*
Nome: ${fullName}
WhatsApp: ${whatsapp}

${addressSection}

📦 *PRODUTOS:*
${itemsText}

💰 *VALORES:*
Subtotal: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Entrega: ${
      actualDeliveryFee === 0
        ? 'Grátis'
        : actualDeliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }
${
  discountAmount > 0
    ? `Desconto PIX (5%): -${discountAmount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}\n`
    : ''
}*TOTAL: ${finalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*

💳 *PAGAMENTO:*
Forma: ${paymentMethodLabel}${changeText}
${notes ? `\n📝 *Observações:* ${notes}` : ''}

_Enviado pelo site oficial da ${settings.storeName}_`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const phone = settings.primaryWhatsapp && !settings.primaryWhatsapp.includes('94624') ? settings.primaryWhatsapp : '5511975158424';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    clearCart();
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="checkout-modal-overlay">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => !orderCompleted && handleCloseCheckout()}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
          id="checkout-modal-window"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />
              <div className="hidden sm:block border-l border-slate-300 pl-3">
                <span className="text-xs font-black text-[#0B2B6D] uppercase tracking-wider">
                  Checkout Seguro
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseCheckout}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Fechar checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Indicator (if not completed) */}
          {!orderCompleted && (
            <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold">
                {[
                  { step: 1, label: 'Seus Dados' },
                  { step: 2, label: 'Endereço' },
                  { step: 3, label: 'Pagamento' },
                  { step: 4, label: 'Revisão' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`flex items-center gap-1.5 ${
                      currentStep === s.step
                        ? 'text-[#0B2B6D]'
                        : currentStep > s.step
                        ? 'text-emerald-600'
                        : 'text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                        currentStep === s.step
                          ? 'bg-[#0B2B6D] text-white shadow-sm'
                          : currentStep > s.step
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {currentStep > s.step ? '✓' : s.step}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Contents */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {orderCompleted ? (
              /* ORDER SUCCESS SCREEN */
              <div className="text-center py-6 space-y-4" id="order-completed-view">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Pedido Gerado com Sucesso! 🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    Seu pedido <strong className="text-amber-600">#{orderCompleted.orderNumber}</strong> foi preparado para o WhatsApp da {settings.storeName || "Pet's Family"}.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cliente:</span>
                    <span className="font-bold text-slate-800">{orderCompleted.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total a Pagar:</span>
                    <span className="font-black text-[#0B2B6D]">
                      {orderCompleted.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Forma de Pagamento:</span>
                    <span className="font-bold text-slate-800 uppercase">
                      {orderCompleted.payment.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entrega/Retirada:</span>
                    <span className="font-bold text-slate-800">
                      {orderCompleted.neighborhoodName}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleCloseCheckout}
                    className="px-6 py-3 bg-[#0B2B6D] hover:bg-[#081F50] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Voltar para a Loja
                  </button>
                </div>
              </div>
            ) : currentStep === 1 ? (
              /* STEP 1: SEUS DADOS */
              <div className="space-y-4" id="step-1-dados">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-[#0B2B6D]" />
                  <h3 className="font-black text-base text-slate-900">
                    1. Seus Dados de Contato
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-[#0B2B6D] focus:ring-1 focus:ring-[#0B2B6D] outline-none"
                    id="checkout-name-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp para confirmação do pedido *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full p-3 pl-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-[#0B2B6D] focus:ring-1 focus:ring-[#0B2B6D] outline-none"
                      id="checkout-whatsapp-input"
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enviaremos o comprovante e atualizações da entrega para este número.
                  </p>
                </div>
              </div>
            ) : currentStep === 2 ? (
              /* STEP 2: ENDEREÇO & ENTREGA */
              <div className="space-y-4" id="step-2-endereco">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-[#0B2B6D]" />
                  <h3 className="font-black text-base text-slate-900">
                    2. Como deseja receber seu pedido?
                  </h3>
                </div>

                {/* Delivery Type Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'border-[#0B2B6D] bg-blue-50/60 ring-2 ring-[#0B2B6D]/20 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className={`w-5 h-5 shrink-0 ${deliveryType === 'delivery' ? 'text-[#0B2B6D]' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Receber em Casa</span>
                      <span className="text-[11px] text-slate-500">Entrega rápida motoboy</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-[#0B2B6D] bg-blue-50/60 ring-2 ring-[#0B2B6D]/20 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Store className={`w-5 h-5 shrink-0 ${deliveryType === 'pickup' ? 'text-[#0B2B6D]' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Retirar em Loja</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Sem taxa de entrega</span>
                    </div>
                  </button>
                </div>

                {deliveryType === 'pickup' ? (
                  /* Pickup Store selection */
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Local de retirada na loja física:
                    </label>
                    <div className="space-y-2">
                      {activeStores.map((store) => (
                        <label
                          key={store.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            pickupStoreId === store.id
                              ? 'border-[#0B2B6D] bg-blue-50/40 font-semibold'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pickupStore"
                            checked={pickupStoreId === store.id}
                            onChange={() => setPickupStoreId(store.id)}
                            className="mt-1 text-[#0B2B6D] focus:ring-[#0B2B6D]"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              {store.name}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {store.address} - {store.neighborhood}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Horário: {store.hours}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Delivery Address Form */
                  <div className="space-y-3 pt-1">
                    {/* Neighborhood Selector with rate */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Bairro em São Paulo (Taxa de entrega) *
                      </label>
                      <select
                        value={selectedNeighborhoodId}
                        onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-[#0B2B6D] outline-none"
                        id="checkout-neighborhood-select"
                      >
                        {neighborhoods
                          .filter((n) => n.active)
                          .map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name} — Taxa:{' '}
                              {n.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({n.estimatedTime})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Rua / Avenida *
                        </label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Ex: Rua das Palmeiras"
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-[#0B2B6D] outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          placeholder="Ex: 123"
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-[#0B2B6D] outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Complemento (Opcional)
                        </label>
                        <input
                          type="text"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          placeholder="Apto 42, Bloco B, Casa 2"
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-[#0B2B6D] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Ponto de Referência
                        </label>
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="Ex: Próximo à padaria"
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-[#0B2B6D] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : currentStep === 3 ? (
              /* STEP 3: FORMA DE PAGAMENTO */
              <div className="space-y-4" id="step-3-pagamento">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-[#0B2B6D]" />
                  <h3 className="font-black text-base text-slate-900">
                    3. Escolha a Forma de Pagamento
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {/* PIX */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-emerald-600" /> PIX Instantâneo
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          5% DE DESCONTO
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Aprovação imediata do pedido e envio rápido.
                      </p>

                      {paymentMethod === 'pix' && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Chave PIX ({settings.pixKeyType}):</span>
                            <span className="font-mono font-bold text-slate-800">{settings.pixKey}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Favorecido:</span>
                            <span className="font-semibold text-slate-800">{settings.pixReceiverName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyPixKey}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Cartão de Crédito na Entrega */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cartao_credito'
                        ? 'border-[#0B2B6D] bg-blue-50/50 ring-2 ring-[#0B2B6D]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cartao_credito'}
                      onChange={() => setPaymentMethod('cartao_credito')}
                      className="mt-1 text-[#0B2B6D] focus:ring-[#0B2B6D]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-slate-900 block">
                        Cartão de Crédito (na maquininha na entrega)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Aceitamos Visa, Mastercard, Elo, Hipercard
                      </span>
                    </div>
                  </label>

                  {/* Cartão de Débito na Entrega */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cartao_debito'
                        ? 'border-[#0B2B6D] bg-blue-50/50 ring-2 ring-[#0B2B6D]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cartao_debito'}
                      onChange={() => setPaymentMethod('cartao_debito')}
                      className="mt-1 text-[#0B2B6D] focus:ring-[#0B2B6D]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-slate-900 block">
                        Cartão de Débito (na maquininha na entrega)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Débito presencial no ato do recebimento
                      </span>
                    </div>
                  </label>

                  {/* Dinheiro com Pergunta de Troco */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'dinheiro'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'dinheiro'}
                      onChange={() => setPaymentMethod('dinheiro')}
                      className="mt-1 text-amber-600 focus:ring-amber-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-amber-600" /> Dinheiro em Espécie
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pagamento ao entregador no recebimento
                      </span>

                      {paymentMethod === 'dinheiro' && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-amber-200 space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={needsChange}
                              onChange={(e) => setNeedsChange(e.target.checked)}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-600 border-slate-300"
                            />
                            <span className="text-xs font-bold text-slate-800">
                              Precisa de troco?
                            </span>
                          </label>

                          {needsChange && (
                            <div className="space-y-2 pt-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Troco para quanto? (R$)
                              </label>
                              <input
                                type="text"
                                value={changeForAmount}
                                onChange={(e) => setChangeForAmount(e.target.value)}
                                placeholder="Ex: 200,00"
                                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:border-amber-500 outline-none"
                              />

                              {numericChangeFor > finalTotal ? (
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-bold flex items-center justify-between">
                                  <span>Troco a devolver:</span>
                                  <span>
                                    {changeDue.toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    })}
                                  </span>
                                </div>
                              ) : changeForAmount ? (
                                <p className="text-[11px] text-rose-600 font-medium">
                                  Informe um valor maior que o total da compra (
                                  {finalTotal.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  })}
                                  ).
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Optional Notes */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Observações do Pedido (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Tocar a campainha, deixar na portaria, etc."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#0B2B6D]"
                  />
                </div>
              </div>
            ) : (
              /* STEP 4: REVISÃO COMPLETA */
              <div className="space-y-4" id="step-4-revisao">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-[#0B2B6D]" />
                  <h3 className="font-black text-base text-slate-900">
                    4. Revisão Geral do Pedido
                  </h3>
                </div>

                {/* Order Summary Cards */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  {/* Customer & Address */}
                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                      Destinatário & Contato
                    </h4>
                    <p className="font-bold text-slate-900">{fullName}</p>
                    <p className="text-slate-600">WhatsApp: {whatsapp}</p>
                  </div>

                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                      {deliveryType === 'pickup' ? 'Local de Retirada' : 'Endereço de Entrega'}
                    </h4>
                    {deliveryType === 'pickup' ? (
                      <p className="font-bold text-slate-900">
                        {storeLocations.find((s) => s.id === pickupStoreId)?.name || 'Loja Física'} (
                        {storeLocations.find((s) => s.id === pickupStoreId)?.address || ''})
                      </p>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-900">
                          {street}, {number} {complement ? `(${complement})` : ''}
                        </p>
                        <p className="text-slate-600">
                          Bairro: {selectedNeighborhood?.name} {reference ? `• Ref: ${reference}` : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment */}
                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                      Forma de Pagamento
                    </h4>
                    <p className="font-bold text-slate-900 capitalize">
                      {paymentMethod === 'pix'
                        ? 'PIX Instantâneo (5% de Desconto)'
                        : paymentMethod === 'cartao_credito'
                        ? 'Cartão de Crédito na Entrega'
                        : paymentMethod === 'cartao_debito'
                        ? 'Cartão de Débito na Entrega'
                        : 'Dinheiro'}
                    </p>
                    {needsChange && changeDue > 0 && (
                      <p className="text-emerald-700 font-bold text-[11px] mt-0.5">
                        Troco para {numericChangeFor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} • Levar de troco:{' '}
                        {changeDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    )}
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                      Itens do Pedido ({cart.length})
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={`${item.productId}-${item.variationId || 'base'}`}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-700 line-clamp-1">
                            <strong>{item.quantity}x</strong> {item.product.name}
                            {item.variationName ? ` (${item.variationName})` : ''}
                          </span>
                          <span className="font-bold text-slate-900 shrink-0 ml-2">
                            {(item.unitPrice * item.quantity).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Price Breakdown */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal dos Produtos</span>
                    <span className="font-bold">
                      {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>Taxa de Entrega</span>
                    <span className="font-bold">
                      {actualDeliveryFee === 0
                        ? 'Grátis'
                        : actualDeliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Desconto Especial PIX (5%)</span>
                      <span>
                        -{discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-[#0B2B6D] pt-2 border-t border-amber-200">
                    <span>Total Final do Pedido</span>
                    <span>
                      {finalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {!orderCompleted && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as typeof currentStep)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseCheckout}
                  className="px-4 py-2.5 text-slate-500 hover:text-slate-800 font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-[#0B2B6D] hover:bg-[#081F50] text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  id="checkout-next-step-btn"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishOrder}
                  disabled={isSubmitting || !!orderCompleted}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm flex items-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer"
                  id="checkout-finish-whatsapp-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Enviando pedido...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 fill-white" />
                      <span>Enviar Pedido pelo WhatsApp</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
