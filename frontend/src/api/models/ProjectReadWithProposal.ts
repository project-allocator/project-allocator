/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProposalRead } from './ProposalRead';

export type ProjectReadWithProposal = {
    title: string;
    description: string;
    id: string;
    approved: (boolean | null);
    proposal: ProposalRead;
};

