# Use the official AWS Lambda Node.js image
FROM public.ecr.aws/lambda/nodejs:20

# Install Playwright dependencies for Amazon Linux
RUN yum install -y amazon-linux-extras
RUN yum install -y cups-libs libXcomposite libXcursor libXdamage libXext libXi libXrandr libXscrnSaver libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb xorg-x11-xauth dbus-glib nss nss-tools

WORKDIR ${LAMBDA_TASK_ROOT}

# Install app dependencies
COPY package*.json ./
RUN npm install

# Build the app
COPY . .
RUN npm run build

# Set the Lambda handler
CMD [ "dist/main.handler" ]