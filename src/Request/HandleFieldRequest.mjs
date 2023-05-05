import { HttpServerResponse } from "../../../flux-http-api/src/Server/HttpServerResponse.mjs";
import { METHOD_DELETE, METHOD_GET, METHOD_HEAD, METHOD_POST, METHOD_PUT } from "../../../flux-http-api/src/Method/METHOD.mjs";
import { STATUS_CODE_400, STATUS_CODE_404 } from "../../../flux-http-api/src/Status/STATUS_CODE.mjs";

/** @typedef {import("../FluxFieldValueStorage.mjs").FluxFieldValueStorage} FluxFieldValueStorage */
/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class HandleFieldRequest {
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
     * @returns {HandleFieldRequest}
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
    async handleFieldRequest(request) {
        if (!request.url.pathname.startsWith("/api/field/")) {
            return null;
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "delete") {
            return this.#deleteField(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "get") {
            return this.#getField(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "get-inputs") {
            return this.#getFieldInputs(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "get") {
            return this.#getFields(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "get-table") {
            return this.#getFieldTable(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "get-type-inputs") {
            return this.#getFieldTypeFieldInputs(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "get-type-inputs") {
            return this.#getFieldTypeInputs(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "move-down") {
            return this.#moveFieldDown(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "move-up") {
            return this.#moveFieldUp(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "set-positions") {
            return this.#setFieldPositions(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "store") {
            return this.#storeField(
                request
            );
        }

        return null;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #deleteField(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_DELETE
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            name
        ] = request.url_path_parts;

        await this.#flux_field_value_storage.deleteField(
            name
        );

        return HttpServerResponse.new();
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getField(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            name
        ] = request.url_path_parts;

        const field = await this.#flux_field_value_storage.getField(
            name
        );

        if (field === null) {
            return HttpServerResponse.text(
                "Field not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.json(
            field
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getFieldInputs(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            name
        ] = request.url_path_parts;

        const inputs = await this.#flux_field_value_storage.getFieldInputs(
            null,
            name
        );

        if (inputs === null) {
            return HttpServerResponse.text(
                "Field not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.json(
            inputs
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getFields(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        return HttpServerResponse.json(
            await this.#flux_field_value_storage.getFields()
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getFieldTable(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        return HttpServerResponse.json(
            await this.#flux_field_value_storage.getFieldTable()
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getFieldTypeFieldInputs(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            type
        ] = request.url_path_parts;

        const inputs = await this.#flux_field_value_storage.getFieldInputs(
            type
        );

        if (inputs === null) {
            return HttpServerResponse.text(
                "Type not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.json(
            inputs
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getFieldTypeInputs(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        return HttpServerResponse.json(
            await this.#flux_field_value_storage.getFieldTypeInputs()
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #moveFieldDown(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_POST
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            name
        ] = request.url_path_parts;

        const ok = await this.#flux_field_value_storage.moveFieldDown(
            name
        );

        if (!ok) {
            return HttpServerResponse.text(
                "Field not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.new();
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #moveFieldUp(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_POST
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            name
        ] = request.url_path_parts;

        const ok = await this.#flux_field_value_storage.moveFieldUp(
            name
        );

        if (!ok) {
            return HttpServerResponse.text(
                "Field not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.new();
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #setFieldPositions(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_PUT
            ]
        );

        if (response !== null) {
            return response;
        }

        let names;
        try {
            names = await request.body.json();
        } catch (error) {
            console.error(error);

            return HttpServerResponse.text(
                "Invalid body",
                STATUS_CODE_400
            );
        }

        const ok = await this.#flux_field_value_storage.setFieldPositions(
            names
        );

        if (!ok) {
            return HttpServerResponse.text(
                "Invalid fields",
                STATUS_CODE_400
            );
        }

        return HttpServerResponse.new();
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #storeField(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_PUT
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            name
        ] = request.url_path_parts;

        let field;
        try {
            field = await request.body.json();
        } catch (error) {
            console.error(error);

            return HttpServerResponse.text(
                "Invalid body",
                STATUS_CODE_400
            );
        }

        const ok = await this.#flux_field_value_storage.storeField(
            name,
            field
        );

        if (!ok) {
            return HttpServerResponse.text(
                "Invalid field",
                STATUS_CODE_400
            );
        }

        return HttpServerResponse.new();
    }
}
