/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationRead } from "../models/NotificationRead";
import type { NotificationUpdate } from "../models/NotificationUpdate";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class NotificationService {
  /**
   * Read Notifications
   * @returns NotificationRead Successful Response
   * @throws ApiError
   */
  public static readNotifications(): CancelablePromise<
    Array<NotificationRead>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/me/notifications",
    });
  }

  /**
   * Mark Notifications
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public static markNotifications(
    requestBody: Array<NotificationUpdate>,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/users/me/notifications",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Notification
   * @param notificationId
   * @returns any Successful Response
   * @throws ApiError
   */
  public static deleteNotification(
    notificationId: number,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/users/me/notifications/{notification_id}",
      path: {
        notification_id: notificationId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Send Notifications
   * @param title
   * @param description
   * @param requestBody
   * @param xGraphToken
   * @returns any Successful Response
   * @throws ApiError
   */
  public static sendNotifications(
    title: string,
    description: string,
    requestBody: Array<string>,
    xGraphToken?: string,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/users/notifications",
      headers: {
        "x-graph-token": xGraphToken,
      },
      query: {
        title: title,
        description: description,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
