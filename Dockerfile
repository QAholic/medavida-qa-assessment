FROM public.ecr.aws/lambda/nodejs:20

# 1. SET PERMANENT PATHS
ENV CRAWLEE_STORAGE_DIR=/tmp/crawlee_storage
ENV PLAYWRIGHT_BROWSERS_PATH=/var/task/bin/browsers

# 2. INSTALL SYSTEM DEPENDENCIES (Added libxkbcommon and others)
RUN dnf install -y \
    atk at-spi2-atk cups-libs libdrm libXcomposite libXdamage \
    libXext libXfixes libXrandr libgbm pango alsa-lib nss mesa-libgbm \
    libxkbcommon xorg-x11-server-utils mesa-libEGL

WORKDIR /var/task

# Copy package files
COPY package.json package-lock.json ./

# 3. INSTALL PLAYWRIGHT & BROWSER BINARIES
RUN npm install
RUN npx playwright install chromium

# Copy source code
COPY . .

# Build TypeScript
RUN npx tsc --noUnusedParameters false

# Set the Lambda handler
CMD [ "dist/main.handler" ]