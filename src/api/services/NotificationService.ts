/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static markNotifications(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/notifications',
        });
    }

    /**
     * Delete Notification
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteNotification(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/me/notifications/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
