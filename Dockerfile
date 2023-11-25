# Setup build image
FROM node:20-buster-slim as buildenv
WORKDIR /source/
RUN npm install -g npm@latest

# Setup Build Env Variable
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

# Install system build tools
RUN apt-get update
RUN apt-get install python3 make g++ git -y

# Install npm packages
COPY package.json package-lock.json ./
RUN npm install

# Copy all build files and build
COPY tsconfig.json prisma/ ./
COPY scripts/ ./scripts
RUN chmod +x ./scripts/*
COPY src/ ./src/
RUN npm run build

# Passthrough git to keep commit hash up to date
COPY .git/ ./.git/
RUN echo $(git -C /source/ rev-parse HEAD) > "commitHash"

# Perform build cleanup (or post-build stuff)
RUN scripts/sentryDeploy.sh
RUN npm prune --production



# Setup production image
FROM node:20-buster-slim

# Setup the environment?
WORKDIR /app/
ENV ISDOCKER=true

# Install/upgrade some system packages
RUN npm install -g npm@latest
RUN apt-get update
RUN apt-get install fonts-noto ffmpeg -y

# Copy files from the build env
COPY --from=buildenv /source/dist /app/
COPY --from=buildenv /source/node_modules /app/node_modules/
COPY --from=buildenv /source/commitHash /app/commitHash

# Exposed web server port
EXPOSE ${WEBSERVER_PORT}

CMD node index.js