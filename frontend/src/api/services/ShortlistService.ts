/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectReadWithProposal } from '../models/ProjectReadWithProposal';
import type { UserRead } from '../models/UserRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ShortlistService {

    /**
     * Read Shortlisted Projects
     * @returns ProjectReadWithProposal Successful Response
     * @throws ApiError
     */
    public static readShortlistedProjects(): CancelablePromise<Array<ProjectReadWithProposal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/shortlisted_projects',
        });
    }

    /**
     * Shortlist Project
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static shortlistProject(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/shortlisted_projects',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Unshortlist Project
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unshortlistProject(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/me/shortlisted_projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Reorder Shortlisted Projects
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reorderShortlistedProjects(
        requestBody: Array<string>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/shortlisted_projects/reorder',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Shortlisters
     * @param projectId
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readShortlisters(
        projectId: string,
    ): CancelablePromise<Array<UserRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{project_id}/shortlisters',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
