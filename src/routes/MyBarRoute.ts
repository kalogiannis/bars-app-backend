import express from 'express'
import { jwtCheck, jwtParse } from '../middleware/auth'
import { validateBarRequest } from '../middleware/validation'
import  MyBarController from '../controllers/MyBarController'
import multer from 'multer'

const router= express.Router()

const upload = multer({ storage: multer.memoryStorage() });

router.get('/',jwtCheck,jwtParse,MyBarController.getMyBar)

router.post('/',jwtCheck,jwtParse,upload.single('imageFile'),validateBarRequest,MyBarController.createMyBar)

router.put('/',jwtCheck,jwtParse,upload.single('imageFile'),validateBarRequest,MyBarController.updateMyBar)

export default router