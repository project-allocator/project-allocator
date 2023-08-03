/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AdminService {

    /**
     * Are Proposals Shutdown
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static areProposalsShutdown(): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/proposals/shutdown',
        });
    }

    /**
     * Set Proposals Shutdown
     * @param xGraphToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setProposalsShutdown(
        xGraphToken?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/proposals/shutdown',
            headers: {
                'x-graph-token': xGraphToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Unset Proposals Shutdown
     * @param xGraphToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unsetProposalsShutdown(
        xGraphToken?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/proposals/shutdown',
            headers: {
                'x-graph-token': xGraphToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Are Shortlists Shutdown
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static areShortlistsShutdown(): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/shortlists/shutdown',
        });
    }

    /**
     * Set Shortlists Shutdown
     * @param xGraphToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setShortlistsShutdown(
        xGraphToken?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/shortlists/shutdown',
            headers: {
                'x-graph-token': xGraphToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Unset Shortlists Shutdown
     * @param xGraphToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unsetShortlistsShutdown(
        xGraphToken?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/shortlists/shutdown',
            headers: {
                'x-graph-token': xGraphToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Are Undos Shutdown
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static areUndosShutdown(): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/undos/shutdown',
        });
    }

    /**
     * Set Undos Shutdown
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setUndosShutdown(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/undos/shutdown',
        });
    }

    /**
     * Unset Undos Shutdown
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unsetUndosShutdown(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/undos/shutdown',
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
            url: '/api/projects/export/json',
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
            url: '/api/projects/export/csv',
        });
    }

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
            url: '/api/users/missing',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
