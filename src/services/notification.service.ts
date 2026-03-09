// Notification Service Layer
// Business logic for user notifications

import { prisma } from '@/lib/prisma';
import { ServiceResponse } from './types';

type NotificationType =
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_CANCELLED'
  | 'REGISTRATION_CONFIRMED'
  | 'EVENT_REMINDER'
  | 'GENERAL';

// Create notification
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  eventId?: string
): Promise<ServiceResponse> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        eventId,
      },
    });

    return {
      success: true,
      data: notification,
    };
  } catch (error) {
    console.error('Create notification error:', error);
    return {
      success: false,
      error: 'Failed to create notification',
    };
  }
}

// Get user's notifications
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<ServiceResponse> {
  try {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    return {
      success: false,
      error: 'Failed to fetch notifications',
    };
  }
}

// Mark notification as read
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<ServiceResponse> {
  try {
    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return {
        success: false,
        error: 'Notification not found',
      };
    }

    if (notification.userId !== userId) {
      return {
        success: false,
        error: 'You are not authorized to update this notification',
      };
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return {
      success: true,
      data: updatedNotification,
    };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return {
      success: false,
      error: 'Failed to mark notification as read',
    };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<ServiceResponse> {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      data: { message: 'All notifications marked as read' },
    };
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return {
      success: false,
      error: 'Failed to mark all notifications as read',
    };
  }
}

// Delete notification
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<ServiceResponse> {
  try {
    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return {
        success: false,
        error: 'Notification not found',
      };
    }

    if (notification.userId !== userId) {
      return {
        success: false,
        error: 'You are not authorized to delete this notification',
      };
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return {
      success: true,
      data: { message: 'Notification deleted' },
    };
  } catch (error) {
    console.error('Delete notification error:', error);
    return {
      success: false,
      error: 'Failed to delete notification',
    };
  }
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<ServiceResponse> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    console.error('Get unread count error:', error);
    return {
      success: false,
      error: 'Failed to get unread count',
    };
  }
}

// Notify event participants (for event updates/cancellations)
export async function notifyEventParticipants(
  eventId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<ServiceResponse> {
  try {
    // Get all registered users for the event
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      select: { userId: true },
    });

    // Create notifications for all participants
    const notifications = await prisma.notification.createMany({
      data: registrations.map((reg) => ({
        userId: reg.userId,
        eventId,
        type,
        title,
        message,
      })),
    });

    return {
      success: true,
      data: { count: notifications.count },
    };
  } catch (error) {
    console.error('Notify event participants error:', error);
    return {
      success: false,
      error: 'Failed to notify event participants',
    };
  }
}
