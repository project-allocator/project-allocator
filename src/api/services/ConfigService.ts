/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConfigRead } from '../models/ConfigRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ConfigService {

    /**
     * Read Configs
     * @returns ConfigRead Successful Response
     * @throws ApiError
     */
    public static readConfigs(): CancelablePromise<Array<ConfigRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/configs',
        });
    }

    /**
     * Update Config
     * @param key
     * @param value
     * @returns ConfigRead Successful Response
     * @throws ApiError
     */
    public static updateConfig(
        key: string,
        value: any,
    ): CancelablePromise<ConfigRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/configs/{key}',
            path: {
                'key': key,
            },
            query: {
                'value': value,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
