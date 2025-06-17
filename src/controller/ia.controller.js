import axios from 'axios';
import pkg from '@prisma/client';
import { client } from '../services/wsp.js';
import logger from '../logs/logger.js';
import { askGPT } from '../utils/gpt.js'

const { PrismaClient } = pkg;
const prisma = new PrismaClient();


export const handleIncomingMessage = async (req, res) => {
    const { from, message } = req.body;

    try {
        if(!from || !message){
            logger.warn('[SERVER] DATOS INCOMPLETOS O NO RECIBIDOS!!!!');
            return res.status(400).json({msg: 'DATOS INCOMPLETOS O NO RECIBIDOS' });
        }
        const response = await askGPT(message);

        if(!response){
            logger.warn('[GPT] NO HUBO RESPUESTA POR PARTE DEL CAHTBOT!!!!');
            return res.status(400).json({msg: 'NO HUBO RESPUESTA POR PARTE DEL CAHTBOT'});
        }

        const messageIA = await prisma.conversation.findUnique({
            where: {
                number: from,
            }
        });

        if(!messageIA){
            logger.info('[PRISMA] CONVERSACION NUEVA CON EL CHATBOT');
            await prisma.conversation.create({
                data: {
                    number: from,
                    thread: response.threadID,
                    model: response.model,
                }
            });
        }

        logger.info('[GPT] CONVERSACION ENCONTRADA!!!!!');
        return res.status(200).json({msg: 'CONVERSACION ENCONTRADA', reply: response.content, thread_id: response.threadID });

        // try{
        //     await client.sendMessage(from, message);
        // }catch(err){
        //     logger.error('[WTP] MENSAJE NO ENVIADO VIA WAHTSAPP');
        //     return res.status(400).json({msg: 'MENSAJE NO ENVIADO VIA WAHTSAPP'});
        // }
        
        // logger.info('[GPT] MENSAJE ENVIADO CORRECTAMENTE VIA WHATSAPP!!!!!!');
        // return res.status(200).json({ success: true, msg: 'MENSAJE ENVIADO CORRECTAMENTE VIA WHATSAPP' });
    } catch (err) {
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: '+err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR' });
    }
};