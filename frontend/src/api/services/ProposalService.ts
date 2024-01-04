/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectReadWithProposal } from '../models/ProjectReadWithProposal';
import type { UserRead } from '../models/UserRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProposalService {

    /**
     * Read Proposed Projects
     * @returns ProjectReadWithProposal Successful Response
     * @throws ApiError
     */
    public static readProposedProjects(): CancelablePromise<Array<ProjectReadWithProposal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/proposed_projects',
        });
    }

    /**
     * Read Proposer
     * @param projectId
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public static readProposer(
        projectId: string,
    ): CancelablePromise<UserRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{project_id}/proposer',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
