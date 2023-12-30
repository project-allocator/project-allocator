/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectRead } from '../models/ProjectRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProposalService {

    /**
     * Read Proposed Projects
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readProposedProjects(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/proposed',
        });
    }

    /**
     * Is Project Proposed
     * @param projectId
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isProjectProposed(
        projectId: string,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/projects/{project_id}/proposed',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
