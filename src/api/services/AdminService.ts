/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_import_json } from "../models/Body_import_json";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class AdminService {
  /**
   * Are Proposals Shutdown
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static areProposalsShutdown(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/proposals/shutdown",
    });
  }

  /**
   * Set Proposals Shutdown
   * @returns any Successful Response
   * @throws ApiError
   */
  public static setProposalsShutdown(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/proposals/shutdown",
    });
  }

  /**
   * Unset Proposals Shutdown
   * @returns any Successful Response
   * @throws ApiError
   */
  public static unsetProposalsShutdown(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/proposals/shutdown",
    });
  }

  /**
   * Are Shortlists Shutdown
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static areShortlistsShutdown(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/shortlists/shutdown",
    });
  }

  /**
   * Set Shortlists Shutdown
   * @returns any Successful Response
   * @throws ApiError
   */
  public static setShortlistsShutdown(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/shortlists/shutdown",
    });
  }

  /**
   * Unset Shortlists Shutdown
   * @returns any Successful Response
   * @throws ApiError
   */
  public static unsetShortlistsShutdown(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/shortlists/shutdown",
    });
  }

  /**
   * Are Undos Shutdown
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static areUndosShutdown(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/undos/shutdown",
    });
  }

  /**
   * Set Undos Shutdown
   * @returns any Successful Response
   * @throws ApiError
   */
  public static setUndosShutdown(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/projects/undos/shutdown",
    });
  }

  /**
   * Unset Undos Shutdown
   * @returns any Successful Response
   * @throws ApiError
   */
  public static unsetUndosShutdown(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/projects/undos/shutdown",
    });
  }

  /**
   * Export Json
   * @returns any Successful Response
   * @throws ApiError
   */
  public static exportJson(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/export/json",
    });
  }

  /**
   * Export Csv
   * @returns any Successful Response
   * @throws ApiError
   */
  public static exportCsv(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/export/csv",
    });
  }

  /**
   * Import Json
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public static importJson(
    requestBody: Body_import_json,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/import/json",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Check Missing Users
   * @param requestBody
   * @returns string Successful Response
   * @throws ApiError
   */
  public static checkMissingUsers(
    requestBody: Array<string>,
  ): CancelablePromise<Array<string>> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/users/missing",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
