import axios from 'axios';
import pkg from '@prisma/client';
import { sendMessage, sendMessageMediaWSP } from '../services/wsp.js';
import logger from '../logs/logger.js';
import { askEmbeddingGPT, askGPT } from '../utils/gpt.js'

const { PrismaClient } = pkg;
const prisma = new PrismaClient();


export const handleIncomingMessage = async (req, res) => {
    const { from, message } = req.body;
    let conversation;
    let response;

    try {
        if(!from || !message){
            logger.warn('[SERVER] DATOS INCOMPLETOS O NO RECIBIDOS!!!!');
            return res.status(400).json({msg: 'DATOS INCOMPLETOS O NO RECIBIDOS' });
        }

        const history = await prisma.conversation.findMany({
            where: {
                number: from,
            },
            include: {
                messages: true,
            }
        });

        if(!history){
            logger.warn('[GPT] NO SE ENCONTRO HISTORIAL DE CONVERSACION!!!!');
            response = await askGPT(message);
            const conversacion = await prisma.$transaction([
                prisma.conversation.create({
                    data: {
                        number: from,
                        thread: response.threadID,
                        model: response.model,
                    },
                    include: {
                        messages: true,
                    }
                }),
                prisma.message.create({
                    data: {
                        role: 'user',
                        content: message,
                        conversationNumber: from,
                    }
                }),
                prisma.message.create({
                    data: {  
                        role: 'asistent',
                        content: response.content,
                        conversationNumber: from,
                    }
                })
            ]);
        }else{
            logger.info('[GPT] HISTORIAL DE CONVERSACION ENCONTRADO!!!!!');
            response = await askGPT(message, history);
            const messages = await prisma.$transaction([
                prisma.message.create({
                    data: {
                        role: 'user',
                        content: message,
                        conversationNumber: from,
                    }
                }),
                prisma.message.create({
                    data: {
                        role: 'asistent',
                        content: response.content,
                        conversationNumber: from,
                    }
                })
            ]);
        }

        if(!response){
            logger.warn('[GPT] NO HUBO RESPUESTA POR PARTE DEL CHATBOT!!!!');
            return res.status(400).json({msg: 'NO HUBO RESPUESTA POR PARTE DEL CHATBOT'});
        }

        try{
            await sendMessage(from, message);
        }catch(err){
            logger.error('[WTP] MENSAJE NO ENVIADO VIA WAHTSAPP');
            return res.status(400).json({msg: 'MENSAJE NO ENVIADO VIA WAHTSAPP'});
        }
        
        logger.info('[GPT] MENSAJE ENVIADO CORRECTAMENTE VIA WHATSAPP!!!!!!');
        return res.status(200).json({ success: true, msg: 'MENSAJE ENVIADO CORRECTAMENTE VIA WHATSAPP' });
    } catch (err) {
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: '+err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR' });
    }
};

export const handleIncomingMessageEmbedding = async (req, res) => {
    try{
        const { from, message } = req.body;
        let conversation;
        let resp;
        const queryVec = await embedder.queryEmbed(message);
        const search = await qdrant.points.search({
            collection_name: "post",
            vector: queryVec,
            limit: 5,
        });

        const context = search.map(p => p.payload.text).join("\n---\n");
        const history = await prisma.conversation.findMany({
            where: {
                number: from,
            },
            include: {
                messages: true,
            }
        });

        if(!history){
            logger.warn('[GPT] NO SE ENCONTRO HISTORIAL DE CONVERSACION!!!!');
            response = await askEmbeddingGPT(message, context);
            const conversacion = await prisma.$transaction([
                prisma.conversation.create({
                    data: {
                        number: from,
                        thread: response.threadID,
                        model: response.model,
                    },
                    include: {
                        messages: true,
                    }
                }),
                prisma.message.create({
                    data: {
                        role: 'user',
                        content: message,
                        conversationNumber: from,
                    }
                }),
                prisma.message.create({
                    data: {  
                        role: 'asistent',
                        content: response.content,
                        conversationNumber: from,
                    }
                })
            ]);
        }else{
            logger.info('[GPT] HISTORIAL DE CONVERSACION ENCONTRADO!!!!!');
            response = await askEmbeddingGPT(message, context, history);
            const messages = await prisma.$transaction([
                prisma.message.create({
                    data: {
                        role: 'user',
                        content: message,
                        conversationNumber: from,
                    }
                }),
                prisma.message.create({
                    data: {
                        role: 'asistent',
                        content: response.content,
                        conversationNumber: from,
                    }
                })
            ]);
        }

        try{
            await sendMessage(from, resp.content);
            logger.info('[WHATSAPP] RESPUESTA DEL CHATBOT ENVIADA POR WHATSAPP!!!!!');
        }catch(err){
            logger.error('[WHATSAPP] ERROR AL ENVIAR LA RESPUESTA VIA WHATSAAP: '+err.message);
            new Error('ERROR AL ENVIAR LA RESPUESTA VIA WHATSAAP: '+err.message)
        }

        logger.info('[GPT] FLUJO DE CHATBOT COMPLETADO EXITOSAMENTE!!!!!');
        return res.status(200).json({msg: 'FLUJO DE CHATBOT COMPLETADO EXITOSAMENTE', reply: resp.content });
    }catch(err){
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: '+err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR' });
    }
}



