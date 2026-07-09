const SiteContent = require('../models/SiteContent.model');
const Review = require('../models/Review.model');
const GainPhoto = require('../models/GainPhoto.model');
const Mentor = require('../models/Mentor.model');
const cloudinary = require('../config/cloudinary');

// ── SITE CONTENT ──────────────────────────────────────

const getContent = async (req, res, next) => {
  try {
    let content = await SiteContent.findOne({ key: 'main' });
    if (!content) {
      // Create default content
      content = await SiteContent.create({
        key: 'main',
        heroTitle: 'Kuasai Pasar Saham Bersama StockId',
        heroSubtitle: 'Belajar analisa teknikal & fundamental dari mentor berpengalaman.',
        heroButtonText: 'Mulai Belajar',
        tickerStocks: ['BBRI +2.3%','BBCA +1.8%','TLKM -0.5%','ASII +3.1%','BMRI +2.7%','GOTO -1.2%','UNVR +0.9%','INDF +1.5%','PGAS +4.2%','KLBF +1.1%','BYAN +3.4%','ADRO +2.1%','ICBP +0.8%','SMGR -0.3%','ANTM +4.5%'],
        sliderSlides: [
          { header: 'Selamat Datang', info: 'Belajar Saham Dari Nol Sampai Bisa, Di Bimbing Dengan 2 Mentor Berpengalaman' },
          { header: 'Pembelajaran', info: 'Belajar Dasar Saham, Analisa Fundamental, Analisa Teknikal, Bandarmology dan masih banyak lagi' },
          { header: 'Pasti Murah', info: 'Kami Berani Jamin Harga Kelas Kami Dapat Bersaing Dengan Kompetitif' },
        ],
        aboutHeader: 'Apa itu Stock ID VIP?',
        aboutParagraph1: 'Stock ID VIP dibentuk pada September 2025, ditujukan untuk membantu teman-teman Belajar Saham dan memberikan Watchlist terbaik yang sudah kami analisa.',
        aboutParagraph2: 'Kami memastikan harga kelas kami sangat kompetitif dan dapat bersaing, diharapkan semua teman dapat profit dengan konsisten.',
        benefitsHeader: 'Benefit apa saja yang didapat?',
        benefitsList: ['Menganalisa Saham','Membaca Market','Membaca Broker Summary','Membaca Pergerakan Bandar atau Asing','Membaca Data Perusahaan (Fundamental)','Saran (Entry Safe, Support, Take Profit)','Watchlist Gacor Tiap Hari & Info A1'],
        statsStartDate: '2025-09-13',
        freeClassLink: 'https://chat.whatsapp.com/your-group-link',
        freeClassLabel: 'Atau mau join gratis? Klik disini!',
        footerText: "Stock ID VIP — Platform edukasi saham terpercaya. Bersama kami, jadikan pasar saham peluang terbaik Anda.",
        footerLinks: [],
      });
    }
    res.json({ success: true, data: content });
  } catch (error) { next(error); }
};

const updateContent = async (req, res, next) => {
  try {
    const updates = req.body;
    const content = await SiteContent.findOneAndUpdate(
      { key: 'main' },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Konten berhasil diupdate', data: content });
  } catch (error) { next(error); }
};

// Upload slider image
const uploadSliderImage = async (req, res, next) => {
  try {
    const { slideIndex } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });

    const content = await SiteContent.findOne({ key: 'main' });
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    const idx = parseInt(slideIndex);
    if (content.sliderSlides[idx]) {
      // Delete old image if exists
      if (content.sliderSlides[idx].publicId) {
        await cloudinary.uploader.destroy(content.sliderSlides[idx].publicId);
      }
      content.sliderSlides[idx].imageUrl = req.file.path;
      content.sliderSlides[idx].publicId = req.file.filename;
    }
    content.markModified('sliderSlides');
    await content.save();

    res.json({ success: true, data: content });
  } catch (error) { next(error); }
};

// ── REVIEWS ──────────────────────────────────────────

const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isVisible: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
};

const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
};

const createReview = async (req, res, next) => {
  try {
    const { name, message, rating, order } = req.body;
    if (!name || !message) return res.status(400).json({ success: false, message: 'Nama dan pesan wajib diisi' });
    const review = await Review.create({ name, message, rating: rating || 5, order: order || 0 });
    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
    res.json({ success: true, data: review });
  } catch (error) { next(error); }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
    res.json({ success: true, message: 'Review dihapus' });
  } catch (error) { next(error); }
};

// ── GAIN PHOTOS ───────────────────────────────────────

const getGainPhotos = async (req, res, next) => {
  try {
    const photos = await GainPhoto.find({ isVisible: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: photos });
  } catch (error) { next(error); }
};

const getAllGainPhotos = async (req, res, next) => {
  try {
    const photos = await GainPhoto.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: photos });
  } catch (error) { next(error); }
};

const uploadGainPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
    const photo = await GainPhoto.create({
      imageUrl: req.file.path,
      publicId: req.file.filename,
      caption: req.body.caption || '',
      order: req.body.order || 0,
    });
    res.status(201).json({ success: true, data: photo });
  } catch (error) { next(error); }
};

const updateGainPhoto = async (req, res, next) => {
  try {
    const photo = await GainPhoto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!photo) return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });
    res.json({ success: true, data: photo });
  } catch (error) { next(error); }
};

const deleteGainPhoto = async (req, res, next) => {
  try {
    const photo = await GainPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });
    if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();
    res.json({ success: true, message: 'Foto dihapus' });
  } catch (error) { next(error); }
};

// ── MENTORS ───────────────────────────────────────────

const getMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find({ isVisible: true }).sort({ order: 1 });
    res.json({ success: true, data: mentors });
  } catch (error) { next(error); }
};

const getAllMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find().sort({ order: 1 });
    res.json({ success: true, data: mentors });
  } catch (error) { next(error); }
};

const createMentor = async (req, res, next) => {
  try {
    const { name, role, equity, tradingStyle, contacts, order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama mentor wajib diisi' });
    const mentor = await Mentor.create({
      name, role, equity, tradingStyle,
      contacts: contacts ? JSON.parse(contacts) : [],
      order: order || 0,
      imageUrl: req.file?.path || '',
      publicId: req.file?.filename || '',
    });
    res.status(201).json({ success: true, data: mentor });
  } catch (error) { next(error); }
};

const updateMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor tidak ditemukan' });

    const { name, role, equity, tradingStyle, contacts, order, isVisible } = req.body;
    if (name) mentor.name = name;
    if (role) mentor.role = role;
    if (equity !== undefined) mentor.equity = equity;
    if (tradingStyle !== undefined) mentor.tradingStyle = tradingStyle;
    if (contacts) mentor.contacts = JSON.parse(contacts);
    if (order !== undefined) mentor.order = parseInt(order);
    if (isVisible !== undefined) mentor.isVisible = isVisible === 'true';

    if (req.file) {
      if (mentor.publicId) await cloudinary.uploader.destroy(mentor.publicId);
      mentor.imageUrl = req.file.path;
      mentor.publicId = req.file.filename;
    }

    await mentor.save();
    res.json({ success: true, data: mentor });
  } catch (error) { next(error); }
};

const deleteMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor tidak ditemukan' });
    if (mentor.publicId) await cloudinary.uploader.destroy(mentor.publicId);
    await mentor.deleteOne();
    res.json({ success: true, message: 'Mentor dihapus' });
  } catch (error) { next(error); }
};

module.exports = {
  getContent, updateContent, uploadSliderImage,
  getReviews, getAllReviews, createReview, updateReview, deleteReview,
  getGainPhotos, getAllGainPhotos, uploadGainPhoto, updateGainPhoto, deleteGainPhoto,
  getMentors, getAllMentors, createMentor, updateMentor, deleteMentor,
};