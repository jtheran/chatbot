import { Router } from 'express';
import passport from 'passport';
import upload from '../libs/multer.js';
import { sendMessageWSP, sendMessageMedia }  from '../controller/wsp.controller.js';
import authorizeRoles from '../middlewares/auth.js';

const router = Router();

router.post('/wsp', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), sendMessageWSP);

router.post('/wsp-file', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), upload.single('file'), sendMessageMedia);

export default router;