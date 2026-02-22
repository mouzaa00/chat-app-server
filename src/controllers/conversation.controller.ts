import { Request, Response } from "express";
import {
  createConversation,
  createConversationMessage,
  getConversationById,
  getConversations,
  getExistingConversation,
} from "../services/conversation.service";
import { log } from "../logger";
import {
  CreateConversationBody,
  CreateConversationMessageBody,
  CreateConversationMessageParams,
} from "../schemas/conversation.schema";

export async function createConversationHandler(
  req: Request<{}, {}, CreateConversationBody>,
  res: Response
) {
  try {
    const creatorId = req.user!.id as string;
    const recipientId = req.body.recipientId;

    const existingConversation = await getExistingConversation(
      creatorId,
      recipientId
    );
    if (existingConversation) {
      res.status(409).json({
        message: "Conversation already exits",
        conversation: existingConversation,
      });
      return;
    }

    const conversation = await createConversation(creatorId, recipientId);

    res
      .status(201)
      .json({ message: "Conversation created successfully", conversation });
  } catch (err: any) {
    log.error(`Database error: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createConversationMessageHandler(
  req: Request<
    CreateConversationMessageParams,
    {},
    CreateConversationMessageBody
  >,
  res: Response
) {
  const { content } = req.body;
  const { conversationId } = req.params;
  const userId = req.user!.id as string;

  if (!conversationId) {
    res.json({ message: "Conversation id not provided" });
    return;
  }
  await createConversationMessage(content, conversationId, userId);

  res.status(201).json({ message: "Message created successfully" });
}

export async function getConversationsHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.id as string;
    const conversations = await getConversations(userId);

    res.json({ conversations });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getConversationByIdHandler(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      res.status(400).json({ message: "conversationId param required" });
      return;
    }

    const conversation = await getConversationById(conversationId);

    res.json(conversation);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
