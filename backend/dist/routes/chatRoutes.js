"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
exports.chatRouter = (0, express_1.Router)();
/**
 * @route GET /api/chats/user/:userId
 * @desc Get list of all chat rooms for a user
 */
exports.chatRouter.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const chatsRes = await db_1.db.query(`SELECT c.id, c.last_message, c.last_message_at,
              u1.full_name as partner_name, u1.profile_picture_url as partner_picture, u1.id as partner_id
       FROM chats c
       JOIN users u1 ON (c.participant_one_id = u1.id AND c.participant_two_id = $1)
                     OR (c.participant_two_id = u1.id AND c.participant_one_id = $1)
       WHERE c.participant_one_id = $1 OR c.participant_two_id = $1
       ORDER BY c.last_message_at DESC`, [userId]);
        res.status(200).json(chatsRes.rows);
    }
    catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to retrieve active chats' });
    }
});
/**
 * @route GET /api/chats/:chatId/messages
 * @desc Retrieve historical messages for a chat room
 */
exports.chatRouter.get('/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    try {
        const messagesRes = await db_1.db.query(`SELECT m.id, m.sender_id, m.text, m.attachment_url, m.attachment_type, 
              m.latitude, m.longitude, m.is_read, m.read_at, m.created_at
       FROM messages m
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`, [chatId, parseInt(limit), parseInt(offset)]);
        res.status(200).json(messagesRes.rows);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to retrieve message logs' });
    }
});
/**
 * @route POST /api/chats/create
 * @desc Initialize a chat session between Customer & Fundi
 */
exports.chatRouter.post('/create', async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        if (!senderId || !receiverId) {
            res.status(400).json({ error: 'senderId and receiverId are required' });
            return;
        }
        // Order IDs to match unique constraint (participant_one_id < participant_two_id)
        const [p1, p2] = senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];
        const chatRes = await db_1.db.query(`INSERT INTO chats (participant_one_id, participant_two_id)
       VALUES ($1, $2)
       ON CONFLICT (participant_one_id, participant_two_id) 
       DO UPDATE SET last_message_at = NOW() 
       RETURNING *`, [p1, p2]);
        res.status(200).json(chatRes.rows[0]);
    }
    catch (error) {
        console.error('Error initializing chat:', error);
        res.status(500).json({ error: 'Failed to initialize chat room' });
    }
});
