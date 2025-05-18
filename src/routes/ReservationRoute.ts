
import express from 'express';
import { checkAvailability, createReservation } from '../controllers/ReservationController';
import {
  validateCheckAvailabilityRequest,
  validateCreateReservationRequest
} from '../middleware/validation';
import { jwtCheck, jwtParse } from '../middleware/auth';

// Enable merged params so `barId` from the parent mount is visible here
const router = express.Router({ mergeParams: true });

// GET /api/bar/:barId/reservations/availability
router.get(
  '/availability',
  validateCheckAvailabilityRequest,
  checkAvailability
);

// POST /api/bar/:barId/reservations
router.post(
  '/',
    jwtCheck,               // 1) verify JWT signature  
  jwtParse,               // 2) attach user info to req  
  validateCreateReservationRequest,
  createReservation
);

export default router;
