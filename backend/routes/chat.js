const express = require('express');
const Joi = require('joi');
const Herb = require('../models/Herb');
const ChatRequest = require('../models/ChatRequest');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const schema = Joi.object({
  herbId: Joi.string().allow('', null),
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required()
});

// Create a chat request record and return wa.me link to frontend
router.post('/', authenticateOptional, async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { herbId, name, email, phone } = value;
    let herb = null;
    if (herbId) {
      try { herb = await Herb.findById(herbId); } catch(e) { /* ignore invalid id */ }
    }

    // choose number to forward — herb's whatsappNumber if present, otherwise default from env
    const targetNumber = (herb && herb.whatsappNumber) ? herb.whatsappNumber : process.env.DEFAULT_WHATSAPP_NUMBER;
    const herbName = herb ? herb.name : (req.body.herbName || '');

    // Save chat record
    const chat = new ChatRequest({
      herbId: herb ? herb._id : undefined,
      herbName,
      visitorName: name,
      visitorEmail: email,
      visitorPhone: phone,
      userId: req.user ? req.user.id : undefined,
      forwardedTo: targetNumber
    });
    await chat.save();

    // Prepare wa.me link
    // Message text: "Hi, I'm {name} — I'm interested in {herbName} from Rising-Herb. My phone: {phone}"
    const text = `Hi, I'm ${name} — I'm interested in ${herbName || 'your product'} from Rising-Herb. My phone: ${phone}`;
    const waNumber = (targetNumber || '').replace(/\+/g, '').replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

    return res.json({ waLink, chatId: chat._id });

  } catch (err) {
    console.error('chat create error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

/* Helper: optional authentication middleware (if token present, authenticate, else continue) */
function authenticateOptional(req, res, next){
  const header = req.headers.authorization;
  if (!header) return next();
  const parts = header.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const jwt = require('jsonwebtoken');
    try {
      const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
      req.user = payload;
    } catch (e) {
      // invalid token -> ignore and continue as guest
    }
  }
  next();
}
