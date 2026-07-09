const generateWhatsAppUrl = (phone, memberName, classCategory, endDate, isScreener = false) => {
  let normalizedPhone = phone.replace(/\D/g, '');
  if (normalizedPhone.startsWith('0')) normalizedPhone = '62' + normalizedPhone.substring(1);
  else if (!normalizedPhone.startsWith('62')) normalizedPhone = '62' + normalizedPhone;

  let message;

  if (isScreener) {
    message = encodeURIComponent(
      `*Pembayaran Paket Screener Dikonfirmasi!*\n\n` +
      `Halo *${memberName}*,\n\n` +
      `Terima kasih telah membeli Paket Screener Stock ID!\n\n` +
      `*Detail:*\n` +
      `• Paket: *Paket Screener*\n\n` +
      `Kami akan segera mengirimkan screener saham pilihan kepada Anda.\n\n` +
      `Terima kasih!`
    );
  } else {
    const endDateFormatted = endDate
      ? new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
      : '-';
    message = encodeURIComponent(
      `*Pembayaran Dikonfirmasi!*\n\n` +
      `Halo *${memberName}*,\n\n` +
      `Selamat! Membership Anda telah aktif.\n\n` +
      `*Detail Membership:*\n` +
      `• Kelas: *${classCategory}*\n` +
      `• Aktif hingga: *${endDateFormatted}*\n\n` +
      `Terima kasih telah bergabung dengan Stock ID!\n` +
      `Silakan cek status membership Anda di halaman leaderboard atau profil.`
    );
  }

  return `https://wa.me/${normalizedPhone}?text=${message}`;
};

module.exports = { generateWhatsAppUrl };