/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectRead } from '../models/ProjectRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AllocationService {

    /**
     * Allocate Projects
     * @returns any Successful Response
     * @throws ApiError
     */
    public static allocateProjects(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/allocatees',
        });
    }

    /**
     * Deallocate Projects
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deallocateProjects(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/allocatees',
        });
    }

    /**
     * Read Allocatees
     * @param id
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readAllocatees(
        id: number,
    ): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{id}/allocatees',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Allocated
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readAllocated(): CancelablePromise<ProjectRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/allocated',
        });
    }

    /**
     * Is Allocated
     * @param id
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isAllocated(
        id: number,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/allocated/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
