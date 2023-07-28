/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRead } from '../models/UserRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {

    /**
     * Read Users
     * @param role
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readUsers(
        role?: string,
    ): CancelablePromise<Array<UserRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
            query: {
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create User
     * @param xGraphToken
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static createUser(
        xGraphToken?: string,
    ): CancelablePromise<UserRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users',
            headers: {
                'x-graph-token': xGraphToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Current User
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readCurrentUser(): CancelablePromise<UserRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me',
        });
    }

    /**
     * Read User
     * @param userId
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readUser(
        userId: number,
    ): CancelablePromise<UserRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{id}',
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
