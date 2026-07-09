const validateMember = (req, res, next) => {
  const { name, phone, classCategory, startDate, durationDays } = req.body;
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!phone || !/^(\+62|62|0)[0-9]{8,13}$/.test(phone)) errors.push('Invalid Indonesian phone number');
  if (!classCategory || !['Basic', 'Intermediate', 'Advanced', 'VIP'].includes(classCategory)) errors.push('Invalid class category');
  if (!startDate || isNaN(new Date(startDate))) errors.push('Invalid start date');
  if (!durationDays || isNaN(durationDays) || durationDays < 1) errors.push('Duration days must be at least 1');
  if (errors.length > 0) return res.status(400).json({ success: false, message: 'Validation failed', errors });
  next();
};

const validatePayment = (req, res, next) => {
  const { name, phone, classCategory } = req.body;
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!phone || !/^(\+62|62|0)[0-9]{8,13}$/.test(phone)) errors.push('Invalid Indonesian phone number');
  if (!classCategory || !['Paket Screener', 'Paket Kelas 1 Bulan', 'Paket Kelas 2 Bulan',
  'Paket Kelas 3 Bulan', 'Paket Kelas 6 Bulan', 'Paket Kelas 1 Tahun'].includes(classCategory)) errors.push('Invalid class category');
  if (errors.length > 0) return res.status(400).json({ success: false, message: 'Validation failed', errors });
  next();
};

module.exports = { validateMember, validatePayment };