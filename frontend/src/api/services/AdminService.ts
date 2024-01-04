/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectRead } from '../models/ProjectRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AdminService {

    /**
     * Check Missing Users
     * @param requestBody
     * @returns string Successful Response
     * @throws ApiError
     */
    public static checkMissingUsers(
        requestBody: Array<string>,
    ): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admins/missing-users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Conflicting Projects
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readConflictingProjects(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admins/conflicting-projects',
        });
    }

    /**
     * Export Csv
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportCsv(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admins/export/csv',
        });
    }

    /**
     * Export Json
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportJson(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admins/export/json',
        });
    }

    /**
     * Import Json
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static importJson(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admins/import/json',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Reset Database
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetDatabase(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admins/database/reset',
        });
    }

}
