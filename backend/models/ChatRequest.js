const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  herbId: { type: mongoose.Schema.Types.ObjectId, ref: 'Herb', required: false },
  herbName: { type: String, required: false },
  visitorName: { type: String, required: true },
  visitorEmail: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  forwardedTo: { type: String } // the whatsapp number used
});

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
