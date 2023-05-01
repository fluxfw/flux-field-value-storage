import { COLOR_SCHEME_LIGHT } from "./Libs/flux-color-scheme/src/ColorScheme/COLOR_SCHEME.mjs";
import { flux_css_api } from "./Libs/flux-css-api/src/FluxCssApi.mjs";
import { HttpClientRequest } from "./Libs/flux-http-api/src/Client/HttpClientRequest.mjs";
import { METHOD_DELETE, METHOD_POST, METHOD_PUT } from "./Libs/flux-http-api/src/Method/METHOD.mjs";

/** @typedef {import("./Libs/flux-button-group/src/FluxButtonGroupElement.mjs").FluxButtonGroupElement} FluxButtonGroupElement */
/** @typedef {import("./Libs/flux-color-scheme/src/FluxColorScheme.mjs").FluxColorScheme} FluxColorScheme */
/** @typedef {import("./Libs/flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./Libs/flux-pwa-api/src/FluxPwaApi.mjs").FluxPwaApi} FluxPwaApi */

flux_css_api.adopt(
    document,
    await flux_css_api.import(
        `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/Layout/style.css`
    )
);

export class FluxFieldValueStorageUI {
    /**
     * @type {FluxButtonGroupElement | null}
     */
    #flux_button_group_element = null;
    /**
     * @type {FluxColorScheme | null}
     */
    #flux_color_scheme = null;
    /**
     * @type {FluxHttpApi | null}
     */
    #flux_http_api = null;
    /**
     * @type {FluxPwaApi | null}
     */
    #flux_pwa_api = null;
    /**
     * @type {HTMLDivElement | null}
     */
    #fields_element = null;
    /**
     * @type {boolean}
     */
    #get_fields;
    /**
     * @type {boolean}
     */
    #get_values;
    /**
     * @type {HTMLDivElement | null}
     */
    #values_element = null;

    /**
     * @returns {FluxFieldValueStorageUI}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {
        this.#get_fields = false;
        this.#get_values = false;
    }

    /**
     * @returns {Promise<void>}
     */
    async showUI() {
        await this.#init();

        const {
            FLUX_BUTTON_GROUP_INPUT_EVENT,
            FluxButtonGroupElement
        } = await import("./Libs/flux-button-group/src/FluxButtonGroupElement.mjs");
        this.#flux_button_group_element = FluxButtonGroupElement.new(
            [
                {
                    label: "Fields",
                    value: "fields"
                },
                {
                    label: "Values",
                    selected: true,
                    value: "values"
                }
            ]
        );
        this.#flux_button_group_element.addEventListener(FLUX_BUTTON_GROUP_INPUT_EVENT, async e => {
            this.#fields_element.style.display = "none";
            this.#values_element.style.display = "none";

            switch (e.detail.value) {
                case "fields":
                    this.#fields_element.style.display = "";
                    this.#getFields();
                    break;

                case "values":
                    this.#values_element.style.display = "";
                    this.#getValues();
                    break;

                default:
                    break;
            }
        });
        document.body.appendChild(this.#flux_button_group_element);

        this.#fields_element = document.createElement("div");
        this.#fields_element.style.display = "none";
        document.body.appendChild(this.#fields_element);

        this.#values_element = document.createElement("div");
        document.body.appendChild(this.#values_element);
        this.#getValues();
    }

    /**
     * @returns {Promise<void>}
     */
    async #addField() {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = FluxOverlayElement.new(
            "Add field"
        );
        await flux_overlay_element.showLoading();
        flux_overlay_element.show();

        let type_inputs;
        try {
            type_inputs = await this.#request(
                "field/get-type-inputs"
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Add field",
                "Error!",
                "OK"
            );

            return;
        }

        await flux_overlay_element.showLoading(
            false
        );
        await flux_overlay_element.setInputs(
            type_inputs
        );
        flux_overlay_element.buttons = [
            {
                label: "Cancel",
                value: "cancel"
            },
            {
                label: "Next",
                value: "next"
            }
        ];

        const type_result = await flux_overlay_element.wait(
            null,
            null,
            false
        );
        if (type_result.button !== "next") {
            flux_overlay_element.remove();
            return;
        }

        await flux_overlay_element.setInputs(
            true
        );
        flux_overlay_element.buttons = true;
        await flux_overlay_element.showLoading();

        let inputs;
        try {
            inputs = await this.#request(
                `field/get-type-inputs/${type_result.inputs.find(value => value.name === "type").value}`
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Add field",
                "Error!",
                "OK"
            );

            return;
        }

        await flux_overlay_element.showLoading(
            false
        );
        await flux_overlay_element.setInputs(
            inputs
        );
        flux_overlay_element.buttons = [
            {
                label: "Cancel",
                value: "cancel"
            },
            {
                label: "Add",
                value: "add"
            }
        ];

        const result = await flux_overlay_element.wait(
            null,
            null,
            false
        );
        if (result.button !== "add") {
            flux_overlay_element.remove();
            return;
        }

        await flux_overlay_element.setInputs(
            true
        );
        flux_overlay_element.buttons = true;
        await flux_overlay_element.showLoading();

        try {
            await this.#request(
                `field/store/${result.inputs.find(value => value.name === "name").value}`,
                Object.fromEntries(result.inputs.map(value => [
                    value.name,
                    value.value
                ])),
                METHOD_PUT,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Add field",
                "Error!",
                "OK"
            );

            return;
        }

        flux_overlay_element.remove();

        this.#get_values = false;

        this.#getFields(
            true
        );
    }

    /**
     * @returns {Promise<void>}
     */
    async #addNewValue() {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = FluxOverlayElement.new(
            "Add value"
        );
        await flux_overlay_element.showLoading();
        flux_overlay_element.show();

        let inputs;
        try {
            inputs = await this.#request(
                "value/get-new-inputs"
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Add value",
                "Error!",
                "OK"
            );

            return;
        }

        await flux_overlay_element.showLoading(
            false
        );
        await flux_overlay_element.setInputs(
            inputs
        );
        flux_overlay_element.buttons = [
            {
                label: "Cancel",
                value: "cancel"
            },
            {
                label: "Next",
                value: "next"
            }
        ];

        const result = await flux_overlay_element.wait();

        if (result.button !== "next") {
            return;
        }

        this.#addValue(
            result.inputs.find(value => value.name === "name").value
        );
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async #addValue(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = FluxOverlayElement.new(
            "Add value"
        );
        await flux_overlay_element.showLoading();
        flux_overlay_element.show();

        let inputs;
        try {
            inputs = await this.#request(
                "value/get-inputs"
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Add value",
                "Error!",
                "OK"
            );

            return;
        }

        await flux_overlay_element.showLoading(
            false
        );
        await flux_overlay_element.setInputs(
            inputs
        );
        flux_overlay_element.buttons = [
            {
                label: "Cancel",
                value: "cancel"
            },
            {
                label: "Add",
                value: "add"
            }
        ];

        const result = await flux_overlay_element.wait(
            null,
            null,
            false
        );
        if (result.button !== "add") {
            flux_overlay_element.remove();
            return;
        }

        await flux_overlay_element.setInputs(
            true
        );
        flux_overlay_element.buttons = true;
        await flux_overlay_element.showLoading();

        try {
            await this.#request(
                `value/store/${name}`,
                {
                    values: result.inputs
                },
                METHOD_PUT,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Add value",
                "Error!",
                "OK"
            );

            return;
        }

        flux_overlay_element.remove();

        this.#getValues(
            true
        );
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #deleteField(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        if (!await FluxOverlayElement.confirm(
            "Delete field",
            "Are you sure you want to delete the field?",
            "No",
            "Yes"
        )) {
            return false;
        }

        const flux_overlay_element = await FluxOverlayElement.loading();

        try {
            await this.#request(
                `field/delete/${name}`,
                null,
                METHOD_DELETE,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Delete field",
                "Error!",
                "OK"
            );

            return false;
        }

        flux_overlay_element.remove();

        this.#get_values = false;

        return true;
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async #deleteValue(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        if (!await FluxOverlayElement.confirm(
            "Delete value",
            "Are you sure you want to delete the value?",
            "No",
            "Yes"
        )) {
            return;
        }

        const flux_overlay_element = await FluxOverlayElement.loading();

        try {
            await this.#request(
                `value/delete/${name}`,
                null,
                METHOD_DELETE,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Delete value",
                "Error!",
                "OK"
            );

            return;
        }

        flux_overlay_element.remove();

        this.#getValues(
            true
        );
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async #editField(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = FluxOverlayElement.new(
            "Edit field"
        );
        await flux_overlay_element.showLoading();
        flux_overlay_element.show();

        let inputs;
        try {
            inputs = await this.#request(
                `field/get-inputs/${name}`
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Edit field",
                "Error!",
                "OK"
            );

            return;
        }

        await flux_overlay_element.showLoading(
            false
        );
        await flux_overlay_element.setInputs(
            inputs
        );
        flux_overlay_element.buttons = [
            {
                label: "Cancel",
                value: "cancel"
            },
            {
                label: "Save",
                value: "save"
            }
        ];

        const result = await flux_overlay_element.wait(
            null,
            null,
            false
        );
        if (result.button !== "save") {
            flux_overlay_element.remove();
            return;
        }

        await flux_overlay_element.setInputs(
            true
        );
        flux_overlay_element.buttons = true;
        await flux_overlay_element.showLoading();

        try {
            await this.#request(
                `field/store/${name}`,
                Object.fromEntries(result.inputs.map(value => [
                    value.name,
                    value.value
                ])),
                METHOD_PUT,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Edit field",
                "Error!",
                "OK"
            );

            return;
        }

        flux_overlay_element.remove();

        this.#get_values = false;

        this.#getFields(
            true
        );
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async #editValue(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = FluxOverlayElement.new(
            "Edit value"
        );
        await flux_overlay_element.showLoading();
        flux_overlay_element.show();

        let inputs;
        try {
            inputs = await this.#request(
                `value/get-inputs/${name}`
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Edit value",
                "Error!",
                "OK"
            );

            return;
        }

        await flux_overlay_element.showLoading(
            false
        );
        await flux_overlay_element.setInputs(
            inputs
        );
        flux_overlay_element.buttons = [
            {
                label: "Cancel",
                value: "cancel"
            },
            {
                label: "Save",
                value: "save"
            }
        ];

        const result = await flux_overlay_element.wait(
            null,
            null,
            false
        );
        if (result.button !== "save") {
            flux_overlay_element.remove();
            return;
        }

        await flux_overlay_element.setInputs(
            true
        );
        flux_overlay_element.buttons = true;
        await flux_overlay_element.showLoading();

        try {
            await this.#request(
                `value/store/${name}`,
                {
                    values: result.inputs
                },
                METHOD_PUT,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Edit value",
                "Error!",
                "OK"
            );

            return;
        }

        flux_overlay_element.remove();

        this.#getValues(
            true
        );
    }

    /**
     * @param {boolean | null} force
     * @returns {Promise<void>}
     */
    async #getFields(force = null) {
        if (this.#get_fields && !(force ?? false)) {
            return;
        }

        this.#get_fields = true;

        this.#fields_element.innerHTML = "";

        this.#flux_button_group_element.disabled = true;

        const flux_loading_spinner_element = (await import("./Libs/flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs")).FluxLoadingSpinnerElement.new();
        this.#fields_element.appendChild(flux_loading_spinner_element);

        let table;
        try {
            table = await this.#request(
                "field/get-table"
            );
        } catch (error) {
            console.error(error);

            const error_element = document.createElement("div");
            error_element.innerText = "Error!";
            this.#fields_element.appendChild(error_element);

            return;
        } finally {
            this.#flux_button_group_element.disabled = false;

            flux_loading_spinner_element.remove();
        }

        const add_button = document.createElement("button");
        add_button.innerText = "Add";
        add_button.type = "button";
        add_button.addEventListener("click", () => {
            this.#addField();
        });
        this.#fields_element.appendChild(add_button);

        const refresh_button = document.createElement("button");
        refresh_button.innerText = "Refresh";
        refresh_button.type = "button";
        refresh_button.addEventListener("click", () => {
            this.#getFields(
                true
            );
        });
        this.#fields_element.appendChild(refresh_button);

        const table_element = document.createElement("table");

        const thead_element = document.createElement("thead");
        const thead_tr_element = document.createElement("tr");

        for (const column of table.columns) {
            const th_element = document.createElement("th");
            th_element.innerText = column.label;
            thead_tr_element.appendChild(th_element);
        }

        const actions_th_element = document.createElement("th");
        actions_th_element.innerText = "Actions";
        thead_tr_element.appendChild(actions_th_element);

        thead_element.appendChild(thead_tr_element);
        table_element.appendChild(thead_element);

        const tbody_element = document.createElement("tbody");
        /**
         * @returns {void}
         */
        function updateButtons() {
            for (const tr_element of tbody_element.children) {
                tr_element.querySelector("[data-move_up_button]").disabled = tr_element.previousElementSibling === null;

                tr_element.querySelector("[data-move_down_button]").disabled = tr_element.nextElementSibling === null;
            }
        }
        for (const row of table.rows) {
            const tr_element = document.createElement("tr");

            for (const column of table.columns) {
                const td_element = document.createElement("td");
                td_element.innerText = row[column.key] ?? "-";
                tr_element.appendChild(td_element);
            }

            const actions_td_element = document.createElement("td");

            const edit_button = document.createElement("button");
            edit_button.innerText = "Edit";
            edit_button.type = "button";
            edit_button.addEventListener("click", () => {
                this.#editField(
                    row.name
                );
            });
            actions_td_element.appendChild(edit_button);

            const move_up_button = document.createElement("button");
            move_up_button.dataset.move_up_button = true;
            move_up_button.innerText = "/\\";
            move_up_button.type = "button";
            move_up_button.addEventListener("click", async () => {
                if (!await this.#moveUpField(
                    row.name
                )) {
                    return;
                }

                tr_element.previousElementSibling?.before(tr_element);

                updateButtons();
            });
            actions_td_element.appendChild(move_up_button);

            const move_down_button = document.createElement("button");
            move_down_button.dataset.move_down_button = true;
            move_down_button.innerText = "\\/";
            move_down_button.type = "button";
            move_down_button.addEventListener("click", async () => {
                if (!await this.#moveDownField(
                    row.name
                )) {
                    return;
                }

                tr_element.nextElementSibling?.after(tr_element);

                updateButtons();
            });
            actions_td_element.appendChild(move_down_button);

            const delete_button = document.createElement("button");
            delete_button.innerText = "Delete";
            delete_button.type = "button";
            delete_button.addEventListener("click", async () => {
                if (!await this.#deleteField(
                    row.name
                )) {
                    return;
                }

                tr_element.remove();

                updateButtons();
            });
            actions_td_element.appendChild(delete_button);

            tr_element.appendChild(actions_td_element);

            tbody_element.appendChild(tr_element);
        }
        table_element.appendChild(tbody_element);
        updateButtons();

        this.#fields_element.appendChild(table_element);
    }

    /**
     * @returns {Promise<FluxColorScheme>}
     */
    async #getFluxColorScheme() {
        this.#flux_color_scheme ??= (await import("./Libs/flux-color-scheme/src/FluxColorScheme.mjs")).FluxColorScheme.new(
            [
                {
                    color_scheme: COLOR_SCHEME_LIGHT,
                    name: "light"
                }
            ]
        );

        return this.#flux_color_scheme;
    }

    /**
     * @returns {Promise<FluxHttpApi>}
     */
    async #getFluxHttpApi() {
        this.#flux_http_api ??= (await import("./Libs/flux-http-api/src/FluxHttpApi.mjs")).FluxHttpApi.new();

        return this.#flux_http_api;
    }

    /**
     * @returns {Promise<FluxPwaApi>}
     */
    async #getFluxPwaApi() {
        this.#flux_pwa_api ??= (await import("./Libs/flux-pwa-api/src/FluxPwaApi.mjs")).FluxPwaApi.new(
            await this.#getFluxHttpApi()
        );

        return this.#flux_pwa_api;
    }

    /**
     * @param {boolean | null} force
     * @returns {Promise<void>}
     */
    async #getValues(force = null) {
        if (this.#get_values && !(force ?? false)) {
            return;
        }

        this.#get_values = true;

        this.#values_element.innerHTML = "";

        this.#flux_button_group_element.disabled = true;

        const flux_loading_spinner_element = (await import("./Libs/flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs")).FluxLoadingSpinnerElement.new();
        this.#values_element.appendChild(flux_loading_spinner_element);

        let table;
        try {
            table = await this.#request(
                "value/get-table"
            );
        } catch (error) {
            console.error(error);

            const error_element = document.createElement("div");
            error_element.innerText = "Error!";
            this.#values_element.appendChild(error_element);

            return;
        } finally {
            this.#flux_button_group_element.disabled = false;

            flux_loading_spinner_element.remove();
        }

        if (table["show-add-new"]) {
            const add_button = document.createElement("button");
            add_button.innerText = "Add";
            add_button.type = "button";
            add_button.addEventListener("click", () => {
                this.#addNewValue();
            });
            this.#values_element.appendChild(add_button);
        }

        const refresh_button = document.createElement("button");
        refresh_button.innerText = "Refresh";
        refresh_button.type = "button";
        refresh_button.addEventListener("click", () => {
            this.#getValues(
                true
            );
        });
        this.#values_element.appendChild(refresh_button);

        const table_element = document.createElement("table");

        const thead_element = document.createElement("thead");
        const thead_tr_element = document.createElement("tr");
        for (const column of table.columns) {
            const th_element = document.createElement("th");
            th_element.innerText = column.label;
            thead_tr_element.appendChild(th_element);
        }
        const actions_th_element = document.createElement("th");
        actions_th_element.innerText = "Actions";
        thead_tr_element.appendChild(actions_th_element);
        thead_element.appendChild(thead_tr_element);
        table_element.appendChild(thead_element);

        const tbody_element = document.createElement("tbody");
        for (const row of table.rows) {
            const tr_element = document.createElement("tr");

            for (const column of table.columns) {
                const td_element = document.createElement("td");
                td_element.innerText = row[column.key] ?? "-";
                tr_element.appendChild(td_element);
            }

            const actions_td_element = document.createElement("td");

            if (row["has-value"]) {
                const add_button = document.createElement("button");
                add_button.innerText = "Edit";
                add_button.type = "button";
                add_button.addEventListener("click", () => {
                    this.#editValue(
                        row.name
                    );
                });
                actions_td_element.appendChild(add_button);

                const delete_button = document.createElement("button");
                delete_button.innerText = "Delete";
                delete_button.type = "button";
                delete_button.addEventListener("click", () => {
                    this.#deleteValue(
                        row.name
                    );
                });
                actions_td_element.appendChild(delete_button);
            } else {
                const edit_button = document.createElement("button");
                edit_button.innerText = "Add";
                edit_button.type = "button";
                edit_button.addEventListener("click", () => {
                    this.#addValue(
                        row.name
                    );
                });
                actions_td_element.appendChild(edit_button);
            }

            tr_element.appendChild(actions_td_element);

            tbody_element.appendChild(tr_element);
        }
        table_element.appendChild(tbody_element);

        this.#values_element.appendChild(table_element);
    }

    /**
     * @returns {Promise<void>}
     */
    async #init() {
        await (await this.#getFluxPwaApi()).initPwa(
            `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/Pwa/manifest.json`
        );

        await this.#getFluxColorScheme();
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #moveDownField(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.loading();

        try {
            await this.#request(
                `field/move-down/${name}`,
                null,
                METHOD_POST,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Move field down",
                "Error!",
                "OK"
            );

            return false;
        }

        flux_overlay_element.remove();

        this.#get_values = false;

        return true;
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #moveUpField(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.loading();

        try {
            await this.#request(
                `field/move-up/${name}`,
                null,
                METHOD_POST,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Move field up",
                "Error!",
                "OK"
            );

            return false;
        }

        flux_overlay_element.remove();

        this.#get_values = false;

        return true;
    }

    /**
     * @param {string} route
     * @param {*} body
     * @param {string | null} method
     * @param {boolean | null} response_body
     * @returns {Promise<*>}
     */
    async #request(route, body = null, method = null, response_body = null) {
        const _response_body = response_body ?? true;

        const response = await this.#flux_http_api.request(
            HttpClientRequest[body !== null ? "json" : "new"](
                new URL(`${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/../api/${route}`, location.origin),
                body,
                method,
                null,
                true,
                _response_body
            )
        );

        if (!_response_body) {
            return null;
        }

        return response.body.json();
    }
}
