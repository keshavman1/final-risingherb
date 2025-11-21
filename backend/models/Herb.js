const mongoose = require('mongoose');

const herbSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  // Category now limited to the values you requested
  category: { 
    type: String, 
    enum: ['Herbs', 'Herbs Powder', 'seeds', 'vermicompost'], 
    default: 'Herbs' 
  },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  unit: { type: String, default: '100 gm' },
  imageUrl: { type: String, default: '' }, // user-supplied URL
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

herbSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Herb', herbSchema);
