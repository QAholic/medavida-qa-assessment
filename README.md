# MedaVida QA Automation Assessment
## Blog Title Validation Tool (AWS Lambda + Docker)

### Project Overview
This project is an advanced automated testing solution built with **TypeScript**, **Crawlee**, and **Playwright**. It performs cross-page data validation on the Crawlee Blog, ensuring that UI labels on the index page match the actual H1 titles on the linked article pages.

### Key Features
* **Dynamic Crawling:** Leverages Crawlee’s RequestQueue for efficient discovery.
* **State Management:** Uses `userData` to carry expected titles across different page contexts for validation.
* **Serverless Architecture:** Fully containerized with Docker and deployed to **AWS Lambda**.
* **Dependency Management:** Custom Docker configuration to handle Chromium system dependencies (libxkbcommon, etc.) in a headless Amazon Linux environment.

### Tech Stack
* **Language:** TypeScript
* **Framework:** Crawlee / Playwright (Chromium)
* **Infrastructure:** Docker, AWS ECR, AWS Lambda
* **Environment:** Node.js 20

### Deployment & Cloud Execution
The project is designed to run as a serverless function:
1.  **Dockerized:** Uses a custom `Dockerfile` with required system libraries for Playwright.
2.  **AWS ECR:** Image is hosted on Amazon Elastic Container Registry.
3.  **AWS Lambda:** Triggered via Test events or a Function URL, with a configured 2048MB memory and 5-minute timeout for stable browser execution.

### Local Setup
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run locally:
    ```bash
    npm start
    ```

### Results
The tool generates a structured JSON response (accessible via AWS Function URL) containing:
* URL visited
* Expected Title
* Actual Title
* Status (PASSED/FAILED)