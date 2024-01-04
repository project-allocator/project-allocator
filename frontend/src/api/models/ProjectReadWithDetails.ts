/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProjectDetailReadWithTemplate } from './ProjectDetailReadWithTemplate';

export type ProjectReadWithDetails = {
    title: string;
    description: string;
    approved?: (boolean | null);
    id: string;
    details?: Array<ProjectDetailReadWithTemplate>;
};

