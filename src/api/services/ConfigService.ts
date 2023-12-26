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

}
