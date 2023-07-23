/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectRead } from '../models/ProjectRead';
import type { UserRead } from '../models/UserRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ShortlistService {

    /**
     * Read Shortlisted
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readShortlisted(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/shortlisted',
        });
    }

    /**
     * Reorder Shortlisted
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reorderShortlisted(
        requestBody: Array<number>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/me/shortlisted',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Is Shortlisted
     * @param id
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isShortlisted(
        id: number,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/shortlisted/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Set Shortlisted
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setShortlisted(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/shortlisted/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Unset Shortlisted
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unsetShortlisted(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/me/shortlisted/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Shortlisters
     * @param id
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readShortlisters(
        id: number,
    ): CancelablePromise<Array<UserRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{id}/shortlisters',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
