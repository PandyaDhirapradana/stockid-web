const Module = require('../models/Module.model');
const cloudinary = require('../config/cloudinary');

// GET /api/modules — public untuk member aktif
const getModules = async (req, res, next) => {
  try {
    const modules = await Module.find({ isVisible: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-publicId');
    res.json({ success: true, data: modules });
  } catch (error) { next(error); }
};

// GET /api/modules/all — admin only
const getAllModules = async (req, res, next) => {
  try {
    const modules = await Module.find()
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: modules });
  } catch (error) { next(error); }
};

// POST /api/modules — upload modul baru
const uploadModule = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File PDF wajib diupload' });
    }
    const { title, description, order } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Judul modul wajib diisi' });
    }

    const module = await Module.create({
      title: title.trim(),
      description: description?.trim() || '',
      fileUrl: req.file.path,
      publicId: req.file.filename,
      fileSize: req.file.size || 0,
      order: parseInt(order) || 0,
      uploadedBy: req.admin?.name || 'admin',
    });

    res.status(201).json({ success: true, message: 'Modul berhasil diupload', data: module });
  } catch (error) { next(error); }
};

// PUT /api/modules/:id — update info modul (tanpa ganti file)
const updateModule = async (req, res, next) => {
  try {
    const { title, description, order, isVisible } = req.body;
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Modul tidak ditemukan' });

    if (title) module.title = title.trim();
    if (description !== undefined) module.description = description.trim();
    if (order !== undefined) module.order = parseInt(order);
    if (isVisible !== undefined) module.isVisible = isVisible === 'true' || isVisible === true;

    await module.save();
    res.json({ success: true, message: 'Modul diperbarui', data: module });
  } catch (error) { next(error); }
};

// DELETE /api/modules/:id
const deleteModule = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Modul tidak ditemukan' });

    // Hapus dari Cloudinary
    if (module.publicId) {
      await cloudinary.uploader.destroy(module.publicId, { resource_type: 'raw' });
    }

    await module.deleteOne();
    res.json({ success: true, message: 'Modul dihapus' });
  } catch (error) { next(error); }
};

module.exports = { getModules, getAllModules, uploadModule, updateModule, deleteModule };