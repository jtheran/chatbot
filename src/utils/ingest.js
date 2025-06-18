import fs from "fs";
import { embedder, qdrant } from "../libs/embedding.js"
import logger from '../logs/logger.js';
import path from "path";

async function ingest(folder){
    try{
        const collection = folder;
        await qdrant.createCollection({
            collection_name: collection,
            vector_size: 384,
            distance: "Cosine",
        }).then((e) => {
            logger.info('[EMBEDDING] COLECCION DE DOCUMENTOS CREADA EXITOSAMENTE: '+e.valueOf());
        }).catch((err) => {
            logger.error('[EMBEDDING] ERROR AL CREAR LA COLECCION: '+err.message);
            new Error('ERROR AL CREAR LA COLECCION: '+err.message)
        });

        let id = 1;
        const files = fs.readdirSync(folder);
        for (const file of files) {
            const text = fs.readFileSync(path.join(folder, file), "utf8");
            const chunks = text.match(/(.|[\r\n]){1,1000}/g);
            for (const chunk of chunks) {
            const [vector] = await embedder.queryEmbed(chunk);
            await qdrant.points.upsert({
                collection_name: collection,
                points: [{ id: id++, vector, payload: { source: file, text: chunk } }],
            });
            }
        }
        logger.info(`[EMBEDDING] Ingestados: ${id - 1} fragmentos`);
    }catch(err){

    }
}

ingest("./post");
