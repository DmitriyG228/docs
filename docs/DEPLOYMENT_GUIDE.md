# Guide: Updating the Website via gcloud CLI

This guide outlines the steps to update the website deployed on Google Cloud Run using the `gcloud` command-line interface.

## 1. Project Information

*   **Google Cloud Project ID:** `project`
*   **Cloud Run Service Name:** `docs-website`
*   **Region:** `us-central1`
*   **Deployment Directory (from workspace root):** `docs/`

## 2. Prerequisites

*   Ensure you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated.
*   Ensure Docker is running locally if you need to build images that require it (though `gcloud builds submit` often handles this in the cloud).
*   You may need `sudo` for `gcloud` commands if your user doesn't have direct Docker daemon access or if `gcloud` was initially configured with `sudo`.

## 3. Updating the Website

There are generally two main scenarios for updates:

### Scenario A: Code/Content Changes (Requires Rebuilding the Image)

If you have made changes to the application code, static assets, or anything that affects the Docker image content (e.g., updated `Dockerfile`, `package.json`, source files):

1.  **Navigate to the application directory (if not already there):**
    ```bash
    cd /path/to/your/prod/docs
    ```

2.  **Rebuild the Docker image and push it to Google Container Registry (GCR):**
    This command uses Google Cloud Build. It will look for your `Dockerfile` in the current directory (`docs/`).
    ```bash
    sudo gcloud builds submit --tag gcr.io/project/docs-website --project=project
    ```
    *   The `--tag` specifies the image name. Using `latest` is implicit if no specific tag version is given after a colon.
    *   The command is run from the `docs/` directory where your `Dockerfile` and application source code reside.

3.  **Deploy the new image to Cloud Run:**
    This command updates your `docs-website` service to use the newly built image.
    ```bash
    sudo gcloud run deploy docs-website \
        --image gcr.io/project/docs-website:latest \
        --platform managed \
        --region us-central1 \
        --project=project
    ```
    *   `--allow-unauthenticated` might be needed if your service is public and was initially set up that way. If you\'re only changing the image, it often inherits existing settings.
    *   If you need to update environment variables at the same time, see Scenario B.

### Scenario B: Only Environment Variable Changes

If you only need to change environment variables and the application code/image remains the same:

1.  **Update the service with the new environment variables:**
    ```bash
    sudo gcloud run services update docs-website \
        --platform managed \
        --region us-central1 \
        --update-env-vars SENDPULSE_USER_ID=,SENDPULSE_SECRET=,SENDPULSE_MAILING_LIST_ID=,NEXT_PUBLIC_APP_URL=https://vexa.ai,ADMIN_API_URL=https://gateway.dev.vexa.ai,NEXTAUTH_SECRET==,NEXTAUTH_URL=https://vexa.ai,ADMIN_API_TOKEN=\'&\',NEXT_PUBLIC_GA_MEASUREMENT_ID=,NEXT_PUBLIC_UMAMI_WEBSITE_ID= \
        --project=project
    ```
    *   Replace `KEY1=new_value1,KEY2=new_value2` with the actual variables you want to set or update.
    *   To remove an environment variable, use `--remove-env-vars KEY_TO_REMOVE`.
    *   To clear all environment variables, use `--clear-env-vars`.
    *   You can combine `--update-env-vars` and `--remove-env-vars` in the same command.

    **Example with your current set of variables (for reference, always use the latest required set):**
    ```bash
    sudo gcloud run services update docs-website \
        --platform managed \
        --region us-central1 \

        --project=project
    ```

## 4. Verifying the Deployment

*   After deployment, check the service URL provided by `gcloud` or navigate to your custom domain (`https://vexa.ai`, `https://www.vexa.ai`).
*   Monitor logs if issues arise:
    ```bash
    sudo gcloud logging read "resource.type=\\"cloud_run_revision\\" resource.labels.service_name=\\"docs-website\\" resource.labels.location=\\"us-central1\\"" --project=project --limit 50 --format json | cat
    ```
    (Adjust `--limit` as needed).

## 5. Managing Custom Domains

If you ever need to manage custom domain mappings (though this is usually a one-time setup unless domains change):

*   **List domain mappings:**
    ```bash
    sudo gcloud beta run domain-mappings list --project=project --region us-central1
    ```
*   **Describe a specific mapping (e.g., for `vexa.ai`):**
    ```bash
    sudo gcloud beta run domain-mappings describe --domain vexa.ai --project=project --region us-central1
    ```

Remember to replace placeholders like `/path/to/your/prod/docs` with the actual path on your system. 