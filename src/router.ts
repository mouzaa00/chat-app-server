import { Router } from "express";
import { validateRequest } from "./middleware/validateRequest";
import {
  loginHandler,
  logoutHandler,
  refreshToken,
  registerHandler,
} from "./controllers/auth.controller";
import { loginSchema, registerSchema } from "./schemas/auth.schema";
import { authenticateToken } from "./middleware/authenticateToken";
import { getUserProfile } from "./controllers/user.controller";
import {
  createConversationMessageSchema,
  createConversationSchema,
} from "./schemas/conversation.schema";
import {
  createConversationHandler,
  createConversationMessageHandler,
  getConversationByIdHandler,
  getConversationsHandler,
} from "./controllers/conversation.controller";
import {
  createFriendRequestHandler,
  deleteFriendHandler,
  getFriendRequestsHanlder,
  getFriendsHandler,
  updateFriendRequestHandler,
} from "./controllers/friend.controller";
import {
  updateFriendRequestSchema,
  createFriendRequestSchema,
  deleteFriendSchema,
} from "./schemas/friend.schema";

const router = Router();

/**
 * Authentication resource
 */
router.post("/auth/register", validateRequest(registerSchema), registerHandler);
router.post("/auth/login", validateRequest(loginSchema), loginHandler);
router.post("/auth/logout", authenticateToken, logoutHandler);
router.post("/auth/refresh", refreshToken);

/**
 *  Users resource
 */
router.get("/users/me", authenticateToken, getUserProfile);

/**
 * Friend requests routes
 */
router.get("/friend-requests", authenticateToken, getFriendRequestsHanlder);
router.post(
  "/friend-requests",
  authenticateToken,
  validateRequest(createFriendRequestSchema),
  createFriendRequestHandler
);
router.patch(
  "/friend-requests/:friendRequestId",
  authenticateToken,
  validateRequest(updateFriendRequestSchema),
  updateFriendRequestHandler
);

/**
 * Friend requests routes
 */
router.get("/friends", authenticateToken, getFriendsHandler);
router.delete(
  "/friends/:friendId",
  authenticateToken,
  validateRequest(deleteFriendSchema),
  deleteFriendHandler
);

/**
 * Conversations routes
 */
router.get("/conversations", authenticateToken, getConversationsHandler);
router.get(
  "/conversations/:conversationId",
  authenticateToken,
  getConversationByIdHandler
);

router.post(
  "/conversations",
  authenticateToken,
  validateRequest(createConversationSchema),
  createConversationHandler
);

router.post(
  "/conversations/:conversationId/messages",
  authenticateToken,
  validateRequest(createConversationMessageSchema),
  createConversationMessageHandler
);

export default router;
