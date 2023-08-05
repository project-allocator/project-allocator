# Project Allocator v3

Welcome to Project Allocator v3!

This is the repository that contains:

* GitHub workflow to deploy the Docker images in the cloud.
* Scripts to setup development environment.
* `docker-compose.yaml` to build and run the Docker images locally.

## Setting up the Development Environment

### Using the Setup Script

First, you need to clone this repository with `git clone https://github.com/Digital-Garage-ICL/project-allocator-deploy`.

Inside the cloned repository you will find the `setup.sh` script. 
You can run it as follows:

```bash
./scripts/setup_dev.sh
```

This will complete the following tasks for you:

* Clone the required repositories.
    * From the same GitHub account/orgnaisation which this repository was cloned from.
* Build and run the Docker images specified in `docker-compose.yaml`.
* Initialise and seed the database running in the Docker container.

If you encounter an error, you will need to manually setup your development environment. 
See the "Manual Setup" for more details.

Once it runs successfully you're reay to start coding! 
Visit the repositories for the frontend/backed for detailed instructions on how to get started.

### Manual Setup (Not Recommended)

If you wish to manually setup the development environment, you can start by cloning the required repositories:

```bash
mkdir project-allocator && cd project-allocator
git clone https://github.com/Digital-Garage-ICL/project-allocator-deploy
git clone https://github.com/Digital-Garage-ICL/project-allocator-frontend
git clone https://github.com/Digital-Garage-ICL/project-allocator-backend
```

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

Now you need to move onto the `project-allocator-frontend` repository and generate the frontend client scripts, which will be used by the React components to call the backend API:

```bash
cd ../project-allocator-frontend && yarn generate
```

Finally, you can check if everything is working by visiting [http://localhost:3000](http://localhost:3000) on your browser. You can also visit [http://localhost:8000/docs](http://localhost:8000/docs) to check the backend's Open API documentation.

## Setting up the Production Environment

You can setup the production environment and enable automatic deployment of your application using Wayfinder.
The deployment will be triggered every time you push to this repository on the `main` branch.

First, you need to clone this repository with `git clone https://github.com/Digital-Garage-ICL/project-allocator-deploy`.

To begin with, check if you have a Wayfinder workspace created to deploy this application. 
If not, you can create a new workspace with the `setup.sh` script, which you will find in the cloned repository:

```bash
./scripts/setup_prod.sh
```

When it prompts "Do you already have a Wayfinder workspace (yes/no)?", type "yes", and it will ask you for the necessary information and create a workspace for you.
Note that the workspace name must consist of 2-5 alphanumeric characters and must be unique within the Wayfinder cluster.

Now you can navigate to the Wayfinder UI at [https://portal-20-0-245-170.go.wayfinder.run/](https://portal-20-0-245-170.go.wayfinder.run/) and start creating your Wayfinder application.
The URL of your workspace should be output by the `setup.sh` script.

Finally, you are ready to setup your GitHub workflow! Simply run the `setup.sh` script as follows:

```bash
./scripts/setup_repo.sh
```

and when it prompts "Do you already have a Wayfinder workspace (yes/no)?", type "no" to continue.

This will complete the following tasks for you:

* Store the configuration of your Wayfinder application to this repository's GitHub variables.
* Obtain a Wayfinder access token and store it in this repository's GitHub secrets.
* Store the GitHub personal access token to Kubernetes secrets so that the Kubernetes cluster can pull your Docker images.

## Setting up the Microsoft SSO

TODO: Tutorial on how to setup Azure app registrations

## Connecting to the Azure Database

TODO: Tutorial on how to connect to the Azure database.

```bash
./scripts/connect_db.sh
```