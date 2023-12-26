/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_set_project_status } from '../models/Body_set_project_status';
import type { ProjectCreateWithDetails } from '../models/ProjectCreateWithDetails';
import type { ProjectDetailTemplateRead } from '../models/ProjectDetailTemplateRead';
import type { ProjectReadWithDetails } from '../models/ProjectReadWithDetails';
import type { ProjectUpdateWithDetails } from '../models/ProjectUpdateWithDetails';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProjectService {

    /**
     * Read Project Detail Templates
     * @returns ProjectDetailTemplateRead Successful Response
     * @throws ApiError
     */
    public static readProjectDetailTemplates(): CancelablePromise<Array<ProjectDetailTemplateRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/details/templates',
        });
    }

    /**
     * Read Projects
     * @param approved
     * @returns ProjectReadWithDetails Successful Response
     * @throws ApiError
     */
    public static readProjects(
        approved: boolean = true,
    ): CancelablePromise<Array<ProjectReadWithDetails>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects',
            query: {
                'approved': approved,
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
     * Set Project Status
     * @param projectId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setProjectStatus(
        projectId: string,
        requestBody: Body_set_project_status,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{project_id}/status',
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
     * Reset Project Status
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetProjectStatus(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/{project_id}/status',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
