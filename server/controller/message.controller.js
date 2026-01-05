import Message from "../models/message.model.js";
import Conversation from "../models/Conversation.model.js";

export const listMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Load messages failed" });
  }
};
