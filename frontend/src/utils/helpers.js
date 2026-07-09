export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(date));
};

export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
};

export const getRemainingTime = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff <= 0) return { expired: true, text: 'Expired', days: 0, hours: 0, minutes: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  if (days > 0) text = `${days}h ${hours}j`;
  else if (hours > 0) text = `${hours}j ${minutes}m`;
  else text = `${minutes} menit`;

  return { expired: false, text, days, hours, minutes };
};

export const isActive = (endDate) => {
  return new Date() < new Date(endDate);
};

export const getCategoryColor = (category) => {
  const colors = {
    Basic: 'text-blue-400 bg-blue-900/30 border-blue-800',
    Intermediate: 'text-purple-400 bg-purple-900/30 border-purple-800',
    Advanced: 'text-orange-400 bg-orange-900/30 border-orange-800',
    VIP: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  };
  return colors[category] || 'text-zinc-400 bg-zinc-900/30 border-zinc-700';
};

export const truncatePhone = (phone) => {
  if (!phone || phone.length < 6) return phone;
  const visible = phone.slice(0, 4);
  const masked = '*'.repeat(Math.max(phone.length - 7, 3));
  const last3 = phone.slice(-3);
  return `${visible}${masked}${last3}`;
};