const Chat = require('../models/Chat');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.createChat = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get response from OpenAI first
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: message }],
            temperature: 0.7,
            max_tokens: 500
        });

        const botResponse = completion.choices[0].message.content;

        // Save both messages to database
        const userMessage = new Chat({
            role: 'user',
            content: message
        });
        
        const botMessage = new Chat({
            role: 'assistant',
            content: botResponse
        });

        await Promise.all([
            userMessage.save(),
            botMessage.save()
        ]);

        res.json({ response: botResponse });
    } catch (error) {
        console.error('Error in chat controller:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const history = await Chat.find().sort({ timestamp: 1 });
        res.json(history);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 