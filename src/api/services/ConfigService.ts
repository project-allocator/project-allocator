/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConfigRead } from '../models/ConfigRead';
import type { ConfigUpdate } from '../models/ConfigUpdate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ConfigService {

    /**
     * Read Config
     * @param key
     * @returns ConfigRead Successful Response
     * @throws ApiError
     */
    public static readConfig(
        key: string,
    ): CancelablePromise<ConfigRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/configs/{key}',
            path: {
                'key': key,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Config
     * @param key
     * @param requestBody
     * @returns ConfigRead Successful Response
     * @throws ApiError
     */
    public static updateConfig(
        key: string,
        requestBody: ConfigUpdate,
    ): CancelablePromise<ConfigRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/configs/{key}',
            path: {
                'key': key,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
