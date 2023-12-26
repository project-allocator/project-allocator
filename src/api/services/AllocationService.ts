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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static isAccepted(): CancelablePromise<(boolean | null)> {
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
     * Read Allocated
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readAllocated(): CancelablePromise<(ProjectRead | null)> {
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
        projectId: string,
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
     * Read Conflicting Projects
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readConflictingProjects(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/conflicting',
        });
    }

    /**
     * Read Unallocated Users
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readUnallocatedUsers(): CancelablePromise<Array<UserRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/unallocated',
        });
    }

}
