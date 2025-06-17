import { Router } from 'express';
import passport from 'passport';
import { handleIncomingMessage } from '../controller/ia.controller.js';
import authorizeRoles from '../middlewares/auth.js';

const router = Router();

router.post('/ia-message', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), handleIncomingMessage);

export default router;