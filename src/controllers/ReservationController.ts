
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Reservation from '../models/reservation';
import Bar from '../models/bar';

export const checkAvailability = async (req: Request, res: Response) => {
  const { barId } = req.params;
  const { date, time, partySize } = req.query as Record<string,string>;
  const existing = await Reservation.aggregate([
    { $match: { bar: new mongoose.Types.ObjectId(barId), date, time, status: 'confirmed' }},
    { $group: { _id: null, sum: { $sum: '$partySize' } } }
  ]);
  const used = (existing[0]?.sum || 0);
  
  const bar = await Bar.findById(barId);
  const capacity = bar?.capacity || 20;       
  const freeSeats = capacity - used;

  res.json({ freeSeats, isAvailable: freeSeats >= Number(partySize) });
};

export const createReservation = async (req: Request, res: Response) => {
  const { barId } = req.params;
  const { date, time, partySize, refid } = req.body;
  const userId = req.userId!; 
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
    user: userId, 
  });
  await reservation.save();
  res.status(201).json(reservation);
};





export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;                  // from jwtParse
    const { reservationId } = req.params;
    const { reason } = req.body as { reason?: string };

    const reservation = await Reservation.findOneAndUpdate(
      { _id: reservationId, user: userId, status: { $ne: 'cancelled' } },
      {
        status: 'cancelled',
        cancelReason: reason || undefined,
        cancelledAt: new Date(),
      },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Not found or already cancelled' });
    }
    return res.json(reservation);
  } catch (err) {
    return res.status(400).json({ message: 'Error cancelling reservation' });
  }
};



