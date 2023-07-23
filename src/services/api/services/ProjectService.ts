/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectCreate } from '../models/ProjectCreate';
import type { ProjectRead } from '../models/ProjectRead';
import type { ProjectUpdate } from '../models/ProjectUpdate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProjectService {

    /**
     * Read Projects
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readProjects(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects',
        });
    }

    /**
     * Create Project
     * @param requestBody
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static createProject(
        requestBody: ProjectCreate,
    ): CancelablePromise<ProjectRead> {
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
     * @param id
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readProject(
        id: number,
    ): CancelablePromise<ProjectRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Project
     * @param id
     * @param requestBody
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static updateProject(
        id: number,
        requestBody: ProjectUpdate,
    ): CancelablePromise<ProjectRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/projects/{id}',
            path: {
                'id': id,
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
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteProject(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
