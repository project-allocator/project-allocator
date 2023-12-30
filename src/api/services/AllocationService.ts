/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_set_allocation_status } from '../models/Body_set_allocation_status';
import type { ProjectRead } from '../models/ProjectRead';
import type { UserRead } from '../models/UserRead';

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
     * Set Allocation Status
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setAllocationStatus(
        requestBody: Body_set_allocation_status,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/allocated/status',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Reset Allocation Status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetAllocationStatus(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/me/allocated/status',
        });
    }

    /**
     * Read Allocatees
     * @param projectId
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readAllocatees(
        projectId: string,
    ): CancelablePromise<Array<UserRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{project_id}/allocatees',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Allocatees
     * @param projectId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addAllocatees(
        projectId: string,
        requestBody: Array<string>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{project_id}/allocatees',
            path: {
                'project_id': projectId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Allocatee
     * @param projectId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeAllocatee(
        projectId: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/{project_id}/allocatees/{user_id}',
            path: {
                'project_id': projectId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Allocated Project
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readAllocatedProject(): CancelablePromise<ProjectRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/allocated',
        });
    }

}
