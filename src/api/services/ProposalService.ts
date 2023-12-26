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
     * Read Proposed
     * @returns ProjectRead Successful Response
     * @throws ApiError
     */
    public static readProposed(): CancelablePromise<Array<ProjectRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/proposed',
        });
    }

    /**
     * Is Proposed
     * @param projectId
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static isProposed(
        projectId: string,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/proposed/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Approve Proposal
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static approveProposal(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{project_id}/approved',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Reject Proposal
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static rejectProposal(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{project_id}/reject',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Undo Proposal
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static undoProposal(
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{project_id}/undo',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
