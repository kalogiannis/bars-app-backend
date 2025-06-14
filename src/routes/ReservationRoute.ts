
import express from 'express';
import { cancelReservation, checkAvailability, createReservation } from '../controllers/ReservationController';
import {
  validateCheckAvailabilityRequest,
  validateCreateReservationRequest
} from '../middleware/validation';
import { jwtCheck, jwtParse } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

router.get(
  '/availability',
  validateCheckAvailabilityRequest,
  checkAvailability
);

router.post(
  '/',
    jwtCheck,                 
  jwtParse,               
  validateCreateReservationRequest,
  createReservation
);



router.patch(
  '/:reservationId/cancel',
  jwtCheck,
  jwtParse,
  cancelReservation
);
export default router;

