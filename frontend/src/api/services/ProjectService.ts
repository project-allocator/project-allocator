/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectCreateWithDetails } from '../models/ProjectCreateWithDetails';
import type { ProjectReadWithDetails } from '../models/ProjectReadWithDetails';
import type { ProjectReadWithProposal } from '../models/ProjectReadWithProposal';
import type { ProjectUpdateWithDetails } from '../models/ProjectUpdateWithDetails';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProjectService {

    /**
     * Read Approved Projects
     * @returns ProjectReadWithProposal Successful Response
     * @throws ApiError
     */
    public static readApprovedProjects(): CancelablePromise<Array<ProjectReadWithProposal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/approved',
        });
    }

    /**
     * Read Disapproved Projects
     * @returns ProjectReadWithProposal Successful Response
     * @throws ApiError
     */
    public static readDisapprovedProjects(): CancelablePromise<Array<ProjectReadWithProposal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/disapproved',
        });
    }

    /**
     * Read No Response Projects
     * @returns ProjectReadWithProposal Successful Response
     * @throws ApiError
     */
    public static readNoResponseProjects(): CancelablePromise<Array<ProjectReadWithProposal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/no-response',
        });
    }

    /**
     * Read Project
     * @param projectId
     * @returns ProjectReadWithDetails Successful Response
     * @throws ApiError
     */
    public static readProject(
        projectId: string,
    ): CancelablePromise<ProjectReadWithDetails> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Project
     * @param projectId
     * @param requestBody
     * @returns ProjectReadWithDetails Successful Response
     * @throws ApiError
     */
    public static updateProject(
        projectId: string,
        requestBody: ProjectUpdateWithDetails,
    ): CancelablePromise<ProjectReadWithDetails> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/projects/{project_id}',
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
     * Delete Project
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteProject(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Project
     * @param requestBody
     * @returns ProjectReadWithDetails Successful Response
     * @throws ApiError
     */
    public static createProject(
        requestBody: ProjectCreateWithDetails,
    ): CancelablePromise<ProjectReadWithDetails> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Approve Project
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static approveProject(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{project_id}/approve',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Disapprove Project
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static disapproveProject(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{project_id}/disapprove',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
