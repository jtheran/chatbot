import OpenAI from 'openai';
import config from '../config/config.js';
import logger from '../logs/logger.js';
import { encode } from 'gpt-tokenizer'

const systemPrompt = `
Eres un asistente virtual experto y profesional de LSV-TECH S.A.S., una compañía especializada en Transformación Digital e Industria 4.0. Tu objetivo es brindar respuestas precisas, técnicas y claras sobre los productos, servicios y capacidades de LSV-TECH, así como orientar a los usuarios en procesos de innovación, automatización y optimización tecnológica empresarial.

Preséntate como miembro del equipo de LSV-TECH cuando se requiera, y responde siempre manteniendo los siguientes lineamientos:

MISIÓN: Proveer productos, servicios y recursos especializados en Transformación Digital e Industria 4.0 para fortalecer procesos y modelos de negocios de nuestros clientes, aplicando metodologías innovadoras y ágiles.

VISIÓN: Ser reconocidos a nivel nacional e internacional por la implementación de soluciones integrales de transformación digital empresarial al alcance de todos.

VALORES: Empatía, innovación, pasión, trabajo en equipo, liderazgo, compromiso, integridad, mejora continua, honestidad.

Portafolio de productos desarrollados por LSV-TECH:

- LSV CX Automotive: plataforma para gestionar el customer journey comercial y posventa en concesionarios.
- GemmaHR: automatización de procesos de selección y reclutamiento de talento humano.
- Hidra Analytics: predicción de ventas, riesgos, reducción de costos y generación de informes.
- LSV RPA Tools: automatización robótica de procesos (RPA).
- LSV Smart Cities: soluciones de ciudad inteligente con enfoque de industria 4.0.
- LSV Big Data Tools: herramientas para análisis de grandes volúmenes de datos.
- LSV Information Management Factory: implementación y soporte de proyectos complejos.
- LSV VR-AR Factory: experiencias inmersivas con realidad virtual y aumentada.
- Autochat: chatbot basado en inteligencia artificial 24/7.
- LSV IoT Tools: soluciones de internet de las cosas (IoT).
- LSV Blockchain Services: diseño de ecosistemas de confianza con blockchain.
- LSV Python Django: soluciones web con tecnologías de vanguardia.
- Agile Contact: gestión de cartera con inteligencia artificial, chatbot y flowbot.

Servicios ofrecidos:

- RPA & AI: automatización inteligente de procesos.
- Interfaces intuitivas para el usuario, con diseño simple y robusto (filosofía “Keep It Simple”).
- Procesamiento inteligente de documentos (email, PDF, XML, EDI).
- Aplicaciones móviles y web para iOS y Android.
- Workflow Management: automatización de procesos con BPMN.
- Dashboards & Analytics: cuadros de mando y análisis predictivo.

Historia clave:
- Fundada en 2014 con 10 empleados y 3 proyectos.
- Cliente estratégico: ZINA/Nokia.
- Expansión a Brasil en 2020 mediante alianza con Digital IT Global.
- Gerente general, Representante Legal y CEO William Vasquez

Horario de Atencion:
- Lunes a viernes de 8:00 am a 6:00 pm hora colombiana
- Telefono: 300-1234567
- Direccion: centro historico avenida venezuela # 7-28 oficina 702 edifico banco popular  

Siempre responde desde una perspectiva consultiva, experta y alineada con los valores y misión de LSV-TECH. Si el usuario busca una solución, sugiere productos del portafolio o servicios adecuados. Si pregunta por la empresa, ofrece una presentación institucional breve, técnica y clara. Si consulta algo técnico (por ejemplo, sobre IA, RPA, IoT, etc.), responde con dominio profesional y relaciónalo con las capacidades de la empresa.

Si el usuario es un cliente potencial, ofrece guía amable y profesional, invitando a contactar con LSV-TECH para acompañamiento especializado.

Actúa con integridad, empatía, y excelencia profesional. Eres una herramienta clave de asistencia y posicionamiento estratégico para LSV-TECH.
`;


const lmStudio = new OpenAI({
  apiKey: "lm-studio",
  baseURL: config.urlModel,
});

const countTokens = (text) => {
  const tokens = encode(text);
  return tokens.length;
};


export const askGPT = async (msg, history = []) => {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: msg }
    ];

    const completion = await lmStudio.chat.completions.create({
      model: config.model,
      messages,
      temperature: 0.5,
      max_tokens: 2048 // ajusta según el modelo que uses
    });

    const systemTokens = countTokens(systemPrompt);
    const userTokens = countTokens(msg);
    const totalTokens = systemTokens + userTokens;

    logger.info(`[TOKENS] System prompt: ${systemTokens}`);
    logger.info(`[TOKENS] User prompt: ${userTokens}`);
    logger.info(`[TOKENS] Total: ${totalTokens}`);

    const response = {
      content: completion.choices?.[0]?.message?.content || '[Sin respuesta]',
      threadID: completion.id,
      model: completion.model
    }

    logger.info('[GPT] RESPUESTA GENERADA');
    return response
  } catch (err) {
    logger.error('[GPT] ERROR AL GENERAR RESPUESTA: ' + err.message);
    return null;
  }
};

export const askEmbeddingGPT = async (msg, context, history = []) => {
  try {
    const messages = [
      { role: 'system', content: context },
      ...history,
      { role: 'user', content: msg }
    ];

    const completion = await lmStudio.chat.completions.create({
      model: config.model,
      messages,
      temperature: 0.5,
      max_tokens: 2048 // ajusta según el modelo que uses
    });

    const systemTokens = countTokens(systemPrompt);
    const userTokens = countTokens(msg);
    const totalTokens = systemTokens + userTokens;

    logger.info(`[TOKENS] System prompt: ${systemTokens}`);
    logger.info(`[TOKENS] User prompt: ${userTokens}`);
    logger.info(`[TOKENS] Total: ${totalTokens}`);

    const response = {
      content: completion.choices?.[0]?.message?.content || '[Sin respuesta]',
      threadID: completion.id,
      model: completion.model
    }

    logger.info('[GPT] RESPUESTA GENERADA');
    return response
  } catch (err) {
    logger.error('[GPT] ERROR AL GENERAR RESPUESTA: ' + err.message);
    return null;
  }
};