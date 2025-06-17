import pkg from 'whatsapp-web.js';
import fs from 'fs';
import mime from 'mime-types';
import qrcode from 'qrcode';
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
import path from 'path';
import logger from '../logs/logger.js';
import { askGPT } from '../utils/gpt.js';


const MONGO_URI = process.env.DATABASE_URL;
await mongoose.connect(MONGO_URI);

const storeMongo = new MongoStore({ mongoose: mongoose });
const { Client, RemoteAuth, MessageMedia } = pkg;
let isClientReady = true;


export const client = new Client({
    authStrategy: new RemoteAuth({ 
        store: storeMongo,
        backupSyncIntervalMs: 500000,
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    
});

client.on('qr', async (qr) => {
    logger.info('[QR] Generando imagen del QR...');
    const qrPath = path.join('public', 'qr.png');
    await qrcode.toFile(qrPath, qr);
    logger.info(`[QR] Imagen generada en ${qrPath}`);
});

client.on('ready', () => {
    isClientReady = true;
    logger.warn('[WHATSAPP] session started.....');
    logger.info('[WHATSAPP] ✅ SESSION STARTED');
});

client.on('disconnected', async (reason) => {
    isClientReady = false;
    logger.warn(`[WHATSAPP] ❌ Desconectado: ${reason}`);
    try {
        await client.destroy();
        await client.initialize();
    } catch (err) {
        logger.error(`[WHATSAPP] Error reiniciando cliente: ${err.message}`);
    }
});

client.on('auth_failure', (msg) => {
    logger.error(`[WHATSAAP] AUTENTICATION ERROR: ${msg}`);
    isClientReady = false;
});

if (!isClientReady) {
    logger.error('[WHATSAPP] Client no está listo para enviar mensajes');
    throw new Error();
}

client.on('message', async (msg) => {
    const MAX_CHUNK = 4000;
    const userMSG = msg.body;
    const answer = await askGPT(userMSG);
    console.log(answer.content.length);
    const responseChunks = answer.content.match(new RegExp(`.{1,${MAX_CHUNK}}`, 'g'));

    for (const chunk of responseChunks) {
        await msg.reply(chunk);
    }
});


export const sendMessage = async (number, message) => {
    try{
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        const isRegistered = await client.isRegisteredUser(chatId);

        if(!isRegistered){
            logger.warn(`[WHATSAPP] # ${number} NO ESTA REGISTRADO EN WHATSAAP`)
            return res.status(400).json({ msg: `# ${number} NO ESTA REGISTRADO EN WHATSAAP` });
        }

        await client.sendMessage(chatId, message);
        logger.info(`[WHATSAPP] mensaje enviado a ${number}`)
    }catch(err){
        logger.error(`[WHATSAPP] Error enviando mensaje: ${err.message}`);
        throw new Error(); 
    }
};

export const sendMessageMediaWSP = async (number, file, message = '') => {
    try{
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        const isRegistered = await client.isRegisteredUser(chatId);
        const filePath = path.join(file.destination, file.filename);

        if(!isRegistered){
            logger.warn(`[WHATSAPP] # ${number} NO ESTA REGISTRADO EN WHATSAAP`)
            return res.status(400).json({ msg: `# ${number} NO ESTA REGISTRADO EN WHATSAAP` });
        }
        // Leer el archivo y convertirlo a base64
        const fileBuffer = fs.readFileSync(filePath, { encoding: 'base64' });
        const mimeType = mime.lookup(filePath); // tipo MIME
        const base64File = fileBuffer.toString('base64');

        const media = new MessageMedia(mimeType, base64File, file.originalname);

        // Enviar el archivo y mensaje opcional
        await client.sendMessage(chatId, media, { caption: message });

        logger.info(`[WHATSAPP] Archivo enviado a ${number}`);
    }catch(err){
        logger.error(`[WHATSAPP] Error enviando archivo: ${err.message}`);
        throw new Error();
    }
};
