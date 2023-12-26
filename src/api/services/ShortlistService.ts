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
        requestBody: Array<string>,
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
     * @param projectId
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isShortlisted(
        projectId: string,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/shortlisted/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Set Shortlisted
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setShortlisted(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/shortlisted/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Unset Shortlisted
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unsetShortlisted(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/me/shortlisted/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Shortlisters
     * @param projectId
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readShortlisters(
        projectId: string,
    ): CancelablePromise<Array<UserRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{project_id}/shortlisters',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
