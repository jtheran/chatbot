import jwt from '../libs/jwt.js';
import pkg from '@prisma/client';
import logger from '../logs/logger.js';
import { encryptPass, matchPass } from '../libs/hash.js';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();


export const login = async (req, res) => {
    try{

        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            logger.info('[PRISMA] El correo no existe')
            return res.status(401).json({ msg: 'Correo o contraseña incorrectos' });
        }

        const ismatch = matchPass(user.password, password);
        if (!ismatch) {
            logger.warn('[PRISMA] Contraseña incorrecta')
            return res.status(401).json({ msg: 'Correo o contraseña incorrectos' });
        }
        
        const token = jwt(user);

        logger.info('[AUTH] LOGUEADO CORRECTAMENTE!!!');
        return res.status(200).json({msg: 'LOGUEADO CORRECTAMENTE', access_token: token});
    }catch(err){
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR'});
    }
};

export const logout = (req, res) => {
    try{
        res.header('Autorization', '').status(200).json({msg: 'HA SIDO DESLOGUEADO!!!'});
        logger.info('Usuario deslogueado');

    }catch(err){
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR'});
    }
};

export const register = async (req, res) => {
    try{
        
        const { name, email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            logger.info('[PRISMA] El correo ya está registrado')
            return res.status(400).json({ msg: 'El correo ya está registrado' });
        }

        const hashedPassword = await encryptPass(password);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: 'USER' }
        });

        if(!user){
            logger.info('[PRISMA] Error al crear el usuario')
            return res.status(400).json({ msg: 'Error al crear el usuario' });
        }

        

        logger.info(`[PRISMA] Usuario registrado: ${email}`);
        return res.status(201).json({ msg: 'Usuario registrado exitosamente'});

    }catch(err){
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR'});
    }
};


