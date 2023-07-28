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

}
