# Setup build image
FROM node:20-buster-slim as buildenv
WORKDIR /source/
RUN npm install -g npm@latest

# Install system build tools
RUN apt-get update
RUN apt-get install python3 make g++ git -y

# Install npm packages
COPY package.json package-lock.json ./
RUN npm install

# Copy over rest of the essential files
COPY tsconfig.json prisma/ ./
COPY scripts/ ./scripts
COPY src/ ./src/
COPY .git/ ./.git/

# Build the necessary executable file
RUN npm run build
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