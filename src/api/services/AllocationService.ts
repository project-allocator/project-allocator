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
     * @param xGraphToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static allocateProjects(
        xGraphToken?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/allocatees',
            headers: {
                'x-graph-token': xGraphToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Deallocate Projects
     * @param xGraphToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deallocateProjects(
        xGraphToken?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/allocatees',
            headers: {
                'x-graph-token': xGraphToken,
            },
            errors: {
                422: `Validation Error`,
            },
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
            url: '/api/projects/{id}/allocatees',
            query: {
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
            url: '/api/projects/{id}/allocatees',
            query: {
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
            url: '/api/users/{id}/allocated',
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
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
            url: '/api/users/me/allocated/{id}',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Conflicted
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readConflicted(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/conflicted',
        });
    }

}
