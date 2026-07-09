const PRICING = {
  'Paket Screener': {
    label: 'Paket Screener',
    price: 70000,
    originalPrice: 100000,
    discount: 30,
    durationDays: 0, // tidak mengaktifkan membership
    isScreener: true,
    features: [
      'Menyaring saham-saham pilihan',
      'Akurasi berbasis tren',
      'Membantu menyusun trading plan',
      'dan masih banyak lagi',
    ],
  },
  'Paket Kelas 1 Bulan': {
    label: 'Paket Kelas 1 Bulan',
    price: 130000,
    originalPrice: 200000,
    discount: 35,
    durationDays: 30,
    isScreener: false,
    features: [
      'Akses kelas selama 30 hari',
      'Materi analisa teknikal & fundamental',
      'Grup diskusi member',
      'Sinyal trading harian',
    ],
  },
  'Paket Kelas 2 Bulan': {
    label: 'Paket Kelas 2 Bulan',
    price: 240000,
    originalPrice: 400000,
    discount: 40,
    durationDays: 60,
    isScreener: false,
    features: [
      'Akses kelas selama 60 hari',
      'Materi analisa teknikal & fundamental',
      'Grup diskusi member',
      'Sinyal trading harian',
    ],
  },
  'Paket Kelas 3 Bulan': {
    label: 'Paket Kelas 3 Bulan',
    price: 330000,
    originalPrice: 600000,
    discount: 45,
    durationDays: 90,
    isScreener: false,
    badge: 'TERPOPULER',
    features: [
      'Akses kelas selama 90 hari',
      'Materi analisa teknikal & fundamental',
      'Grup diskusi member',
      'Sinyal trading harian',
    ],
  },
  'Paket Kelas 6 Bulan': {
    label: 'Paket Kelas 6 Bulan',
    price: 600000,
    originalPrice: 1200000,
    discount: 50,
    durationDays: 180,
    isScreener: false,
    features: [
      'Akses kelas selama 180 hari',
      'Materi analisa teknikal & fundamental',
      'Grup diskusi member',
      'Sinyal trading harian',
    ],
  },
  'Paket Kelas 1 Tahun': {
    label: 'Paket Kelas 1 Tahun',
    price: 1080000,
    originalPrice: 2400000,
    discount: 55,
    durationDays: 365,
    isScreener: false,
    features: [
      'Akses kelas selama 365 hari',
      'Materi analisa teknikal & fundamental',
      'Grup diskusi member',
      'Sinyal trading harian',
    ],
  },
};

const getPrice = (classCategory) => PRICING[classCategory] || null;

const validateAmount = (classCategory, submittedAmount) => {
  const pricing = getPrice(classCategory);
  if (!pricing) return false;
  return pricing.price === submittedAmount;
};

module.exports = { PRICING, getPrice, validateAmount };