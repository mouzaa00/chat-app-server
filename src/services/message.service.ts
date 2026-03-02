import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "../db";
import { messagesTable, usersTable } from "../db/schema";

export async function createMessage(
  content: string,
  conversationId: string,
  senderId: string
) {
  const [message] = await db
    .insert(messagesTable)
    .values({
      content,
      conversationId,
      senderId,
    })
    .returning();

  return message;
}

export async function getMessages(
  conversationId: string,
  limit: number,
  cursor?: string
) {
  const [cursorMessage] = cursor
    ? await db
        .select({ createdAt: messagesTable.createdAt })
        .from(messagesTable)
        .where(eq(messagesTable.id, cursor))
    : [];

  const messages = await db
    .select({
      id: messagesTable.id,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
      updatedAt: messagesTable.updatedAt,
      sender: {
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      },
    })
    .from(messagesTable)
    .where(
      cursorMessage
        ? and(
            eq(messagesTable.conversationId, conversationId),
            lt(messagesTable.createdAt, cursorMessage.createdAt)
          )
        : eq(messagesTable.conversationId, conversationId)
    )
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit + 1) // fetch one extra message to check if there are more
    .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id));

  const hasMore = messages.length > limit;
  const data = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? data[data.length - 1]!.id : null;

  return { data, hasMore, nextCursor };
}

export async function deleteMessage(conversationId: string, messageId: string) {
  await db
    .delete(messagesTable)
    .where(
      and(
        eq(messagesTable.id, messageId),
        eq(messagesTable.conversationId, conversationId)
      )
    );
}
