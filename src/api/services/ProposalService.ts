/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectRead } from '../models/ProjectRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProposalService {

    /**
     * Read Proposed
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readProposed(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/proposed',
        });
    }

    /**
     * Is Proposed
     * @param id
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isProposed(
        id: number,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/proposed/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
