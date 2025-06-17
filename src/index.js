import adminCreate from './seed/admin.js';
import app from './server.js';
import config from './config/config.js';
import logger from './logs/logger.js';
import { client } from './services/wsp.js';
import { initSocket } from './utils/socket.js';

adminCreate().then(() => {
    app.listen(config.port, async () => {
        logger.info(`[SERVER] 🚀 Server running on port ${config.port}`);
        initSocket(app);
        await client.initialize();
    });
});