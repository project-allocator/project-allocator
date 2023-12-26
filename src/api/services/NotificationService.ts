/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_send_notifications } from '../models/Body_send_notifications';
import type { NotificationRead } from '../models/NotificationRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NotificationService {

    /**
     * Read Notifications
     * @returns NotificationRead Successful Response
     * @throws ApiError
     */
    public static readNotifications(): CancelablePromise<Array<NotificationRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/notifications',
        });
    }

    /**
     * Mark Notifications
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static markNotifications(
        requestBody: Array<string>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/me/notifications',
            body: requestBody,
            mediaType: 'application/json',
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
        notificationId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/me/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Send Notifications
     * @param requestBody
     * @param xGraphToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static sendNotifications(
        requestBody: Body_send_notifications,
        xGraphToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/notifications',
            headers: {
                'x-graph-token': xGraphToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
