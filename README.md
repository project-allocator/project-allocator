# Project Allocator v3

Welcome to Project Allocator v3!

This is the repository that contains:

- GitHub workflow to deploy the Docker images in the cloud.
- Scripts to setup development environment.
- `docker-compose.yaml` to build and run the Docker images locally.

## Demo

Live at: [https://frontend-dev-projectall.to1azure.imperialapp.io/](https://frontend-dev-projectall.to1azure.imperialapp.io/)

Admin view:

https://private-user-images.githubusercontent.com/28210288/279185100-37bc380f-73c0-40c8-a303-f4acb5a8ff48.mov?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE2OTg2OTc3ODIsIm5iZiI6MTY5ODY5NzQ4MiwicGF0aCI6Ii8yODIxMDI4OC8yNzkxODUxMDAtMzdiYzM4MGYtNzNjMC00MGM4LWEzMDMtZjRhY2I1YThmZjQ4Lm1vdj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFJV05KWUFYNENTVkVINTNBJTJGMjAyMzEwMzAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjMxMDMwVDIwMjQ0MlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTQzYzhmY2QzYTJkZjJlZWZlZTQxY2QyMGExOWM5ZDc5ZDU2MDE0ZTJmYWViMzdiMGVjMzZhNTgwNTIyZmVkNWUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.wYFdNsYbynQX4Um409l0UdOE94mX5j14KHdtG8YwQE0

Staff view:

TODO

Student view:

https://private-user-images.githubusercontent.com/28210288/279185157-04d1b617-fec2-49a7-ae4f-07766396aad0.mov?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE2OTg2OTc4NjIsIm5iZiI6MTY5ODY5NzU2MiwicGF0aCI6Ii8yODIxMDI4OC8yNzkxODUxNTctMDRkMWI2MTctZmVjMi00OWE3LWFlNGYtMDc3NjYzOTZhYWQwLm1vdj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFJV05KWUFYNENTVkVINTNBJTJGMjAyMzEwMzAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjMxMDMwVDIwMjYwMlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTVhNmUzMWM0MWRlMzNhNTBmNzJhZDY2Zjc4ZDgyNTNjYzUwNmQ1YzIyYjRmOWMwMTdjMzRlMGExNjFlZTBjNjImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.kJk8fStRmCZFy2KK5J4nybxplKLqBoaB06E3LR04OdY

## Main Features

Administrators are capable of:

- Browse approved projects
- Check if all users have signed up to the Project Allocator with a list of emails
- Check if there are any students who have not been allocated to a project
- Check if there are any projects which have not been approved
- Check if there are any projects who did not accept project allocation
- Shutdown new project proposals/shortlists and undos for project allocation approval/disapproval
- Mass-allocate/deallocate projects to/from students using the customised algorithm
- Send in-app and email notifications
- Import/export data in the DB
- Browse all users
- Delete/Edit all users
- Approving/Disapproving a new project proposed by other staff/admin

Staff are capable of:

- Browse approved projects
- Browse proposed projects
- Proposing a new project
- Editing/Deleting a proposed project
- Check which students shortlisted for a prposed project
- Check which students were allocated to a proposed project
- Manually allocate/deallocate projects to/from students

Students are capable of:

- Browse approved projects
- Shortlist for an approved project
- Submit their order of preference for shortlisted projects
- Check the allocated project
- Accept/Reject the allocated project

Users of all roles are capable of:

- Login/Sign up using their Imperial Microsoft account
- Sign out
- Receive in-app and email notifications

## Getting Stared

You need to follow the sections below to start using the Project Allocator.

- [Setting up the Development Environment](#setting-up-the-development-environment)
  - [Prerequisites](#prerequisites)
  - [Using the Setup Script](#using-the-setup-script)
- [Setting up the Production Environment](#setting-up-the-production-environment)
  - [Using the Setup Script](#using-the-setup-script-1)
- [Setting up the Microsoft SSO](#setting-up-the-microsoft-sso)

After you have successfully setup the development/production environment and Micorsoft SSO, you can start [customising the Project Allocator](#customising-the-project-allocator).

## Setting up the Development Environment

## Prerequisites

Before you proceed, you need to create the following repositories in your own GitHub account/organisation:

- `project-allocator-deploy`
- `project-allocator-frontend`
- `project-allocator-backend`

For each of the original repositories below:

- [https://github.com/Digital-Garage-ICL/project-allocator-deploy](https://github.com/Digital-Garage-ICL/project-allocator-deploy)
- [https://github.com/Digital-Garage-ICL/project-allocator-backend](https://github.com/Digital-Garage-ICL/project-allocator-backend)
- [https://github.com/Digital-Garage-ICL/project-allocator-frontend](https://github.com/Digital-Garage-ICL/project-allocator-frontend)

1. Click **Fork** at the top right
2. Select your GitHub account/organisation to fork the repository to
   a. Make sure you don't already have a repository named `project-allocator-deploy`, `project-allocator-backend` or `project-allocator-frontend` under your GitHub account/organisation
3. Leave **Repository name** and **Descriptio** empty
4. Leave **Copy the main branch only** selected
5. Click **Create fork**

This should create a fork of each of thh original repositories under your GitHub account/organisation. You can check this by visiting your GitHub account/organisation and clicking **Repositories**.

### Using the Setup Script

First, you need to clone the deployment repository with `git clone git@github.com:<REPOSITORY_OWNER>/project-allocator-deploy.git`.

> Replace `<REPOSITORY_OWNER>` with the name of your GitHub account/organisation you used in [Prerequisites](#prerequisites).

First, navigate to the deployment repository you have just cloned:

```bash
cd /path/to/project-allocator-deploy
```

Inside the repository, you will find the `setup_dev.sh` script. Make sure install have the necessary dependencies, which will be listed when you run the script, and run:

```bash
./scripts/setup_dev.sh
```

And follow the instructions printed by the script. This will complete the following tasks for you:

- Clone the required repositories.
  - From the same GitHub account/orgnaisation which this repository was cloned from.
- Build and run the Docker images specified in `docker-compose.yaml`.
- Initialise and seed the database running in the Docker container.

If you encounter an error, you will need to manually setup your development environment.
See the "Manual Setup" for more details.

Once it runs successfully you're reay to start coding!
Visit the repositories for the frontend/backed for detailed instructions on how to get started.

### Manual Setup (Not Recommended)

If you wish to manually setup the development environment, you can start by cloning the required repositories:

```bash
mkdir /path/to/project-allocator && cd /path/to/project-allocator
git clone git@github.com:<REPOSITORY_OWNER>/project-allocator-deploy.git
git clone git@github.com:<REPOSITORY_OWNER>/project-allocator-frontend.git
git clone git@github.com:<REPOSITORY_OWNER>/project-allocator-backend.git
```

> Make sure you replace `<REPOSITORY_OWNER>` with the name of your GitHub account/organisation you used in [Prerequisites](#prerequisites).

After running these commands successfully, your directory structure should look like:

```
- project-allocator/
    - project-allocator-deploy/
    - project-allocator-frontend/
    - project-allocator-backend/
```

Now you need to build and run the Docker images with `docker compose up --build -d`.
This will take a while to complete if you are running it for the first time.
You will also see some warnings but you can ignore them as long as the containers are up and running.

Once the Docker containers are ready, you need to initialize and seed the database with random data:

```bash
docker compose exec -it backend poetry run db reset --yes
docker compose exec -it backend poetry run db seed --yes
```

For those who are curious - `db` is a custom command which comes with utility functions for managing the database in development.

The database is now up and running.
You can launch your faviourite DB client and explore the contents with the following credentials:

- Address: 0.0.0.0:5432
- Database name: default
- Database username: postgres
- Database password: postgres

Let's us move onto the `project-allocator-frontend` repository and generate the frontend client scripts. This will be used by the React components to call the backend API:

```bash
cd ../project-allocator-frontend && yarn generate
```

Finally, you can check if everything is working by visiting [http://localhost:3000](http://localhost:3000) on your browser.

You can also visit [http://localhost:8000/docs](http://localhost:8000/docs) to check the backend's OpenAPI documentation.

## Setting up the Production Environment

### Using the Setup Script

You can setup the production environment and enable automatic deployment of your application using Wayfinder.
The deployment will be triggered every time you push to this repository on the `main` branch.

First, make sure you have cloned the deployment repository. If not, you can clone it with `git clone git@github.com:<REPOSITORY_OWNER>/project-allocator-deploy.git`.

> Make sure you replace `<REPOSITORY_OWNER>` with the name of your GitHub account/organisation you used in [Prerequisites](#prerequisites).

Now navigate to the deployment repository you have just cloned:

```bash
cd /path/to/project-allocator-deploy
```

To begin with, you need to check if you have a Wayfinder workspace available to deploy your Project Allocator. If you're not sure, visit the Wayfinder UI at [https://portal-20-0-245-170.go.wayfinder.run](https://portal-20-0-245-170.go.wayfinder.run) and look for a workspace that does not already have an application named `project-allocator`.

> When first time signing in, you will need to click **Log in using Single Sign-On (SSO)** to login with your Imperial email address.

If that is not the case, you can create a new workspace with the `create_ws.sh` script, which you will find in the cloned repository. Make sure you are in the root directory of the repository, and run:

```bash
./scripts/create_ws.sh
```

This script will ask you for the necessary information and create a new workspace for you. Note that the workspace name must consist of 2-5 alphanumeric characters and must be unique within the Wayfinder cluster.

You can check the workspace has been created successfully by visiting the Wayfinder UI again.

> This method of creating a workspace is a temporary solution which will be possible int the future version of the Wayfinder UI.

Before you proceed, you will need to create a GitHub personal access token:

1. Sign in to GitHub and navigate to the top page: [https://github.com/](https://github.com/)
2. Click your profile icon at the top right and select **Settings**
3. Click **Developer settings** > **Personal access tokens** > **Tokens (classic)**
4. Click **Generate new token (classic)**
5. Create a new GitHub access token with the following details:
   1. Leave the **Note** empty
   2. Select **No expiration** for **Expiration**
   3. Check **repo** (i.e. all scopes under **repo**) and **read:packages** for **Select scopes**
   4. Click **Generate token**
6. Note down the generated token starting with `ghp_`

Finally, you are ready to setup your production workflow! Simply run the `setup_prod.sh` script as follows:

```bash
./scripts/setup_prod.sh
```

When it prompts "Do you already have an empty Wayfinder workspace (y/n)?", type "y" to continue,
and enter the name of the workspace you have just created.

This will complete the following tasks for you:

- Store the configuration of your Wayfinder application to this repository's GitHub variables.
- Obtain a Wayfinder access token and store it in this repository's GitHub secrets.
- Store the GitHub personal access token to Kubernetes secrets so that the Kubernetes cluster can pull your Docker images.
- Trigger the frontend, backend and deploy workflows to deploy the Project Allocator.

To check if the application deployed successfully, go to the deployment repository on GitHub and follow these steps:

1. Click **Actions**
2. Select one of the workflow runs
3. Select `deploy`, and click **Print Application URL**
4. Click the displayed application URL

> Sometimes the GitHub actions in the frontend and backend repsoitories may fail to push images to GHCR. In this case, you will additionally need to follow these steps to enable package access to GitHub Actions:
>
> 1. From organisation top-page, click **Packages**
> 2. Select the package with the failing GitHub action
> 3. Go to **Package settings** > **Manage Actions access**, and click **Add Repository**
> 4. Select the corresponding repository
> 5. Click **Add repositories**
> 6. Under **Role** dropdown, select **Write**

### Manual Setup (Not Recommended)

We use Appvia Wayfinder for simplified and secure deployment of the Project Allocator.

Before you proceed, you will need to understand the following vocabularies of Appvia Wayfinder:

- Workspace
  - Way to group users and cloud infrastructure for isolation
- Application
  - Models the elements of your applications (containers, cloud resources, environments, etc)
- Components
  - Individually deployable parts of your application
    - Container components
      - Define a set of properties for Kubernetes deployment management
    - Cloud resource components
      - Represents a dependency of your application served by a cloud service
- Environment
  - Map to a namespace in Kubernetes

Find more on: https://docs.appvia.io/wayfinder

The production environment is specified using Appvia Wayfinder's configuration files, which you can find under `manifests/` in this repository.

This can be broken down into as follows:

- Frontend container component
  - Listens to port 8080
- Backend container component
  - Listens to port 8000
- Database cloud resource component
  - Uses Azure Postgresql preconfigured by Appvia Wayfinder admins
- Ingress
  - Redirets requests at port 80 to frontend container component
  - Configures an API proxy
    - Redirects API (`/api`) requests at port 80 to backend container component
- Backend network policy
  - Allows redirected requests from ingress to backend container component
    - Blocked by Appvia Wayfinder by default

Manual setup for the production environment involves a lot of technical details which we will not discuss here.

You can also visit the Wayfinder UI to customise your production setup:
[https://portal-20-0-245-170.go.wayfinder.run](https://portal-20-0-245-170.go.wayfinder.run)

Bear in mind that you also need to update the configuration files under `manifests/`, otherwise your changes will get overwritten by a CI/CD run.

> If you customise your Wayfinder configurations manaully on Web UI, you might get the following error when running the deployment workflow:
>
> ```
> Error: AppComponent/frontend: AppComponent.app.appvia.io "frontend" is invalid:
> * spec.name: Component name must be unique within an application
> ```
>
> in which case, you can run the following commands to re-apply your configurations:
>
> ```bash
> wf delete -f manifests/frontend.yaml
> wf apply -f manifests/frontend.yaml
> ```
>
> Also, if you observe that some Wayfinder components are not running as expected, you can run:
>
> ```bash
> wf deploy component project-allocator dev --component db --remove
> wf deploy component project-allocator dev --component db --force
> ```

## Setting up the Microsoft SSO

Right now, the repositories contain the default Azure ADD application setup, which is used by the Project Allocator sto authenticate users with their Imperial email addresses.

This is fine for development purposes, but you will need to setup your own Azure ADD application for production, as you will need to register the deployment URL of your own Project Allocator instance on Azure ADD.

First, head over to Azure AAD's app registrations:
[https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)

You may be required to login with your Imperial email address.

1. Click **New Registrations** at the top left
   1. Enter `project-allocator` to **Name**
   2. Select **Accounts in this organizational directory only (Imperial College London only - Single tenant)** for **Supported account types**
   3. Select **Single-page application (SPA)** and enter `http://localhost:3000` for **Redirect URI (optional)**
   4. Click **Register**
2. Click **Manage** > **Manifest**
   1. Edit the JSON file by setting `"accessTokenAcceptedVersion"` to `2`
3. Click **Manage** > **Expose an API**
   1. Click **Add a scope**
   2. Leave the **Application ID URI** and click **Save and continue**
   3. Now you can add a scope:
      1. Enter `user_impersonation` to **Scope name**
      2. Select **Admins and users** for **Who can consent?**
      3. Enter `Access API as user` to **Admin consent display name**
      4. Enter `Allows the app to access the API as the user.` to **Admin consent description**
      5. Enter `Access API as you` to **User consent display name**
      6. Enter `Allows the app to access the API as you.` to **User consent description**
      7. Select **Enabled** for **State**
      8. Click **Add scope**
4. Click **API permissions**
   1. Now you can add `project-allocator` API permissions:
      1. Click **Add a permission**
      2. Click **My APIs** tab
      3. Select `project-allocator`
      4. Leave the checkbox ticked and click **Add permissions**
   2. Now you can add Microsoft Graph API permissions:
      1. Click **Add a permission** again
      2. Click **Microsoft APIs** tab
      3. Click **Microsoft Graph** card at the top
      4. Select **Delegated permissions**
      5. Search for `User.Read` and `Mail.Send` and tick the checkboxes
      6. Click **Add permissions**
5. Click **Overview**
   1. Note down your **Tenant ID** and **Application (client) ID**
   2. Go to the frontend repository. In `.env`, set `VITE_TENANT_ID` to **Tenant ID** and `VITE_CLIENT_ID` to **Application (client) ID**
   3. Go to the backend repository. In `.env`, set `TENANT_ID` to **Tenant ID** and `APP_CLIENT_ID` to **Application (client) ID**
6. Now repeat steps 1-5 except you need to:
   1. In step 1.1, enter `project-allocator-openapi` to **Name**
   2. In step 1.3, select **Single-page application (SPA)** and enter `http://localhost:8000/oauth2-redirect` to **Redirect URI (optional)**
   3. In step 5, you need to:
      1. Note down your **Application (client) ID** for `project-allocator-openapi`
      2. Go to the backend repository. In `.env`, set `OPENAPI_CLIENT_ID` to **Application (client) ID**
7. After deployment is successful, go to the deployment repository on GitHub
   1. Click **Actions**
   2. Select one of the workflow runs
   3. Select `deploy`, and click **Print Application URL**
   4. Note down your application URL
   5. Now head over to Azure Portal
   6. Click **Manage** > **Authentication**
   7. In **Single-page application** > **Redirect URIs**, click **Add URI**
   8. Enter your application URL
   9. Click **Save** at the bottom

## Getting SSH Access to Container Component

You can run the following command(s):

```bash
./scripts/access_pod.sh frontend
./scripst/access_pod.sh backend
```

This script will pick one running pod and ssh into it using your Appvia Wayfinder credentials.

## Connecting to Azure Database

You can run the following command:

```bash
./scripts/access_db.sh
```

This script will print out the necessary credentials to access your DB on Azure.

## Connecting to AKS via Lens

Lens is a Kubernetes IDE which lets you easily debug and monitor your Project Allocator instance once deployed.

You can install Lens from their official website: [https://k8slens.dev/](https://k8slens.dev/).

Before you launch Lens, run the following commands:

```bash
wf use workspace <YOUR_WORKSPACE_NAME>
wf access env project-allocator dev --role namespace.admin
```

Now if you launch Lens, you should see your pods running under **Workloads** > **Pods**.

## Customising the Project Allocator

The backend repository contains a file called `config.yaml` at the root,
which lets you customise basic parameters for the Project Allocator.

Here's a brief description of what the contents of `config.yaml` should look like:

```yaml
users:
  admins:
    - rbc@ic.ac.uk # List of administrator emails
projects:
  allocations:
    students: 4 # Nmber of students allocated per a single project
```

By default, each project has a project title, description and categories (list of keywords),
but you can also keep track of the project's duration, for example, by simply editing `config.yaml` as follows:

```yaml
projects:
  details:
    - name: duration
      title: Project Duration
      description: >
        Estimated duration of this project (in months).
      message: Please enter a valid project duration!
      type: number
      required: true
```

The Project Allocator supports several types of input:

- Textfield (single row)
- Textarea (multiple rows)
- Number
- Slider
- Date picker
- Time picker
- Switch (yes or no)
- Select (dropdown menu)
- Checkbox (multiple selections)
- Radio (single selection)

You can have a look at `config.yaml` for the exact format of each of these input types.

You can also customise the algorithm used for project allocation,
by implementing the `allocate_projects_custom()` function in `src/algorithms.py` at the backend repository.

There are a few other, heavily-commented examples in `src/algorithms.py` so take a look at those before you start your implementation.
