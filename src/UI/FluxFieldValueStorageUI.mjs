import { COLOR_SCHEME_LIGHT } from "./Libs/flux-color-scheme/src/ColorScheme/COLOR_SCHEME.mjs";
import { flux_css_api } from "./Libs/flux-css-api/src/FluxCssApi.mjs";
import { HttpClientRequest } from "./Libs/flux-http-api/src/Client/HttpClientRequest.mjs";
import { INPUT_TYPE_ENTRIES } from "./Libs/flux-form/src/INPUT_TYPE.mjs";
import { METHOD_DELETE, METHOD_POST, METHOD_PUT } from "./Libs/flux-http-api/src/Method/METHOD.mjs";

/** @typedef {import("../Field/FieldTable.mjs").FieldTable} FieldTable */
/** @typedef {import("./Libs/flux-button-group/src/FluxButtonGroupElement.mjs").FluxButtonGroupElement} FluxButtonGroupElement */
/** @typedef {import("./Libs/flux-color-scheme/src/FluxColorScheme.mjs").FluxColorScheme} FluxColorScheme */
/** @typedef {import("./Libs/flux-form/src/FluxFormElement.mjs").FluxFormElement} FluxFormElement */
/** @typedef {import("./Libs/flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./Libs/flux-pwa-api/src/FluxPwaApi.mjs").FluxPwaApi} FluxPwaApi */
/** @typedef {import("./Libs/flux-form/src/InputValue.mjs").InputValue} InputValue */
/** @typedef {import("../Value/ValueTable.mjs").ValueTable} ValueTable */

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
    #field_element = null;
    /**
     * @type {FieldTable | null}
     */
    #field_table = null;
    /**
     * @type {ValueTable | null}
     */
    #value_table = null;
    /**
     * @type {InputValue[] | null}
     */
    #value_table_filter = null;
    /**
     * @type {FluxFormElement | null}
     */
    #value_table_filter_form_element = null;
    /**
     * @type {HTMLDivElement | null}
     */
    #value_element = null;

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

    }

    /**
     * @returns {Promise<void>}
     */
    async showUI() {
        await this.#init();

        const {
            FLUX_BUTTON_GROUP_EVENT_INPUT
        } = await import("./Libs/flux-button-group/src/FLUX_BUTTON_GROUP_EVENT.mjs");
        const {
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
        this.#flux_button_group_element.addEventListener(FLUX_BUTTON_GROUP_EVENT_INPUT, async e => {
            this.#field_element.style.display = "none";
            this.#field_element.innerHTML = "";

            this.#value_element.style.display = "none";
            this.#value_element.innerHTML = "";

            switch (e.detail.value) {
                case "fields":
                    this.#field_element.style.display = "";

                    this.#getFieldTable();
                    break;

                case "values":
                    this.#value_element.style.display = "";

                    this.#getValueTable();
                    break;

                default:
                    break;
            }
        });
        document.body.appendChild(this.#flux_button_group_element);

        this.#field_element = document.createElement("div");
        this.#field_element.style.display = "none";
        document.body.appendChild(this.#field_element);

        this.#value_element = document.createElement("div");
        document.body.appendChild(this.#value_element);

        this.#getValueTable();
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
                "Couldn't load field!",
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
        const addField = async () => {
            const type_result = await flux_overlay_element.wait(
                null,
                null,
                false
            );
            if (type_result.button !== "next") {
                flux_overlay_element.remove();
                return;
            }

            flux_overlay_element.message = "";
            await flux_overlay_element.setInputs(
                true
            );
            flux_overlay_element.buttons = true;
            await flux_overlay_element.showLoading();

            let inputs;
            try {
                inputs = (await this.#request(
                    `field/get-type-inputs/${type_result.inputs.find(value => value.name === "type").value}`
                )).map(input => (input.type === INPUT_TYPE_ENTRIES && (input.value ?? null) !== null ? {
                    ...input,
                    value: input.value.map(value => Object.entries(value).map(([
                        name,
                        _value
                    ]) => ({
                        name,
                        value: _value
                    })))
                } : input));
            } catch (error) {
                console.error(error);

                await flux_overlay_element.showLoading(
                    false
                );
                flux_overlay_element.message = "Couldn't load field!";
                await flux_overlay_element.setInputs(
                    false
                );
                flux_overlay_element.buttons = false;
                addField();

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
            const addField2 = async () => {
                const result = await flux_overlay_element.wait(
                    null,
                    null,
                    false
                );
                if (result.button !== "add") {
                    flux_overlay_element.remove();
                    return;
                }

                flux_overlay_element.message = "";
                await flux_overlay_element.setInputs(
                    true
                );
                flux_overlay_element.buttons = true;
                await flux_overlay_element.showLoading();

                try {
                    await this.#request(
                        `field/store/${result.inputs.find(value => value.name === "name").value}`,
                        null,
                        Object.fromEntries(result.inputs.map(value => [
                            value.name,
                            inputs.find(input => input.name === value.name)?.type === INPUT_TYPE_ENTRIES ? value.value.map(_value => Object.fromEntries(_value.map(__value => [
                                __value.name,
                                __value.value
                            ]))) : value.value
                        ])),
                        METHOD_PUT,
                        false
                    );
                } catch (error) {
                    console.error(error);

                    await flux_overlay_element.showLoading(
                        false
                    );
                    flux_overlay_element.message = "Couldn't add field!";
                    await flux_overlay_element.setInputs(
                        false
                    );
                    flux_overlay_element.buttons = false;
                    addField2();

                    return;
                }

                flux_overlay_element.remove();

                this.#field_table = null;
                this.#value_table_filter_form_element = null;
                this.#value_table = null;

                this.#getFieldTable();
            };
            addField2();
        };
        addField();
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
                "Couldn't load value!",
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
                "Couldn't load value!",
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
        const addValue = async () => {
            const result = await flux_overlay_element.wait(
                null,
                null,
                false
            );
            if (result.button !== "add") {
                flux_overlay_element.remove();
                return;
            }

            flux_overlay_element.message = "";
            await flux_overlay_element.setInputs(
                true
            );
            flux_overlay_element.buttons = true;
            await flux_overlay_element.showLoading();

            try {
                await this.#request(
                    `value/store/${name}`,
                    null,
                    {
                        values: result.inputs
                    },
                    METHOD_PUT,
                    false
                );
            } catch (error) {
                console.error(error);

                await flux_overlay_element.showLoading(
                    false
                );
                flux_overlay_element.message = "Couldn't add value!";
                await flux_overlay_element.setInputs(
                    false
                );
                flux_overlay_element.buttons = false;
                addValue();

                return;
            }

            flux_overlay_element.remove();

            this.#value_table = null;

            this.#getValueTable();
        };
        addValue();
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
                null,
                METHOD_DELETE,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Delete field",
                "Couldn't delete field!",
                "OK"
            );

            return false;
        }

        flux_overlay_element.remove();

        this.#value_table_filter_form_element = null;
        this.#value_table = null;

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
                null,
                METHOD_DELETE,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Delete value",
                "Couldn't delete value!",
                "OK"
            );

            return;
        }

        flux_overlay_element.remove();

        this.#value_table = null;

        this.#getValueTable();
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
            inputs = (await this.#request(
                `field/get-inputs/${name}`
            )).map(input => (input.type === INPUT_TYPE_ENTRIES && (input.value ?? null) !== null ? {
                ...input,
                value: input.value.map(value => Object.entries(value).map(([
                    _name,
                    _value
                ]) => ({
                    name: _name,
                    value: _value
                })))
            } : input));
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Edit field",
                "Couldn't load field!",
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
        const editField = async () => {
            const result = await flux_overlay_element.wait(
                null,
                null,
                false
            );
            if (result.button !== "save") {
                flux_overlay_element.remove();
                return;
            }

            flux_overlay_element.message = "";
            await flux_overlay_element.setInputs(
                true
            );
            flux_overlay_element.buttons = true;
            await flux_overlay_element.showLoading();

            try {
                await this.#request(
                    `field/store/${name}`,
                    null,
                    Object.fromEntries(result.inputs.map(value => [
                        value.name,
                        inputs.find(input => input.name === value.name)?.type === INPUT_TYPE_ENTRIES ? value.value.map(_value => Object.fromEntries(_value.map(__value => [
                            __value.name,
                            __value.value
                        ]))) : value.value
                    ])),
                    METHOD_PUT,
                    false
                );
            } catch (error) {
                console.error(error);

                await flux_overlay_element.showLoading(
                    false
                );
                flux_overlay_element.message = "Couldn't save field!";
                await flux_overlay_element.setInputs(
                    false
                );
                flux_overlay_element.buttons = false;
                editField();

                return;
            }

            flux_overlay_element.remove();

            this.#field_table = null;
            this.#value_table_filter_form_element = null;
            this.#value_table = null;

            this.#getFieldTable();
        };
        editField();
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
                "Couldn't load value!",
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
        const editValue = async () => {
            const result = await flux_overlay_element.wait(
                null,
                null,
                false
            );
            if (result.button !== "save") {
                flux_overlay_element.remove();
                return;
            }

            flux_overlay_element.message = "";
            await flux_overlay_element.setInputs(
                true
            );
            flux_overlay_element.buttons = true;
            await flux_overlay_element.showLoading();

            try {
                await this.#request(
                    `value/store/${name}`,
                    null,
                    {
                        values: result.inputs
                    },
                    METHOD_PUT,
                    false
                );
            } catch (error) {
                console.error(error);

                await flux_overlay_element.showLoading(
                    false
                );
                flux_overlay_element.message = "Couldn't save value!";
                await flux_overlay_element.setInputs(
                    false
                );
                flux_overlay_element.buttons = false;
                editValue();

                return;
            }

            flux_overlay_element.remove();

            this.#value_table = null;

            this.#getValueTable();
        };
        editValue();
    }

    /**
     * @returns {Promise<void>}
     */
    async #getFieldTable() {
        this.#field_element.innerHTML = "";

        this.#flux_button_group_element.disabled = true;

        const flux_loading_spinner_element = (await import("./Libs/flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs")).FluxLoadingSpinnerElement.new();
        this.#field_element.appendChild(flux_loading_spinner_element);

        try {
            if (this.#field_table === null) {
                this.#field_table = await this.#request(
                    "field/get-table"
                );
            }
        } catch (error) {
            console.error(error);

            const error_element = document.createElement("div");
            error_element.innerText = "Couldn't load fields!";
            this.#field_element.appendChild(error_element);

            return;
        } finally {
            this.#flux_button_group_element.disabled = false;

            flux_loading_spinner_element.remove();
        }

        const add_button_element = document.createElement("button");
        add_button_element.innerText = "Add";
        add_button_element.type = "button";
        add_button_element.addEventListener("click", () => {
            this.#addField();
        });
        this.#field_element.appendChild(add_button_element);

        const refresh_button_element = document.createElement("button");
        refresh_button_element.innerText = "Refresh";
        refresh_button_element.type = "button";
        refresh_button_element.addEventListener("click", () => {
            this.#field_table = null;
            this.#value_table_filter_form_element = null;
            this.#value_table = null;

            this.#getFieldTable();
        });
        this.#field_element.appendChild(refresh_button_element);

        const table_element = document.createElement("table");

        const thead_element = document.createElement("thead");
        const thead_tr_element = document.createElement("tr");

        for (const column of this.#field_table.columns) {
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

        if (this.#field_table.rows.length > 0) {
            const updateButtons = () => {
                for (const tr_element of tbody_element.children) {
                    tr_element.querySelector("[data-move_up_button]").disabled = tr_element.previousElementSibling === null;

                    tr_element.querySelector("[data-move_down_button]").disabled = tr_element.nextElementSibling === null;
                }
            };

            for (const row of this.#field_table.rows) {
                const tr_element = document.createElement("tr");

                for (const column of this.#field_table.columns) {
                    const td_element = document.createElement("td");
                    td_element.innerText = row[column.key] ?? "-";
                    tr_element.appendChild(td_element);
                }

                const actions_td_element = document.createElement("td");

                const edit_button_element = document.createElement("button");
                edit_button_element.innerText = "Edit";
                edit_button_element.type = "button";
                edit_button_element.addEventListener("click", () => {
                    this.#editField(
                        row.name
                    );
                });
                actions_td_element.appendChild(edit_button_element);

                const move_up_button_element = document.createElement("button");
                move_up_button_element.dataset.move_up_button = true;
                move_up_button_element.innerText = "/\\";
                move_up_button_element.type = "button";
                move_up_button_element.addEventListener("click", async () => {
                    if (!await this.#moveUpField(
                        row.name
                    )) {
                        return;
                    }

                    tr_element.previousElementSibling?.before(tr_element);

                    updateButtons();
                });
                actions_td_element.appendChild(move_up_button_element);

                const move_down_button_element = document.createElement("button");
                move_down_button_element.dataset.move_down_button = true;
                move_down_button_element.innerText = "\\/";
                move_down_button_element.type = "button";
                move_down_button_element.addEventListener("click", async () => {
                    if (!await this.#moveDownField(
                        row.name
                    )) {
                        return;
                    }

                    tr_element.nextElementSibling?.after(tr_element);

                    updateButtons();
                });
                actions_td_element.appendChild(move_down_button_element);

                const delete_button_element = document.createElement("button");
                delete_button_element.innerText = "Delete";
                delete_button_element.type = "button";
                delete_button_element.addEventListener("click", async () => {
                    if (!await this.#deleteField(
                        row.name
                    )) {
                        return;
                    }

                    tr_element.remove();

                    updateButtons();
                });
                actions_td_element.appendChild(delete_button_element);

                tr_element.appendChild(actions_td_element);

                tbody_element.appendChild(tr_element);
            }

            updateButtons();
        } else {
            const tr_element = document.createElement("tr");

            const td_element = document.createElement("td");
            td_element.colSpan = this.#field_table.columns.length + 1;
            td_element.innerText = "No fields";
            tr_element.appendChild(td_element);

            tbody_element.appendChild(tr_element);
        }

        table_element.appendChild(tbody_element);

        this.#field_element.appendChild(table_element);
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
     * @returns {Promise<void>}
     */
    async #getValueTable() {
        this.#value_element.innerHTML = "";

        this.#flux_button_group_element.disabled = true;

        const flux_loading_spinner_element = (await import("./Libs/flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs")).FluxLoadingSpinnerElement.new();
        this.#value_element.appendChild(flux_loading_spinner_element);

        let error_element = null;
        try {
            if (this.#value_table_filter_form_element === null) {
                const table_filter_form_element = (await import("./Libs/flux-form/src/FluxFormElement.mjs")).FluxFormElement.new(
                    await this.#request(
                        "value/get-table-filter-inputs"
                    )
                );
                if (this.#value_table_filter !== null) {
                    table_filter_form_element.values = this.#value_table_filter;
                }

                this.#value_table_filter_form_element = table_filter_form_element;
            }

            if (this.#value_table_filter !== null) {
                if (this.#value_table === null) {
                    this.#value_table = await this.#request(
                        "value/get-table",
                        Object.fromEntries(this.#value_table_filter.filter(value => value.value !== null && value.value !== "" && (Array.isArray(value.value) ? value.value.length > 0 : true)).map(value => [
                            value.name,
                            value.value
                        ]))
                    );
                }
            } else {
                this.#value_table = null;
            }
        } catch (error) {
            console.error(error);

            error_element = document.createElement("div");
            error_element.innerText = "Couldn't load values!";
        }

        this.#flux_button_group_element.disabled = false;

        flux_loading_spinner_element.remove();

        if (this.#value_table_filter_form_element === null) {
            if (error_element !== null) {
                this.#value_element.appendChild(error_element);
            }
            return;
        }

        this.#value_element.appendChild(this.#value_table_filter_form_element);

        const search_button_element = document.createElement("button");
        search_button_element.innerText = "Search";
        search_button_element.type = "button";
        search_button_element.addEventListener("click", () => {
            if (!this.#value_table_filter_form_element.validate()) {
                return;
            }

            this.#value_table_filter = this.#value_table_filter_form_element.values;
            this.#value_table = null;

            this.#getValueTable();
        });
        this.#value_element.appendChild(search_button_element);

        if (this.#value_table === null) {
            if (error_element !== null) {
                this.#value_element.appendChild(error_element);
            }
            return;
        }

        if (this.#value_table["show-add-new"]) {
            const add_button_element = document.createElement("button");
            add_button_element.innerText = "Add";
            add_button_element.type = "button";
            add_button_element.addEventListener("click", () => {
                this.#addNewValue();
            });
            this.#value_element.appendChild(add_button_element);
        }

        const table_element = document.createElement("table");

        const thead_element = document.createElement("thead");
        const thead_tr_element = document.createElement("tr");
        for (const column of this.#value_table.columns) {
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

        if (this.#value_table.rows.length > 0) {
            for (const row of this.#value_table.rows) {
                const tr_element = document.createElement("tr");

                for (const column of this.#value_table.columns) {
                    const td_element = document.createElement("td");
                    td_element.innerText = row[column.key] ?? "-";
                    tr_element.appendChild(td_element);
                }

                const actions_td_element = document.createElement("td");

                if (row["has-value"]) {
                    const add_button_element = document.createElement("button");
                    add_button_element.innerText = "Edit";
                    add_button_element.type = "button";
                    add_button_element.addEventListener("click", () => {
                        this.#editValue(
                            row.name
                        );
                    });
                    actions_td_element.appendChild(add_button_element);

                    const delete_button_element = document.createElement("button");
                    delete_button_element.innerText = "Delete";
                    delete_button_element.type = "button";
                    delete_button_element.addEventListener("click", () => {
                        this.#deleteValue(
                            row.name
                        );
                    });
                    actions_td_element.appendChild(delete_button_element);
                } else {
                    const edit_button_element = document.createElement("button");
                    edit_button_element.innerText = "Add";
                    edit_button_element.type = "button";
                    edit_button_element.addEventListener("click", () => {
                        this.#addValue(
                            row.name
                        );
                    });
                    actions_td_element.appendChild(edit_button_element);
                }

                tr_element.appendChild(actions_td_element);

                tbody_element.appendChild(tr_element);
            }
        } else {
            const tr_element = document.createElement("tr");

            const td_element = document.createElement("td");
            td_element.colSpan = this.#value_table.columns.length + 1;
            td_element.innerText = "No values";
            tr_element.appendChild(td_element);

            tbody_element.appendChild(tr_element);
        }

        table_element.appendChild(tbody_element);

        this.#value_element.appendChild(table_element);
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
                null,
                METHOD_POST,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Move field down",
                "Couldn't move field!",
                "OK"
            );

            return false;
        }

        flux_overlay_element.remove();

        this.#value_table_filter_form_element = null;
        this.#value_table = null;

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
                null,
                METHOD_POST,
                false
            );
        } catch (error) {
            console.error(error);

            flux_overlay_element.remove();

            await FluxOverlayElement.alert(
                "Move field up",
                "Couldn't move field!",
                "OK"
            );

            return false;
        }

        flux_overlay_element.remove();

        this.#value_table_filter_form_element = null;
        this.#value_table = null;

        return true;
    }

    /**
     * @param {string} route
     * @param {{[key: string]: *} | null} query_params
     * @param {*} body
     * @param {string | null} method
     * @param {boolean | null} response_body
     * @returns {Promise<*>}
     */
    async #request(route, query_params = null, body = null, method = null, response_body = null) {
        const url = new URL(`${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/../api/${route}`, location.origin);

        if (query_params !== null) {
            for (const [
                key,
                value
            ] of Object.entries(query_params)) {
                url.searchParams.append(key, value);
            }
        }

        const _response_body = response_body ?? true;

        const response = await this.#flux_http_api.request(
            HttpClientRequest[body !== null ? "json" : "new"](
                url,
                body,
                method,
                null,
                true,
                _response_body
            )
        );

        if (!_response_body) {
            return;
        }

        return response.body.json();
    }
}
