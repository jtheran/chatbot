import { Router } from 'express';
import passport from 'passport';
import { login, logout, register } from '../controller/auth.controller.js';
import loginLimiter from '../utils/ratelimiter.js';
import authorizeRoles from '../middlewares/auth.js';

const router = Router();

router.post('/login',login);

router.get('/logout', passport.authenticate('jwt', { session: false}), logout);

router.post('/register', authorizeRoles('ADMIN'), register);


export default router;