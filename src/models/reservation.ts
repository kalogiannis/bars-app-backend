import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  bar:       { type: mongoose.Schema.Types.ObjectId, ref: 'Bar', required: true },
  date:      { type: String, required: true },    // “YYYY‑MM‑DD”
  time:      { type: String, required: true },    // “HH:MM”
  partySize: { type: Number, required: true, min: 1 },
  refid:     { type: String, required: true, unique: true },
  status:    { type: String, enum: ['pending','confirmed','cancelled'], default: 'confirmed' },
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
