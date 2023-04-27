/** @typedef {import("../FluxFieldValueStorage.mjs").FluxFieldValueStorage} FluxFieldValueStorage */
/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */

export class HandleApiRequest {
    /**
     * @type {FluxFieldValueStorage}
     */
    #flux_field_value_storage;
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;

    /**
     * @param {FluxFieldValueStorage} flux_field_value_storage
     * @param {FluxHttpApi} flux_http_api
     * @returns {HandleApiRequest}
     */
    static new(flux_field_value_storage, flux_http_api) {
        return new this(
            flux_field_value_storage,
            flux_http_api
        );
    }

    /**
     * @param {FluxFieldValueStorage} flux_field_value_storage
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(flux_field_value_storage, flux_http_api) {
        this.#flux_field_value_storage = flux_field_value_storage;
        this.#flux_http_api = flux_http_api;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse | null>}
     */
    async handleApiRequest(request) {
        if (request.url.pathname.startsWith("/api/field/") || request.url.pathname === "/api/field") {
            return (await import("./HandleFieldRequest.mjs")).HandleFieldRequest.new(
                this.#flux_field_value_storage,
                this.#flux_http_api
            )
                .handleFieldRequest(
                    request
                );
        }

        if (request.url.pathname.startsWith("/api/value/") || request.url.pathname === "/api/value") {
            return (await import("./HandleValueRequest.mjs")).HandleValueRequest.new(
                this.#flux_field_value_storage,
                this.#flux_http_api
            )
                .handleValueRequest(
                    request
                );
        }

        return null;
    }
}
