import { QdrantClient } from "@qdrant/js-client-rest";
import { EmbeddingModel, FlagEmbedding } from "fastembed";
import config from '../config/config.js';

export const qdrant = new QdrantClient({ 
    url: config.urlEmbedding 
});

export const embedder = await FlagEmbedding.init({
    model: EmbeddingModel.BGEBaseEN, 
});

