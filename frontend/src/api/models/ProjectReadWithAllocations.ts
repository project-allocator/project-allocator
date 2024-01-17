/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AllocationRead } from './AllocationRead';

export type ProjectReadWithAllocations = {
    title: string;
    description: string;
    id: string;
    approved: (boolean | null);
    allocations: Array<AllocationRead>;
};

