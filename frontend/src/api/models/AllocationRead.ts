/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProjectRead } from './ProjectRead';
import type { UserRead } from './UserRead';

export type AllocationRead = {
    accepted?: (boolean | null);
    locked?: boolean;
    allocatee: UserRead;
    allocated_project: ProjectRead;
};

