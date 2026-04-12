# Use the official Apify Node + Playwright + Chrome image
FROM apify/actor-node-playwright-chrome:20

# Copy all files into the container
COPY --chown=myuser . ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm install --include=dev --audit=false

# Compile TypeScript to JavaScript
RUN npm run build

# Set the command to run the crawler
# start_xvfb handles the virtual display for the browser
CMD ./start_xvfb_and_run_cmd.sh && npm run start:prod --silent