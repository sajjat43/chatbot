const Chat = require('../models/Chat');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// System message to give the AI a professional persona
const SYSTEM_MESSAGE = {
    role: 'system',
    content: `You are a professional and helpful AI assistant. 
    Your responses should be clear, concise, and accurate. 
    When appropriate, format your responses using markdown for better readability.`
};

exports.createChat = async (req, res) => {
    try {
        const { message } = req.body;
        
        // Input validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid input: Message must be a non-empty string'
            });
        }

        // Get chat history (last 5 messages for context)
        const chatHistory = await Chat.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .lean();

        // Prepare messages for OpenAI
        const messages = [
            SYSTEM_MESSAGE,
            ...chatHistory.reverse().map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        // Get OpenAI response
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
            presence_penalty: 0.6,
            frequency_penalty: 0.5
        });

        const botResponse = completion.choices[0].message.content;

        // Save messages to database
        const [savedUserMsg, savedBotMsg] = await Promise.all([
            new Chat({
                role: 'user',
                content: message,
                metadata: {
                    ip: req.ip,
                    userAgent: req.get('user-agent')
                }
            }).save(),
            new Chat({
                role: 'assistant',
                content: botResponse,
                metadata: {
                    model: "gpt-3.5-turbo",
                    tokensUsed: completion.usage.total_tokens
                }
            }).save()
        ]);

        // Send response
        res.json({
            success: true,
            response: botResponse,
            metadata: {
                tokensUsed: completion.usage.total_tokens,
                messageId: savedBotMsg._id,
                timestamp: savedBotMsg.timestamp
            }
        });

    } catch (error) {
        console.error('Chat Controller Error:', {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        });

        // Send appropriate error response
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your request',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        
        const messages = await Chat.find()
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await Chat.countDocuments();

        res.json({
            success: true,
            data: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Chat History Error:', {
            timestamp: new Date().toISOString(),
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to retrieve chat history'
        });
    }
};

exports.clearHistory = async (req, res) => {
    try {
        await Chat.deleteMany({});
        res.json({
            success: true,
            message: 'Chat history cleared successfully'
        });
    } catch (error) {
        console.error('Clear History Error:', {
            timestamp: new Date().toISOString(),
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to clear chat history'
        });
    }
}; 