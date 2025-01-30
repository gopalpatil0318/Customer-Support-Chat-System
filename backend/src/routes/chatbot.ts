import express from 'express';
import { handleChatbotMessage } from '../controllers/ChatbotController';

const chatBotRouter = express.Router();


chatBotRouter.post('/chatbot/message', handleChatbotMessage);

export default chatBotRouter;
