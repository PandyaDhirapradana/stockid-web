const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const createImageStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `stockclass/${folder}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
  },
});

// PDF harus pakai resource_type: 'raw'
const createPdfStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `stockclass/${folder}`,
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
  }),
});

const uploadMentor = multer({ storage: createImageStorage('mentors'), limits: { fileSize: 5 * 1024 * 1024 } });
const uploadGain = multer({ storage: createImageStorage('gains'), limits: { fileSize: 5 * 1024 * 1024 } });
const uploadSlider = multer({ storage: createImageStorage('sliders'), limits: { fileSize: 5 * 1024 * 1024 } });
const uploadModule = multer({ storage: createPdfStorage('modules'), limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = { uploadMentor, uploadGain, uploadSlider, uploadModule };