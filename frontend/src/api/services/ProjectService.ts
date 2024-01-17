/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_create_project } from '../models/Body_create_project';
import type { Body_update_project } from '../models/Body_update_project';
import type { ProjectDetailTemplateCreate } from '../models/ProjectDetailTemplateCreate';
import type { ProjectDetailTemplateRead } from '../models/ProjectDetailTemplateRead';
import type { ProjectDetailTemplateUpdate } from '../models/ProjectDetailTemplateUpdate';
import type { ProjectReadWithDetails } from '../models/ProjectReadWithDetails';
import type { ProjectReadWithProposal } from '../models/ProjectReadWithProposal';

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
     * Create Project Detail Template
     * @param requestBody
     * @returns ProjectDetailTemplateRead Successful Response
     * @throws ApiError
     */
    public static createProjectDetailTemplate(
        requestBody: ProjectDetailTemplateCreate,
    ): CancelablePromise<ProjectDetailTemplateRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/details/templates',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Project Detail Template
     * @param templateId
     * @param requestBody
     * @returns ProjectDetailTemplateRead Successful Response
     * @throws ApiError
     */
    public static updateProjectDetailTemplate(
        templateId: string,
        requestBody: ProjectDetailTemplateUpdate,
    ): CancelablePromise<ProjectDetailTemplateRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/projects/details/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Project Detail Template
     * @param templateId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteProjectDetailTemplate(
        templateId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/details/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

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
     * Read Non Approved Projects
     * @returns ProjectReadWithProposal Successful Response
     * @throws ApiError
     */
    public static readNonApprovedProjects(): CancelablePromise<Array<ProjectReadWithProposal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/non-approved',
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
        requestBody: Body_update_project,
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
        requestBody: Body_create_project,
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
