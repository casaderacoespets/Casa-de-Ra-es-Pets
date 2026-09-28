import { StoreLocation, StoreSettings } from '../types';

export const STORE_SETTINGS: StoreSettings = {
  storeName: "Pet's Family",
  slogan: 'Clínica Veterinária 24 Horas • Pet Shop • Banho & Tosa • Entrega na Região',
  primaryWhatsapp: '5511975158424',
  primaryWhatsappDisplay: '(11) 97515-8424',
  primaryPhone: '(11) 2495-0511',
  address: 'Av. Dona Belmira Marin, 3618 - Loja 1',
  cep: '04846-000',
  city: 'São Paulo - SP',
  serviceRegion: 'Grajaú e Apurá — São Paulo/SP',
  instagram: 'familypet1',
  linktree: 'familypet1',
  announcementText: '🐾 Pet\'s Family — Clínica Veterinária 24h • Banho & Tosa • Pet Shop • Entrega em Grajaú e Apurá!',
  minOrderValue: 20.0,
  freeDeliveryThreshold: 150.0,
  pixKey: '11975158424',
  pixKeyType: 'Celular (WhatsApp)',
  pixReceiverName: "Pet's Family Clínica Veterinária",
  aboutText: "A Pet's Family é referência em cuidado animal completo na Zona Sul de São Paulo, integrando Clínica Veterinária 24 Horas, Pet Shop com rações e farmácia, Banho & Tosa especializado e serviço de entrega para toda a região do Grajaú e Apurá.",
  copyrightText: `© ${new Date().getFullYear()} Pet's Family — Clínica Veterinária 24h, Pet Shop & Banho e Tosa. Todos os direitos reservados.`,
};

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: 'store-pets-family-main',
    name: "Pet's Family — Clínica 24h & Pet Shop",
    address: 'Av. Dona Belmira Marin, 3618 - Loja 1',
    neighborhood: 'Grajaú',
    city: 'São Paulo - SP',
    phone: '(11) 2495-0511',
    whatsapp: '5511975158424',
    hours: 'Clínica Veterinária: 24 Horas (Plantão) • Pet Shop & Banho e Tosa: Seg a Sáb 08h às 19h30',
    mapUrl: 'https://www.google.com/maps/place/Clinica+Veterin%C3%A1ria+Pets+Family/@-23.7535282,-46.6812851,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce4f4d12c10fc5:0x66db650c2b64a291!8m2!3d-23.7535282!4d-46.6812851!16s%2Fg%2F11f3s5jtfc?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D',
    mapsUrl: 'https://www.google.com/maps/place/Clinica+Veterin%C3%A1ria+Pets+Family/@-23.7535282,-46.6812851,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce4f4d12c10fc5:0x66db650c2b64a291!8m2!3d-23.7535282!4d-46.6812851!16s%2Fg%2F11f3s5jtfc?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D',
    isActive: true,
  },
];

