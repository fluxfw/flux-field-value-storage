FROM node:20-alpine AS build

RUN apk add --no-cache imagemagick

COPY bin/install-libraries.sh /build/flux-field-value-storage/libs/flux-field-value-storage/bin/install-libraries.sh
RUN /build/flux-field-value-storage/libs/flux-field-value-storage/bin/install-libraries.sh

RUN ln -s libs/flux-field-value-storage/bin /build/flux-field-value-storage/bin

COPY . /build/flux-field-value-storage/libs/flux-field-value-storage

RUN /build/flux-field-value-storage/libs/flux-field-value-storage/bin/build.mjs prod

FROM node:20-alpine

USER node:node

ENTRYPOINT ["/flux-field-value-storage/bin/server.mjs"]

COPY --from=build /build /
