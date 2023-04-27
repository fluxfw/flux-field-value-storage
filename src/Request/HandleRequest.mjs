import { HttpServerResponse } from "../../../flux-http-api/src/Server/HttpServerResponse.mjs";

/** @typedef {import("../../../flux-authentication-backend/src/FluxAuthenticationBackend.mjs").FluxAuthenticationBackend} FluxAuthenticationBackend */
/** @typedef {import("../FluxFieldValueStorage.mjs").FluxFieldValueStorage} FluxFieldValueStorage */
/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class HandleRequest {
    /**
     * @type {FluxAuthenticationBackend}
     */
    #flux_authentication_backend;
    /**
     * @type {FluxFieldValueStorage}
     */
    #flux_field_value_storage;
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;

    /**
     * @param {FluxAuthenticationBackend} flux_authentication_backend
     * @param {FluxFieldValueStorage} flux_field_value_storage
     * @param {FluxHttpApi} flux_http_api
     * @returns {HandleRequest}
     */
    static new(flux_authentication_backend, flux_field_value_storage, flux_http_api) {
        return new this(
            flux_authentication_backend,
            flux_field_value_storage,
            flux_http_api
        );
    }

    /**
     * @param {FluxAuthenticationBackend} flux_authentication_backend
     * @param {FluxFieldValueStorage} flux_field_value_storage
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(flux_authentication_backend, flux_field_value_storage, flux_http_api) {
        this.#flux_authentication_backend = flux_authentication_backend;
        this.#flux_field_value_storage = flux_field_value_storage;
        this.#flux_http_api = flux_http_api;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse | null>}
     */
    async handleRequest(request) {
        const user_infos = await this.#flux_authentication_backend.handleAuthentication(
            request
        );

        if (user_infos instanceof HttpServerResponse) {
            return user_infos;
        }

        if (request.url.pathname.startsWith("/api/") || request.url.pathname === "/api") {
            return (await import("./HandleApiRequest.mjs")).HandleApiRequest.new(
                this.#flux_field_value_storage,
                this.#flux_http_api
            )
                .handleApiRequest(
                    request
                );
        }

        if (request.url.pathname.startsWith("/ui/") || request.url.pathname === "/ui") {
            return (await import("./HandleUIRequest.mjs")).HandleUIRequest.new(
                this.#flux_http_api
            )
                .handleUIRequest(
                    request
                );
        }

        return null;
    }
}
