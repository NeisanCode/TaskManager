# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /build

# package-lock.json is copied first so `npm ci` is only re-run when the
# dependencies change, not on every source code change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Run ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80