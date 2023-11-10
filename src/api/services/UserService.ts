/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRead } from "../models/UserRead";
import type { UserUpdate } from "../models/UserUpdate";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class UserService {
  /**
   * Read Users
   * @param role
   * @returns UserRead Successful Response
   * @throws ApiError
   */
  public static readUsers(role?: string): CancelablePromise<Array<UserRead>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users",
      query: {
        role: role,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create User
   * @param xGraphToken
   * @returns UserRead Successful Response
   * @throws ApiError
   */
  public static createUser(xGraphToken?: string): CancelablePromise<UserRead> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/users",
      headers: {
        "x-graph-token": xGraphToken,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read Current User
   * @returns UserRead Successful Response
   * @throws ApiError
   */
  public static readCurrentUser(): CancelablePromise<UserRead> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/me",
    });
  }

  /**
   * Read User
   * @param userId
   * @returns UserRead Successful Response
   * @throws ApiError
   */
  public static readUser(userId: number): CancelablePromise<UserRead> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update User
   * @param userId
   * @param requestBody
   * @returns UserRead Successful Response
   * @throws ApiError
   */
  public static updateUser(
    userId: number,
    requestBody: UserUpdate,
  ): CancelablePromise<UserRead> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/users/{user_id}",
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete User
   * @param userId
   * @returns any Successful Response
   * @throws ApiError
   */
  public static deleteUser(userId: number): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
