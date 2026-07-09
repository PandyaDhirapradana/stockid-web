const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { uploadMentor, uploadGain, uploadSlider } = require('../config/multer');
const {
  getContent, updateContent, uploadSliderImage,
  getReviews, getAllReviews, createReview, updateReview, deleteReview,
  getGainPhotos, getAllGainPhotos, uploadGainPhoto, updateGainPhoto, deleteGainPhoto,
  getMentors, getAllMentors, createMentor, updateMentor, deleteMentor,
} = require('../controllers/content.controller');

// Public routes (untuk landing page)
router.get('/site', getContent);
router.get('/reviews', getReviews);
router.get('/gain-photos', getGainPhotos);
router.get('/mentors', getMentors);

// Admin protected routes
router.put('/site', protect, updateContent);
router.post('/site/slider-image', protect, uploadSlider.single('image'), uploadSliderImage);

router.get('/reviews/all', protect, getAllReviews);
router.post('/reviews', protect, createReview);
router.put('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

router.get('/gain-photos/all', protect, getAllGainPhotos);
router.post('/gain-photos', protect, uploadGain.single('image'), uploadGainPhoto);
router.put('/gain-photos/:id', protect, updateGainPhoto);
router.delete('/gain-photos/:id', protect, deleteGainPhoto);

router.get('/mentors/all', protect, getAllMentors);
router.post('/mentors', protect, uploadMentor.single('image'), createMentor);
router.put('/mentors/:id', protect, uploadMentor.single('image'), updateMentor);
router.delete('/mentors/:id', protect, deleteMentor);

module.exports = router;