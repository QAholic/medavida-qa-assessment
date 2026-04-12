# MedaVida QA Automation Assessment
## Blog Title Validation Tool

### Project Overview
This project is an automated testing solution built with **TypeScript**, **Crawlee**, and **Playwright**. It validates data consistency on the Crawlee Blog by ensuring that the menu labels on the main index page match the actual article titles upon navigation.

### Features
* **Dynamic Crawling:** Automatically discovers and follows blog post links.
* **Data Mapping:** Uses Crawlee's `userData` to pass state between the index page and detail pages to ensure validation accuracy.
* **Structured Reporting:** Automatically generates JSON reports of all test cases (Pass/Fail) in the `storage` directory.
* **Cloud Ready:** Fully Dockerized using a multi-stage build, making it ready for deployment to **AWS Lambda** or Apify.

### Local Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install