/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProjectDetailCreate } from './ProjectDetailCreate';

export type ProjectCreateWithDetails = {
    title: string;
    description: string;
    approved?: (boolean | null);
    details?: Array<ProjectDetailCreate>;
};

