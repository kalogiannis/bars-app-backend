import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Reservation from '../models/reservation';
import Bar from '../models/bar';

// 1) Check availability for a given slot
export const checkAvailability = async (req: Request, res: Response) => {
  const { barId } = req.params;
  const { date, time, partySize } = req.query as Record<string,string>;
  // Count existing seats already booked at that slot
  const existing = await Reservation.aggregate([
    { $match: { bar: new mongoose.Types.ObjectId(barId), date, time, status: 'confirmed' }},
    { $group: { _id: null, sum: { $sum: '$partySize' } } }
  ]);
  const used = (existing[0]?.sum || 0);
  
  // Look up bar capacity (could store capacity on Bar model)
  const bar = await Bar.findById(barId);
  const capacity = bar?.capacity || 20;       // fallback default
  const freeSeats = capacity - used;

  res.json({ freeSeats, isAvailable: freeSeats >= Number(partySize) });
};

// 2) Create a reservation
export const createReservation = async (req: Request, res: Response) => {
  const { barId } = req.params;
  const { date, time, partySize, refid } = req.body;
  // re‑check availability to avoid races
  const existing = await Reservation.aggregate([
    { $match: { bar: new mongoose.Types.ObjectId(barId), date, time, status: 'confirmed' }},
    { $group: { _id: null, sum: { $sum: '$partySize' } } }
  ]);
  const used = (existing[0]?.sum || 0);
  const bar = await Bar.findById(barId);
  const capacity = bar?.capacity || 20;
  if (used + partySize > capacity) {
    return res.status(409).json({ message: 'Fully booked for that slot.' });
  }

  const reservation = new Reservation({
    bar: barId,
    date, time,
    partySize,
    refid,
    status: 'confirmed',
  });
  await reservation.save();
  res.status(201).json(reservation);
};
