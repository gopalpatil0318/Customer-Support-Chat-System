import { Request, Response } from 'express';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const handleChatbotMessage = async (req: Request, res: any) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      message: "Message is required.",
      options: ['Try Again', 'Contact Support'],
    });
  }

  try {

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful and intelligent customer service AI assistant for a multi-product platform. Your role is to assist users with Genral information or two products: Training and Placement System: Help users explore and understand features related to student placements, recruiter information, placement records, and training programs.Assist with navigation, answer questions about upcoming placement drives, and provide guidance on managing student and recruiter profiles. Task Management System: Assist users in assigning and managing tasks effectively.Provide guidance on creating, updating, and tracking tasks using the Kanban board system.Help users with task priorities, deadlines, and managing collaborative workflows for teams. Always provide concise, helpful, and accurate responses.Tailor your responses based on the user\'s product context and queries. Suggest actions, provide step-by-step instructions, or recommend features to streamline their workflow or achieve their goals efficiently.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I apologize, but I'm having trouble understanding. Could you please rephrase your question?";


    let options: string[] = [];
    if (message.toLowerCase().includes('product')) {
      options = ['View Specifications', 'Check Price', 'See Reviews'];
    } else if (message.toLowerCase().includes('order')) {
      options = ['Track Order', 'Cancel Order', 'Modify Order'];
    }

    return res.status(200).json({
      message: response,
      options,
    });
  } catch (error) {
    console.error('Error:', error);

    return res.status(500).json({
      message: "I'm sorry, but I'm having trouble processing your request right now.",
      options: ['Try Again', 'Contact Support'],
    });
  }
};
