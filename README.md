# Project Allocator v3

Welcome to Project Allocator v3!

This is the repository that contains:

- GitHub workflow to deploy the Docker images in the cloud.
- Scripts to setup development environment.
- `docker-compose.yaml` to build and run the Docker images locally.

## Demo

Live at: [https://frontend-dev-projecyqxf.to1azure.imperialapp.io/projects](https://frontend-dev-projecyqxf.to1azure.imperialapp.io/projects)

## Main Features

Administrators are capable of:

- Browse approved projects
- Check if all users have signed up to the Project Allocator with a list of emails
- Check if there are any students who have not been allocated to a project
- Check if there are any projects which have not been approved
- Check if there are any projects with some students rejecting their project allocation
- Block new project proposals/shortlists
- Lock existing allocations so that students cannot reject their allocation later
- Allocate projects to students automatically using custom algorithm
- Deallocate projects from students
- Send in-app and email notifications
- Import data into the database
- Export data from the database
- Reset the database for use in the next year
- Browse all users
- Delete/edit all users
- Approving/disapproving a new project proposed by other staff/admin

Staff are capable of:

- Browse approved projects
- Browse proposed projects
- Propose a new project
- Edit a proposed project
- Delete a proposed project
- Check which students shortlisted for a prposed project
- Check which students were allocated to a proposed project
- Manually allocate/deallocate projects to/from students

Students are capable of:

- Browse approved projects
- Shortlist an approved project
- Sort shortlisted projects by their preference (ranking)
- Check their allocated project
- Accept their project allocation
- Reject their project allocation

Users of all roles are capable of:

- Sign in/up with their Microsoft account (Imperial email address)
- Receive in-app and email notifications
- Sign out

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

Before you proceed, you need to fork `project-allocator` repository in your GitHub account/organisation.

To do this, follow these steps:

1. Visit [https://github.com/project-allocator/project-allocator](https://github.com/project-allocator/project-allocator)
2. Click **Fork** at the top right
3. Select your GitHub account/organisation to fork the repository to
   1. Make sure you don't already have a repository named `project-allocator` in your GitHub account/organisation
4. Leave **Repository name** and **Descriptio** empty
5. Leave **Copy the main branch only** selected
6. Click **Create fork**

As a final step, you will need to enable GitHub workflows for each of the forked repositories:

1. Click **Actions** at the top
2. Click **I understand my workflows, go ahead and enable them**

### Using the Setup Script

First, `cd` into the directory of your choice and clone the forked repository by `git clone git@github.com:<REPOSITORY>.git`.

> Replace `<REPOSITORY>` with the repository you forked in [Prerequisites](#prerequisites).

Now `cd` into the cloned repository, in which you will find the `setup_dev.sh` script.

This script will complete the following tasks for you:

- Clone the required repositories.
  - From the same GitHub account/orgnaisation which this repository was cloned from.
- Build and run the Docker images specified in `docker-compose.yaml`.
- Initialise and seed the database running in the Docker container.

Make sure you have the necessary dependencies, and follow the instructioins:

```bash
./scripts/setup_dev.sh
```

If you get an error, you may need to manually setup your development environment. See the "Manual Setup" for more details.

Once it runs successfully you're ready to start coding! Make sure to check out `README.md` in `backend` and `frontend` subdirectories as well.

### Manual Setup (Not Recommended)

First clone the forked repository by `git clone git@github.com:<REPOSITORY>.git`.

> Replace `<REPOSITORY>` with the repository you forked in [Prerequisites](#prerequisites).

Now you need to build and run the Docker images with `docker compose up --build -d`. This will take a while to complete if you are running it for the first time.

Once the Docker containers are ready, you can create tables in the database and seed it with random data:

```bash
docker compose exec -it backend poetry run alembic upgrade base
docker compose exec -it backend poetry run db seed --yes
```

> `db` is a custom command which comes with utility functions for managing the database in development.

The database is now up and running! You can access the database with the following credentials:

- Address: 0.0.0.0:5432
- Database name: default
- Database username: postgres
- Database password: postgres

The frontend uses an API client that is auto-generated from the OpenAPI documentation. Although the frontend container fetches data and generates this client every minute, you may want to generate it manually on the first run:

```bash
cd ./frontend && yarn generate
```

Finally, you can check if everything is working by visiting [http://localhost:3000](http://localhost:3000).

You can also visit [http://localhost:8000/docs](http://localhost:8000/docs) for the OpenAPI documentation.

## Setting up the Production Environment

### Using the Setup Script

First, you need to check if you have a Wayfinder workspace available to deploy your Project Allocator. If you're not sure, visit the Wayfinder UI at [https://portal-20-0-245-170.go.wayfinder.run](https://portal-20-0-245-170.go.wayfinder.run) and look for a workspace that does not already have an application named `project-allocator`.

> When first time signing in, you will need to click **Log in using Single Sign-On (SSO)** to login with your Imperial email address.

If that is not the case, you can create a new workspace with the `create_ws.sh` script, which you will find in the cloned repository. Make sure you are in the root directory of the repository, and run:

```bash
./scripts/create_ws.sh
```

This script will ask you for the necessary information and create a new workspace for you. The workspace name must consist of 2-5 alphanumeric characters and must be unique within the Wayfinder cluster.

You can check the workspace has been created successfully by visiting the Wayfinder UI again.

> This method of creating a workspace is a temporary solution, and this will be possible in the future version of the Wayfinder UI.

Next, you need to create a GitHub personal access token:

1. Sign in to GitHub and navigate to the top page: [https://github.com/](https://github.com/)
2. Click your profile icon at the top right and select **Settings**
3. Click **Developer settings** > **Personal access tokens** > **Tokens (classic)**
4. Click **Generate new token (classic)**
5. Create a new GitHub access token with the following details:
   1. Enter `project-allocator-deploy` to **Note**
      1. You can enter any name you like, but make sure you remember it as you might need to use it later.
   2. Select **No expiration** for **Expiration**
   3. Check **repo** (i.e. all scopes under **repo**) and **read:packages** for **Select scopes**
   4. Click **Generate token**
6. Note down the generated token starting with `ghp_`

And finally, you are ready to setup your production workflow!

Make sure you have cloned the forked repository. If not, you need to follow the instructions at [Setting up the Development Environment](#setting-up-the-development-environment).

Now `cd` into the cloned repository and run the `setup_prod.sh` script:

```bash
./scripts/setup_prod.sh
```

When it prompts "Do you already have an empty Wayfinder workspace (y/n)?", type "y" to continue,
and enter the name of the workspace you have just created.

> Sometimes this script may fail due to Wayfinder authentication issues, even if the script says you're logged in to Wayfinder CLI, printing out the following error:
>
> ```bash
> Error: request denied, check permissions
> zsh: exit 1     ./scripts/setup_prod.sh
> ```
>
> In this case, you can run the following command to re-authenticate Wayfinder CLI on your browser:
>
> ```bash
> wf login
> ```

> Sometimes Wayfinder takes a long time to get ready to host your application, in which this script may fail with the following error:
>
> ```bash
> Error: session (accessrolebinding namespace.admin.aks-stdnt1.<WORKSPACE_NAME>-project-allocator-dev.tm8212s499) is not ready -
> zsh: exit 1     ./scripts/setup_prod.sh
> ```
>
> In the script we wait 30 seconds to make sure this doesn't happen, but if it does, you can simply re-run the script to complete the setup:
>
> ```bash
> ./scripts/setup_prod.sh
> ```

This will complete the following tasks for you:

- Store the configuration of your Wayfinder application to this repository's GitHub variables.
- Obtain a Wayfinder access token and store it in this repository's GitHub secrets.
- Store the GitHub personal access token to Kubernetes secrets so that the Kubernetes cluster can pull your Docker images.
- Trigger the frontend, backend and deploy workflows to deploy the Project Allocator.

To check if the application has been deployed successfully, go to the deployment repository on GitHub and follow these steps:

1. Click **Actions**
2. Select the latest workflow run
   1. You may see some failed workflow runs, but you can ignore them as long as the latest workflow run is successful.
3. Select `deploy`, and click **Print application URL**
4. Click the displayed application URL

You should now see the Project Allocator up and running!

> Sometimes the GitHub actions in the frontend and backend repsoitories may fail to push images to GHCR. In this case, you will additionally need to follow these steps to enable package access to GitHub Actions:
>
> 1. From organisation top-page, click **Packages**
> 2. Select the package with the failing GitHub action
> 3. Go to **Package settings** > **Manage Actions Access**, and click **Add Repository**
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

You can also visit the Wayfinder UI to customise your production setup:
[https://portal-20-0-245-170.go.wayfinder.run](https://portal-20-0-245-170.go.wayfinder.run)

> If you customise configurations manaully on Wayfinder UI, you might get the following error when running the deployment workflow:
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

The changes you make on the Wayfinder UI are temporary and will get overwritten by the `deploy` workflow. If you wish to make permanent changes, you will also need to update the configuration files under `manifests/`.

## Setting up the Microsoft SSO

As of now, this repository comes with the default Azure ADD application setup, which is used by the Project Allocator to authenticate users with their Imperial email addresses.

This is OK for development purposes, but you will need to setup your own Azure ADD application for production, as you will need to register the deployment URL of your own Project Allocator instance on Azure ADD.

To do this, head over to Azure AAD's app registrations:
[https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)

> You may be required to login with your Imperial email address.

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

You can run the following command(s) to ssh into the container component using your Appvia Wayfinder credentials:

```bash
./scripts/access_pod.sh frontend
./scripst/access_pod.sh backend
```

## Connecting to Azure Database

You can run the following command to obtain the credentials to access your Azure database:

```bash
./scripts/access_db.sh
```

## Connecting to AKS via Lens

Lens is a Kubernetes IDE which lets you easily debug and monitor your Project Allocator instance once deployed. You can install Lens from their official website: [https://k8slens.dev/](https://k8slens.dev/).

Before you launch it, make sure to run the following commands:

```bash
wf use workspace <YOUR_WORKSPACE_NAME>
wf access env project-allocator dev --role namespace.admin
```

You should now see your pods running under **Workloads** > **Pods**.

## Resetting the Project Allocator

This repository has the `destroy` workflow which destroys all of the components and configurations created by the `deploy` workflow:

1. Go to the forked repository
2. Click **Actions**
3. Under **All workflows**, click **Destroy application**
4. Expand the dropdown that says **Run workflow**
5. Leave **Use workflow from**, and click **Run workflow**

After the workflow has finished running, you can trigger the `deploy` workflow manually by following similar steps.

## Deleting the Project Allocator

To delete your Project Allocator instance completely, you can run:

```bash
wf use workspace <WORKSPACE_NAME>
wf delete app project-allocator
```

> Make sure you replace `<WORKSPACE_NAME>` with the name of your Wayfinder workspace.

If you wish, you can also delete the repository you have forked in your GitHub account/organisation, and also delete the cloned copy on your local machine.
