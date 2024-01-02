/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectReadWithAllocations } from '../models/ProjectReadWithAllocations';
import type { UserRead } from '../models/UserRead';
import type { UserReadWithAllocation } from '../models/UserReadWithAllocation';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AllocationService {

    /**
     * Read Allocated Project
     * @returns ProjectReadWithAllocations Successful Response
     * @throws ApiError
     */
    public static readAllocatedProject(): CancelablePromise<ProjectReadWithAllocations> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/allocated_project',
        });
    }

    /**
     * Read Allocatees
     * @param projectId
     * @returns UserReadWithAllocation Successful Response
     * @throws ApiError
     */
    public static readAllocatees(
        projectId: string,
    ): CancelablePromise<Array<UserReadWithAllocation>> {
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
     * Read Non Allocatees
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readNonAllocatees(): CancelablePromise<Array<UserRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/non-allocatees',
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
     * Allocate Projects
     * @returns any Successful Response
     * @throws ApiError
     */
    public static allocateProjects(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/allocate',
        });
    }

    /**
     * Deallocate Projects
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deallocateProjects(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/deallocate',
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
            url: '/api/users/me/allocation/accept',
        });
    }

    /**
     * Reject Allocation
     * @returns any Successful Response
     * @throws ApiError
     */
    public static rejectAllocation(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/allocation/reject',
        });
    }

    /**
     * Lock Allocations
     * @returns any Successful Response
     * @throws ApiError
     */
    public static lockAllocations(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/allocations/lock',
        });
    }

    /**
     * Unlock Allocations
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unlockAllocations(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/allocations/unlock',
        });
    }

}
