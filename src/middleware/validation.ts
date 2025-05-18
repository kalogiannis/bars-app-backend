

import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors,
];


export const validateBarRequest = [
  body('name').isString().notEmpty().withMessage('Name must be a string'),
  body('city').isString().notEmpty().withMessage('City must be a string'),
  body('description').isString().notEmpty().withMessage('Description must be a string'),
  body('location').isString().notEmpty().withMessage('Location must be a string'),
  body('country').isString().notEmpty().withMessage('Country must be a string'),
  body('openingHours').isString().notEmpty().withMessage('Opening hours must be a string'),
  handleValidationErrors
];


export const validateCheckAvailabilityRequest = [
  param('barId').isMongoId().withMessage('Invalid Bar ID'),
  query('date').isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
  query('time').matches(/^\d\d:\d\d$/).withMessage('Invalid time format (HH:MM)'),
  query('partySize').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
  handleValidationErrors,
];

export const validateCreateReservationRequest = [
  param('barId').isMongoId().withMessage('Invalid Bar ID'),
  body('date').isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
  body('time').matches(/^\d\d:\d\d$/).withMessage('Invalid time format (HH:MM)'),
  body('partySize').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
  body('refid').isUUID().withMessage('Invalid UUID format for refid'),
  handleValidationErrors,
];