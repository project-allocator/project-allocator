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
     * Toggle Proposals Shutdown
     * @returns any Successful Response
     * @throws ApiError
     */
    public static toggleProposalsShutdown(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/proposals/shutdown',
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
     * Toggle Shortlists Shutdown
     * @returns any Successful Response
     * @throws ApiError
     */
    public static toggleShortlistsShutdown(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/shortlists/shutdown',
        });
    }

}
