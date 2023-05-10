FROM node:20-alpine AS build

COPY bin/install-libraries.sh /build/flux-field-value-storage/libs/flux-field-value-storage/bin/install-libraries.sh
RUN /build/flux-field-value-storage/libs/flux-field-value-storage/bin/install-libraries.sh

RUN ln -s libs/flux-field-value-storage/bin /build/flux-field-value-storage/bin

COPY . /build/flux-field-value-storage/libs/flux-field-value-storage

RUN /build/flux-field-value-storage/libs/flux-field-value-storage/bin/generate-pwa.mjs

FROM node:20-alpine

USER node:node

ENTRYPOINT ["/flux-field-value-storage/bin/server.mjs"]

COPY --from=build /build /
