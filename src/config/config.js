import dotenv from 'dotenv';

dotenv.config();


const config = {

    port: process.env.PORT || '9999',
    secret: process.env.SECRET || 'zaqwer',
    adminEmail: process.env.EMAILADMIN || 'admin@admin.com',
    adminPass: process.env.PASSADMIN || 'Admin123!',
    adminEmailPass: process.env.PASSEMAILADMIN || 'Testing24@',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    adminPhone: process.env.ADMINPHONE || '+573001234567',
    urlDB: process.env.DATABASE_URL || 'mongodb://localhost:27017/LAWDB?replicaSet=rs0',
    keyGPT: process.env.OPENAI_API_KEY || '',
    urlModel: process.env.IA_MODEL_URL || 'http:localhost:1234',
    model: process.env.IA_MODEL || 'chatgpt',

}

export default config;