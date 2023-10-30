# Project Allocator v3

Welcome to Project Allocator v3!

This is the repository that contains:

* Backend code for the project allocator.
* GitHub workflow to build and push the Docker image to GHCR.
    * Which will be consumed by the `project-allocator-deploy` repository.

## Tech Stack

* React with TypeScript
* Vite for development server
* Yarn for package manager
* Ant Design for UI components
* Tailwind CSS for custom styling
* React Router v6 for routing

## Code Structure

## Development Guide

* When you update your backend API endpoints, make sure to run `yarn run generate` to auto-generate the API client.
    * If the hot reload fails, you need to restart the frontend container by:
        1. `cd` into `project-allocator-deploy`.
        2. Run `docker-compose restart frontend`.
