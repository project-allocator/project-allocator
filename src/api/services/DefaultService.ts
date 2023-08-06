/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * Test Guest
     * @returns any Successful Response
     * @throws ApiError
     */
    public static testGuest(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/test/guest',
        });
    }

    /**
     * Test Auth
     * @returns any Successful Response
     * @throws ApiError
     */
    public static testAuth(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/test/auth',
        });
    }

}
