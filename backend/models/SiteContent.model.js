const mongoose = require('mongoose');

// Stores editable content for each section
const sliderSlideSchema = new mongoose.Schema({
  header: { type: String, default: '' },
  info: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
});

const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'hero', 'slider', 'about', 'benefits', 'footer'
  
  // Hero section
  heroTitle: { type: String },
  heroSubtitle: { type: String },
  heroButtonText: { type: String },
  tickerStocks: [{ type: String }],
  
  // Slider section
  sliderSlides: [sliderSlideSchema],
  
  // About section
  aboutHeader: { type: String },
  aboutParagraph1: { type: String },
  aboutParagraph2: { type: String },
  
  // Benefits section
  benefitsHeader: { type: String },
  benefitsList: [{ type: String }],
  
  // Stats section
  statsStartDate: { type: String }, // ISO date string
  statsManualMemberCount: { type: Number }, // optional override
  
  // Free class section
  freeClassLink: { type: String },
  freeClassLabel: { type: String },
  
  // Footer section
  footerText: { type: String },
  footerLinks: [{ label: String, href: String }],

}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);