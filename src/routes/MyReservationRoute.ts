import express from "express";
import Reservation from "../models/reservation";
import User        from "../models/user";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { cancelReservation } from "../controllers/ReservationController";

const router = express.Router();

// GET /api/my/reservations
router.get(
  "/",
  jwtCheck,
  jwtParse,
  async (req, res) => {
    // req.auth.payload.sub comes from jwtParse
    const auth0Sub = req.auth!.payload.sub;

    const user = await User.findOne({ auth0Id: auth0Sub });
    if (!user) return res.status(404).json({ message: "User not found" });

    const myReservations = await Reservation.find({ user: user._id })
      .populate("bar", "name location")
      .sort({ createdAt: -1 });

    return res.json(myReservations);
  }
);


router.patch(
  '/:reservationId/reschedule',
  jwtCheck, jwtParse,
  async (req, res) => {
    const userId = req.userId!;
    const { reservationId } = req.params;
    const { date, time, partySize } = req.body as {
      date?: string;
      time?: string;
      partySize?: number;
    };

    // very minimal: no availability re-check here
    const updated = await Reservation.findOneAndUpdate(
      { _id: reservationId, user: userId, status: 'confirmed' },
      { ...(date && { date }), ...(time && { time }), ...(partySize && { partySize }) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Reservation not found or not editable' });
    }
    return res.json(updated);
  }
);

// existing cancel:
router.patch('/:reservationId/cancel', jwtCheck, jwtParse, cancelReservation);


export default router;
