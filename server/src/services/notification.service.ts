import { Notification, INotification, NotificationModule, NotificationPriority } from "../models/Notification";
import { User } from "../models/User";
import { getIO } from "../sockets/socketManager";

interface CreateNotificationParams {
  recipientId: string;
  actorId?: string;
  workspaceId?: string;
  module: NotificationModule;
  type: string;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  priority?: NotificationPriority;
}

export class NotificationService {
  /**
   * Creates a notification for a single user, checks preferences, and emits via socket if allowed.
   */
  static async notifyUser(params: CreateNotificationParams): Promise<INotification | null> {
    try {
      const recipient = await User.findById(params.recipientId);
      if (!recipient) return null;

      // Check notification preferences for this module
      // If user has explicitly disabled inApp notifications for this module, skip
      if (recipient.notificationPreferences && recipient.notificationPreferences[params.module]) {
        const pref = recipient.notificationPreferences[params.module];
        if (pref.inApp === false) {
          return null; // Opted out of in-app notifications
        }
      }

      // Fetch actor details
      let actorDetails;
      if (params.actorId) {
        const actor = await User.findById(params.actorId);
        if (actor) {
          actorDetails = {
            _id: actor._id,
            name: actor.name,
            avatar: actor.avatar
          };
        }
      }

      const notification = await Notification.create({
        recipient: params.recipientId,
        actor: actorDetails,
        workspace: params.workspaceId,
        module: params.module,
        type: params.type,
        title: params.title,
        message: params.message,
        entityId: params.entityId,
        entityType: params.entityType,
        priority: params.priority || NotificationPriority.NORMAL,
      });

      // Emit to user's specific room
      const io = getIO();
      if (io) {
        io.to(`user:${params.recipientId}`).emit("notification:new", notification);
      }

      return notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      return null;
    }
  }

  /**
   * Creates notifications for multiple users.
   */
  static async notifyUsers(recipientIds: string[], params: Omit<CreateNotificationParams, "recipientId">) {
    const promises = recipientIds.map(recipientId => 
      this.notifyUser({ ...params, recipientId })
    );
    await Promise.all(promises);
  }
}
