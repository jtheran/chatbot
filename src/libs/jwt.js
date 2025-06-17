import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../logs/logger.js';

const createToken = (payload) => {

    const token = jwt.sign(payload, config.secret,{
        expiresIn: config.expiresIn,
    });
    if(!token){
        logger.error('[AUTH] TOKEN NO FUE CREADO!!!');
        return null;
    }
    logger.info('[AUTH] TOKEN CREADO!!!');
    return token;
}

export default createToken;