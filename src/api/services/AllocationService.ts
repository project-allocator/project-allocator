/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
     * Is Accepted
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isAccepted(): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/allocated/accepted',
        });
    }

    /**
     * Accept Allocation
     * @returns any Successful Response
     * @throws ApiError
     */
    public static acceptAllocation(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/allocated/accepted',
        });
    }

    /**
     * Decline Allocation
     * @returns any Successful Response
     * @throws ApiError
     */
    public static declineAllocation(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/allocated/declined',
        });
    }

    /**
     * Undo Allocation
     * @returns any Successful Response
     * @throws ApiError
     */
    public static undoAllocation(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/allocated/undo',
        });
    }

    /**
     * Read Allocatees
     * @param projectId
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readAllocatees(
        projectId: number,
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
        projectId: number,
        requestBody: Array<UserRead>,
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
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeAllocatee(
        userId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{user_id}/allocated',
            path: {
                'user_id': userId,
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
     * @param projectId
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isAllocated(
        projectId: number,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/allocated/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Conflicting
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readConflicting(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/conflicting',
        });
    }

}
