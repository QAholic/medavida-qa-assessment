# Base image with Playwright and Chrome pre-installed
FROM apify/actor-node-playwright-chrome:20

# Copy all project files
COPY --chown=myuser . ./

# Install dependencies and build
RUN npm install --include=dev --audit=false
RUN npm run build

# Start the crawler using the virtual display script
CMD ./start_xvfb_and_run_cmd.sh && npm run start:prod --silent