import type { Request, Response, NextFunction } from "express";
import {
  CreateMessageBody,
  CreateMessageParams,
  DeleteMessageParams,
  GetMessagesParams,
  GetMessagesQuery,
} from "../schemas/message.schema";
import {
  createMessage,
  deleteMessage,
  getMessages,
} from "../services/message.service";
import { is } from "drizzle-orm";
import { BadRequestError } from "../errors";

export async function createMessageHandler(
  req: Request<CreateMessageParams, {}, CreateMessageBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { content } = req.body;
    const { conversationId } = req.params;
    const userId = req.user!.id as string;

    const messageDetails = await createMessage(content, conversationId, userId);

    res.status(201).json({
      message: "Message created successfully",
      messageDetails,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMessagesHandler(
  req: Request<GetMessagesParams, {}, {}, GetMessagesQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const { conversationId } = req.params;
    const { limit, cursor } = req.query;
    const parsedLimit = parseInt(limit);

    // We couldn't validate the limit in the schema due to req.query being typed as string by Express, so we need to validate it here
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      throw new BadRequestError("Limit must be a number between 1 and 50");
    }

    const result = await getMessages(conversationId, parsedLimit, cursor);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
export async function deleteMessageHandler(
  req: Request<DeleteMessageParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { conversationId, messageId } = req.params;

    await deleteMessage(conversationId, messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
}
