import logger from '../logs/logger.js';
import { sendMessage, sendMessageMediaWSP } from '../services/wsp.js';


export const sendMessageMedia = async (req, res) => {
    try{
        const { number, message } = req.body;
        const file = req.file;

        if(!number || !file){
            logger.warn('[WHATSAPP] Número y archivo son requeridos.')
            return res.status(400).json({ msg: 'Número y archivo son requeridos.' });
        }

        await sendMessageMediaWSP(number, file, message);
        return res.status(200).json({msg: 'MENSAJE CON ADJUNTO ENVIADO EXITOSAMENTE'});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const sendMessageWSP = async (req, res) => {
    try{
        const { number, message } = req.body;
        if(!number || !message){
            logger.warn('[WHATSAPP] Número y mensaje son requeridos.')
            return res.status(400).json({ msg: 'Número y mensaje son requeridos.' });
        }

        await sendMessage(number, message);
        logger.info('[WHATSAPP] MENSAJE ENVIADO EXITOSAMENTE!!!!');
        return res.status(200).json({msg: 'MENSAJE ENVIADO EXITOSAMENTE'});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}