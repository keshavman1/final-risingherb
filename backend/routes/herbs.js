// backend/routes/herbs.js
const express = require('express');
const Joi = require('joi');
const Herb = require('../models/Herb');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Joi schema - enforce allowed categories and validate imageUrl as optional URI
const herbSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  category: Joi.string().valid('Herbs', 'Herbs Powder', 'seeds', 'vermicompost').required(),
  minPrice: Joi.number().min(0).required(),
  maxPrice: Joi.number().min(0).required(),
  unit: Joi.string().default('100 gm'),
  imageUrl: Joi.string().uri().allow('').optional(),
});

// Helper: return image URL as-is when absolute, otherwise return empty string or raw value.
// We intentionally DO NOT rewrite or prepend /uploads (no local storage).
function normalizeImageForResponse(storedUrl) {
  if (!storedUrl) return '';
  if (/^https?:\/\//i.test(storedUrl)) return storedUrl;
  // If user stored something non-HTTP (not expected), return as-is so frontend can handle it.
  return storedUrl;
}

// GET /api/herbs (public)
router.get('/', async (req, res) => {
  try {
    const herbs = await Herb.find().sort({ createdAt: -1 }).lean();
    const adminWhatsapp = process.env.ADMIN_WHATSAPP || '';
    const enriched = herbs.map(h => {
      const imageUrl = normalizeImageForResponse(h.imageUrl || '');
      return { ...h, imageUrl, adminWhatsapp };
    });
    return res.json(enriched);
  } catch (err) {
    console.error('get herbs error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST create herb (admin only) - expects JSON body with imageUrl and category
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const payload = {
      name: (req.body.name || '').trim(),
      description: req.body.description || '',
      category: req.body.category || '',
      minPrice: Number(req.body.minPrice || 0),
      maxPrice: Number(req.body.maxPrice || 0),
      unit: req.body.unit || '100 gm',
      imageUrl: req.body.imageUrl || ''
    };

    const { error } = herbSchema.validate(payload);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const herb = new Herb(payload);
    await herb.save();

    const herbObj = herb.toObject();
    herbObj.imageUrl = normalizeImageForResponse(herbObj.imageUrl || '');
    herbObj.adminWhatsapp = process.env.ADMIN_WHATSAPP || '';
    return res.status(201).json(herbObj);
  } catch (err) {
    console.error('create herb error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT update herb (admin only) - expects JSON body
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const payload = {
      name: (req.body.name || '').trim(),
      description: req.body.description || '',
      category: req.body.category || '',
      minPrice: Number(req.body.minPrice || 0),
      maxPrice: Number(req.body.maxPrice || 0),
      unit: req.body.unit || '100 gm',
      imageUrl: req.body.imageUrl || ''
    };

    const { error } = herbSchema.validate(payload);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const herb = await Herb.findById(req.params.id);
    if (!herb) {
      return res.status(404).json({ message: 'Not found' });
    }

    // Update fields
    herb.name = payload.name;
    herb.description = payload.description;
    herb.category = payload.category;
    herb.minPrice = payload.minPrice;
    herb.maxPrice = payload.maxPrice;
    herb.unit = payload.unit;
    herb.imageUrl = payload.imageUrl;

    await herb.save();

    const obj = herb.toObject();
    obj.imageUrl = normalizeImageForResponse(obj.imageUrl || '');
    obj.adminWhatsapp = process.env.ADMIN_WHATSAPP || '';
    return res.json(obj);
  } catch (err) {
    console.error('update herb error', err);
    return res.status(400).json({ message: 'Invalid id or server error' });
  }
});

// DELETE herb
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const herb = await Herb.findByIdAndDelete(req.params.id);
    if (!herb) return res.status(404).json({ message: 'Not found' });

    // No filesystem image deletion required anymore (we don't store files on server).
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('delete herb error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
});

module.exports = router;
