import { CONFIG_ENV_PREFIX } from "./Config/CONFIG.mjs";
import { AUTHENTICATION_CONFIG_DEFAULT_USER, AUTHENTICATION_CONFIG_PASSWORD_KEY, AUTHENTICATION_CONFIG_USER_KEY } from "./Authentication/AUTHENTICATION_CONFIG.mjs";
import { COLLECTION_NAME_FIELD, COLLECTION_NAME_VALUE } from "./Collection/COLLECTION_NAME.mjs";
import { FLUX_MONGO_DB_CONNECTOR_DEFAULT_HOST, FLUX_MONGO_DB_CONNECTOR_DEFAULT_PORT } from "../../flux-mongo-db-connector/src/FLUX_MONGO_DB_CONNECTOR.mjs";
import { MONGO_DB_CONFIG_DATABASE_KEY, MONGO_DB_CONFIG_DEFAULT_DATABASE, MONGO_DB_CONFIG_DEFAULT_USER, MONGO_DB_CONFIG_HOST_KEY, MONGO_DB_CONFIG_PASSWORD_KEY, MONGO_DB_CONFIG_PORT_KEY, MONGO_DB_CONFIG_USER_KEY } from "./MongoDb/MONGO_DB_CONFIG.mjs";
import { SERVER_CONFIG_DISABLE_HTTP_IF_HTTPS_KEY, SERVER_CONFIG_HTTPS_CERTIFICATE_KEY, SERVER_CONFIG_HTTPS_DHPARAM_KEY, SERVER_CONFIG_HTTPS_KEY_KEY, SERVER_CONFIG_LISTEN_HTTP_PORT_KEY, SERVER_CONFIG_LISTEN_HTTPS_PORT_KEY, SERVER_CONFIG_LISTEN_INTERFACE_KEY, SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_KEY, SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_PORT_KEY, SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE_KEY } from "./Server/SERVER_CONFIG.mjs";
import { SERVER_DEFAULT_DISABLE_HTTP_IF_HTTPS, SERVER_DEFAULT_LISTEN_HTTP_PORT, SERVER_DEFAULT_LISTEN_HTTPS_PORT, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE } from "../../flux-http-api/src/Server/SERVER.mjs";

/** @typedef {import("mongodb").Collection} Collection */
/** @typedef {import("mongodb").Db} Db */
/** @typedef {import("./Field/Field.mjs").Field} Field */
/** @typedef {import("./Field/FieldService.mjs").FieldService} FieldService */
/** @typedef {import("./FieldType/FieldTypeService.mjs").FieldTypeService} FieldTypeService */
/** @typedef {import("../../flux-authentication-backend/src/FluxAuthenticationBackend.mjs").FluxAuthenticationBackend} FluxAuthenticationBackend */
/** @typedef {import("../../flux-config-api/src/FluxConfigApi.mjs").FluxConfigApi} FluxConfigApi */
/** @typedef {import("../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../flux-mongo-db-connector/src/FluxMongoDbConnector.mjs").FluxMongoDbConnector} FluxMongoDbConnector */
/** @typedef {import("../../flux-shutdown-handler/src/FluxShutdownHandler.mjs").FluxShutdownHandler} FluxShutdownHandler */
/** @typedef {import("../../flux-overlay/src/Input.mjs").Input} Input */
/** @typedef {import("./Value/Value.mjs").Value} Value */
/** @typedef {import("./Value/ValueService.mjs").ValueService} ValueService */

export class FluxFieldValueStorage {
    /**
     * @type {FieldService | null}
     */
    #field_service = null;
    /**
     * @type {FieldTypeService | null}
     */
    #field_type_service = null;
    /**
     * @type {FluxAuthenticationBackend | null}
     */
    #flux_authentication_backend = null;
    /**
     * @type {FluxConfigApi | null}
     */
    #flux_config_api = null;
    /**
     * @type {FluxHttpApi | null}
     */
    #flux_http_api = null;
    /**
     * @type {FluxMongoDbConnector | null}
     */
    #flux_mongo_db_connector = null;
    /**
     * @type {FluxShutdownHandler}
     */
    #flux_shutdown_handler;
    /**
     * @type {Db | null}
     */
    #mongo_db = null;
    /**
     * @type {ValueService | null}
     */
    #value_service = null;

    /**
     * @param {FluxShutdownHandler} flux_shutdown_handler
     * @returns {FluxFieldValueStorage}
     */
    static new(flux_shutdown_handler) {
        return new this(
            flux_shutdown_handler
        );
    }

    /**
     * @param {FluxShutdownHandler} flux_shutdown_handler
     * @private
     */
    constructor(flux_shutdown_handler) {
        this.#flux_shutdown_handler = flux_shutdown_handler;
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async deleteField(name) {
        const field_service = await this.#getFieldService();

        const field = await field_service.getField(
            name,
            false
        );

        await field_service.deleteField(
            name
        );

        if (field !== null) {
            await (await this.#getValueService()).deleteValueField(
                field.id
            );
        }
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async deleteValue(name) {
        await (await this.#getValueService()).deleteValue(
            name
        );
    }

    /**
     * @param {string} name
     * @returns {Promise<Field[]>}
     */
    async getField(name) {
        const field = await (await this.#getFieldService()).getField(
            name
        );

        if (field === null) {
            return null;
        }

        delete field.id;
        delete field.position;

        return field;
    }

    /**
     * @param {string | null} type
     * @param {string | null} name
     * @returns {Promise<Input[] | null>}
     */
    async getFieldInputs(type = null, name = null) {
        return (await this.#getFieldService()).getFieldInputs(
            type,
            name
        );
    }

    /**
     * @returns {Promise<Field[]>}
     */
    async getFields() {
        return (await (await this.#getFieldService()).getFields()).map(field => {
            delete field.id;
            delete field.position;

            return field;
        });
    }

    /**
     * @returns {Promise<{columns: {[key: string]: string}[], rows: {[key: string]: string}[]}>}
     */
    async getFieldTable() {
        return (await this.#getFieldService()).getFieldTable();
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getFieldTypeInputs() {
        return (await this.#getFieldService()).getFieldTypeInputs();
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getNewValueInputs() {
        return (await this.#getValueService()).getNewValueInputs();
    }

    /**
     * @param {string} name
     * @returns {Promise<Value | null>}
     */
    async getValue(name) {
        const field_type_service = await this.#getFieldTypeService();

        const value = await (await this.#getValueService()).getValue(
            name
        );

        if (value === null) {
            return null;
        }

        const field_values = [];

        for (const field of await (await this.#getFieldService()).getFields()) {
            field_values.push({
                name: field.name,
                value: await field_type_service.mapGetValue(
                    field,
                    value.values.find(field_value => field_value.id === field.id)?.value ?? null
                )
            });
        }

        return {
            name: value.name,
            values: field_values
        };
    }

    /**
     * @param {string} name
     * @returns {Promise<{[key: string]: string} | null>}
     */
    async getValueAsText(name) {
        const value = await this.getValue(
            name
        );

        if (value === null) {
            return null;
        }

        return (await this.#getFieldService()).getValueAsText(
            value
        );
    }

    /**
     * @param {string | null} name
     * @returns {Promise<Input[] | null>}
     */
    async getValueInputs(name = null) {
        let value = null;

        if (name !== null) {
            value = await this.getValue(
                name
            );

            if (value === null) {
                return null;
            }
        }

        return (await this.#getFieldService()).getValueInputs(
            value !== null ? Object.fromEntries(value.values.map(field_value => [
                field_value.name,
                field_value.value
            ])) : null
        );
    }

    /**
     * @returns {Promise<Value[]>}
     */
    async getValues() {
        const field_type_service = await this.#getFieldTypeService();

        const fields = await (await this.#getFieldService()).getFields();

        const values = [];

        for (const value of await (await this.#getValueService()).getValues()) {
            const field_values = [];

            for (const field of fields) {
                field_values.push({
                    name: field.name,
                    value: await field_type_service.mapGetValue(
                        field,
                        value.values.find(field_value => field_value.id === field.id)?.value ?? null
                    )
                });
            }

            values.push({
                name: value.name,
                values: field_values
            });
        }

        return values;
    }

    /**
     * @returns {Promise<{columns: {[key: string]: string}[], rows: {[key: string]: string}[]}>}
     */
    async getValueTable() {
        return (await this.#getFieldService()).getValueTable(
            await this.getValues()
        );
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async moveFieldDown(name) {
        return (await this.#getFieldService()).moveFieldDown(
            name
        );
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async moveFieldUp(name) {
        return (await this.#getFieldService()).moveFieldUp(
            name
        );
    }

    /**
     * @returns {Promise<void>}
     */
    async runServer() {
        const flux_config_api = await this.#getFluxConfigApi();

        await (await this.#getFluxHttpApi()).runServer(
            async request => (await import("./Request/HandleRequest.mjs")).HandleRequest.new(
                await this.#getFluxAuthenticationBackend(),
                this,
                await this.#getFluxHttpApi()
            )
                .handleRequest(
                    request
                ),
            {
                disable_http_if_https: await flux_config_api.getConfig(
                    SERVER_CONFIG_DISABLE_HTTP_IF_HTTPS_KEY,
                    SERVER_DEFAULT_DISABLE_HTTP_IF_HTTPS
                ),
                https_certificate: await flux_config_api.getConfig(
                    SERVER_CONFIG_HTTPS_CERTIFICATE_KEY,
                    null,
                    false
                ),
                https_dhparam: await flux_config_api.getConfig(
                    SERVER_CONFIG_HTTPS_DHPARAM_KEY,
                    null,
                    false
                ),
                https_key: await flux_config_api.getConfig(
                    SERVER_CONFIG_HTTPS_KEY_KEY,
                    null,
                    false
                ),
                listen_http_port: await flux_config_api.getConfig(
                    SERVER_CONFIG_LISTEN_HTTP_PORT_KEY,
                    SERVER_DEFAULT_LISTEN_HTTP_PORT
                ),
                listen_https_port: await flux_config_api.getConfig(
                    SERVER_CONFIG_LISTEN_HTTPS_PORT_KEY,
                    SERVER_DEFAULT_LISTEN_HTTPS_PORT
                ),
                listen_interface: await flux_config_api.getConfig(
                    SERVER_CONFIG_LISTEN_INTERFACE_KEY,
                    null,
                    false
                ),
                redirect_http_to_https: await flux_config_api.getConfig(
                    SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_KEY,
                    SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS
                ),
                redirect_http_to_https_port: await flux_config_api.getConfig(
                    SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_PORT_KEY,
                    SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT
                ),
                redirect_http_to_https_status_code: await flux_config_api.getConfig(
                    SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE_KEY,
                    SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE
                )
            }
        );
    }

    /**
     * @param {string[]} names
     * @returns {Promise<boolean>}
     */
    async setFieldPositions(names) {
        return (await this.#getFieldService()).setFieldPositions(
            names
        );
    }

    /**
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async storeField(field) {
        return (await this.#getFieldService()).storeField(
            field
        );
    }

    /**
     * @param {Value} value
     * @param {boolean | null} keep_other_field_values
     * @returns {Promise<boolean>}
     */
    async storeValue(value, keep_other_field_values = null) {
        const field_type_service = await this.#getFieldTypeService();
        const value_service = await this.#getValueService();

        if (value === null || typeof value !== "object") {
            return false;
        }

        if (typeof value.name !== "string" || value.name === "") {
            return false;
        }

        if (!Array.isArray(value.values) || value.values.length === 0 || value.values.some(field_value => field_value === null || typeof field_value !== "object" || typeof field_value.name !== "string" || field_value.name === "")) {
            return false;
        }

        const _field_values = keep_other_field_values ?? false ? Object.fromEntries((await value_service.getValue(
            value.name
        )).values.map(field_value => [
            field_value.id,
            field_value.value
        ])) : {};

        const fields = await (await this.#getFieldService()).getFields();

        for (const field_value of value.values) {
            const field = fields.find(_field => _field.name === field_value.name) ?? null;

            if (field === null) {
                return false;
            }

            _field_values[field.id] = field_value.value;
        }

        const field_values = [];

        for (const field of fields) {
            const _value = _field_values[field.id] ?? null;

            if (!await field_type_service.validateValue(
                field,
                _value
            )) {
                return false;
            }

            field_values.push({
                id: field.id,
                value: await field_type_service.mapStoreValue(
                    field,
                    _value
                )
            });
        }

        return value_service.storeValue(
            {
                name: value.name,
                values: field_values
            }
        );
    }

    /**
     * @returns {Promise<Collection>}
     */
    async #getFieldCollection() {
        return (await this.#getMongoDb()).collection(COLLECTION_NAME_FIELD);
    }

    /**
     * @returns {Promise<FieldService>}
     */
    async #getFieldService() {
        this.#field_service ??= (await import("./Field/FieldService.mjs")).FieldService.new(
            await this.#getFieldCollection(),
            await this.#getFieldTypeService()
        );

        return this.#field_service;
    }

    /**
     * @returns {Promise<FieldTypeService>}
     */
    async #getFieldTypeService() {
        this.#field_type_service ??= (await import("./FieldType/FieldTypeService.mjs")).FieldTypeService.new();

        return this.#field_type_service;
    }

    /**
     * @returns {Promise<FluxAuthenticationBackend>}
     */
    async #getFluxAuthenticationBackend() {
        if (this.#flux_authentication_backend === null) {
            const flux_config_api = await this.#getFluxConfigApi();

            this.#flux_authentication_backend ??= (await import("../../flux-authentication-backend/src/FluxBasicAuthenticationBackend.mjs")).FluxBasicAuthenticationBackend.new(
                await this.#getFluxHttpApi(),
                {
                    [await flux_config_api.getConfig(
                        AUTHENTICATION_CONFIG_USER_KEY,
                        AUTHENTICATION_CONFIG_DEFAULT_USER
                    )]: await flux_config_api.getConfig(
                        AUTHENTICATION_CONFIG_PASSWORD_KEY
                    )
                }
            );
        }

        return this.#flux_authentication_backend;
    }

    /**
     * @returns {Promise<FluxConfigApi>}
     */
    async #getFluxConfigApi() {
        this.#flux_config_api ??= (await import("../../flux-config-api/src/FluxConfigApi.mjs")).FluxConfigApi.new(
            await (await import("../../flux-config-api/src/getValueProviderImplementations.mjs")).getValueProviderImplementations(
                CONFIG_ENV_PREFIX
            )
        );

        return this.#flux_config_api;
    }

    /**
     * @returns {Promise<FluxHttpApi>}
     */
    async #getFluxHttpApi() {
        this.#flux_http_api ??= (await import("../../flux-http-api/src/FluxHttpApi.mjs")).FluxHttpApi.new(
            this.#flux_shutdown_handler
        );

        return this.#flux_http_api;
    }

    /**
     * @returns {Promise<FluxMongoDbConnector>}
     */
    async #getFluxMongoDbConnector() {
        this.#flux_mongo_db_connector ??= (await import("../../flux-mongo-db-connector/src/FluxMongoDbConnector.mjs")).FluxMongoDbConnector.new(
            this.#flux_shutdown_handler
        );

        return this.#flux_mongo_db_connector;
    }

    /**
     * @returns {Promise<Db>}
     */
    async #getMongoDb() {
        if (this.#mongo_db === null) {
            const flux_config_api = await this.#getFluxConfigApi();

            this.#mongo_db ??= await (await this.#getFluxMongoDbConnector()).getMongoDb(
                await flux_config_api.getConfig(
                    MONGO_DB_CONFIG_DATABASE_KEY,
                    MONGO_DB_CONFIG_DEFAULT_DATABASE
                ),
                await flux_config_api.getConfig(
                    MONGO_DB_CONFIG_USER_KEY,
                    MONGO_DB_CONFIG_DEFAULT_USER
                ),
                await flux_config_api.getConfig(
                    MONGO_DB_CONFIG_PASSWORD_KEY
                ),
                await flux_config_api.getConfig(
                    MONGO_DB_CONFIG_HOST_KEY,
                    FLUX_MONGO_DB_CONNECTOR_DEFAULT_HOST
                ),
                await flux_config_api.getConfig(
                    MONGO_DB_CONFIG_PORT_KEY,
                    FLUX_MONGO_DB_CONNECTOR_DEFAULT_PORT
                )
            );
        }

        return this.#mongo_db;
    }

    /**
     * @returns {Promise<Collection>}
     */
    async #getValueCollection() {
        return (await this.#getMongoDb()).collection(COLLECTION_NAME_VALUE);
    }

    /**
     * @returns {Promise<ValueService>}
     */
    async #getValueService() {
        this.#value_service ??= (await import("./Value/ValueService.mjs")).ValueService.new(
            await this.#getValueCollection()
        );

        return this.#value_service;
    }
}
