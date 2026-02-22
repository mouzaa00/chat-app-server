import type { Request, Response } from "express";
import {
  createFriendRequest,
  deleteFriend,
  getFriendRequests,
  getFriends,
  isExistingFriendRequest,
  isRecipientSentRequest,
  updateFriendRequest,
} from "../services/friend.service";
import {
  CreateFriendRequestBody,
  DeleteFriendParams,
  UpdateFriendRequestBody,
  UpdateFriendRequestParams,
} from "../schemas/friend.schema";
import { getUserByEmail } from "../services/user.service";

export async function getFriendRequestsHanlder(req: Request, res: Response) {
  try {
    const userId = req.user!.id as string;

    const friendRequests = await getFriendRequests(userId);

    res.json({ friendRequests });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function createFriendRequestHandler(
  req: Request<{}, {}, CreateFriendRequestBody>,
  res: Response
) {
  try {
    const senderId = req.user!.id as string;
    const { email } = req.body;

    const recipient = await getUserByEmail(email);
    if (!recipient) {
      res.status(404).json({ message: "User does not exits!" });
      return;
    }

    if (recipient.id === senderId) {
      res
        .status(400)
        .json({ message: "You can not send a friend request to yourself!" });
      return;
    }

    const PendingFriendRequestExists = await isExistingFriendRequest(
      senderId,
      recipient.id,
      "pending"
    );
    if (PendingFriendRequestExists) {
      res
        .status(409)
        .json({ message: `You Already sent a request to ${recipient.name}` });
      return;
    }

    const isFriend = await isExistingFriendRequest(
      senderId,
      recipient.id,
      "accepted"
    );
    if (isFriend) {
      res.status(409).json({
        message: `${recipient.name} is already a friend`,
      });
      return;
    }

    const recipientSentRequest = await isRecipientSentRequest(
      recipient.id,
      senderId
    );
    if (recipientSentRequest) {
      res.status(409).json({
        message: `${recipient.name} already sent you a friend request`,
      });
      return;
    }

    await createFriendRequest(senderId, recipient.id);

    res.status(201).json({ message: "Friend request sent!" });
  } catch {
    res.status(500).json({ message: "Server error!" });
  }
}

export async function updateFriendRequestHandler(
  req: Request<UpdateFriendRequestParams, {}, UpdateFriendRequestBody>,
  res: Response
) {
  try {
    const { friendRequestId } = req.params;
    const { status } = req.body;
    await updateFriendRequest(friendRequestId, status);

    res.json({ message: `Friend request ${status}!` });
  } catch {
    res.status(500).json({ message: "Server error!" });
  }
}

export async function deleteFriendHandler(
  req: Request<DeleteFriendParams>,
  res: Response
) {
  try {
    const { friendId } = req.params;
    const userId = req.user!.id as string;

    await deleteFriend(userId, friendId);

    res.json({ message: "Friend deleted successfully!" });
  } catch {
    res.status(500).json({ message: "Server error!" });
  }
}

export async function getFriendsHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.id as string;
    const friends = await getFriends(userId);

    res.json({ friends });
  } catch {
    res.status(500).json({ message: "Server error!" });
  }
}
