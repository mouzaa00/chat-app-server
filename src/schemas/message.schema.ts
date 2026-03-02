import z from "zod";

export const createMessageSchema = z.object({
  body: z.object({
    content: z.string({
      required_error: "A message is required",
    }),
  }),
  params: z.object({
    conversationId: z.string({
      required_error: "A conversation ID is required",
    }),
  }),
});

export type CreateMessageBody = z.infer<typeof createMessageSchema.shape.body>;

export type CreateMessageParams = z.infer<
  typeof createMessageSchema.shape.params
>;

export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string({
      required_error: "A conversation ID is required",
    }),
  }),
  query: z.object({
    limit: z.string().default("20"),
    cursor: z.string().optional(),
  }),
});

export type GetMessagesParams = z.infer<typeof getMessagesSchema.shape.params>;
export type GetMessagesQuery = z.infer<typeof getMessagesSchema.shape.query>;

export const deleteMessageSchema = z.object({
  params: z.object({
    conversationId: z.string({
      required_error: "A conversation ID is required",
    }),
    messageId: z.string({
      required_error: "A message ID is required",
    }),
  }),
});

export type DeleteMessageParams = z.infer<
  typeof deleteMessageSchema.shape.params
>;
