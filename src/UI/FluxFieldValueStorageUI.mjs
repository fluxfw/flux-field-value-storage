import { FIELD_PREFIX } from "./Field/FIELD_PREFIX.mjs";
import { flux_import_css } from "./Libs/flux-style-sheet-manager/src/FluxImportCss.mjs";
import { HttpClientRequest } from "./Libs/flux-http-api/src/Client/HttpClientRequest.mjs";
import { valueToTimestamp } from "./Libs/flux-value-format/src/DEFAULT_FORMAT_VALUE_TYPES.mjs";
import { INPUT_TYPE_DATE, INPUT_TYPE_DATETIME_LOCAL, INPUT_TYPE_ENTRIES, INPUT_TYPE_TIME } from "./Libs/flux-form/src/INPUT_TYPE.mjs";
import { METHOD_DELETE, METHOD_POST, METHOD_PUT } from "./Libs/flux-http-api/src/Method/METHOD.mjs";

/** @typedef {import("../Field/FieldTable.mjs").FieldTable} FieldTable */
/** @typedef {import("./Libs/flux-button-group/src/FluxButtonGroupElement.mjs").FluxButtonGroupElement} FluxButtonGroupElement */
/** @typedef {import("./Libs/flux-color-scheme/src/FluxColorScheme.mjs").FluxColorScheme} FluxColorScheme */
/** @typedef {import("./Libs/flux-form/src/FluxFormElement.mjs").FluxFormElement} FluxFormElement */
/** @typedef {import("./Libs/flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./Libs/flux-pwa-api/src/FluxPwaApi.mjs").FluxPwaApi} FluxPwaApi */
/** @typedef {import("./Libs/flux-style-sheet-manager/src/FluxStyleSheetManager.mjs").FluxStyleSheetManager} FluxStyleSheetManager */
/** @typedef {import("./Libs/flux-value-format/src/FluxValueFormat.mjs").FluxValueFormat} FluxValueFormat */
/** @typedef {import("./Libs/flux-form/src/Input.mjs").Input} Input */
/** @typedef {import("./Libs/flux-form/src/InputValue.mjs").InputValue} InputValue */
/** @typedef {import("../Value/ValueTable.mjs").ValueTable} ValueTable */

const layout_css = await flux_import_css.import(
    `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/Layout/style.css`
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
     * @type {FluxStyleSheetManager | null}
     */
    #flux_style_sheet_manager = null;
    /**
     * @type {FluxValueFormat | null}
     */
    #flux_value_format = null;
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
     * @type {Input[] | null}
     */
    #value_table_filter_inputs = null;
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

        const container_element = document.createElement("div");

        const {
            FLUX_BUTTON_GROUP_ELEMENT_EVENT_INPUT,
            FluxButtonGroupElement
        } = await import("./Libs/flux-button-group/src/FluxButtonGroupElement.mjs");
        this.#flux_button_group_element = await FluxButtonGroupElement.new(
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
            ],
            await this.#getFluxStyleSheetManager()
        );
        this.#flux_button_group_element.addEventListener(FLUX_BUTTON_GROUP_ELEMENT_EVENT_INPUT, async e => {
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
        container_element.append(this.#flux_button_group_element);

        this.#field_element = document.createElement("div");
        this.#field_element.style.display = "none";
        container_element.append(this.#field_element);

        this.#value_element = document.createElement("div");
        container_element.append(this.#value_element);

        document.body.append(container_element);

        this.#getValueTable();
    }

    /**
     * @returns {Promise<boolean>}
     */
    async #addField() {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.new(
            "Add field",
            null,
            null,
            await this.#getFluxStyleSheetManager()
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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
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
                return false;
            }

            flux_overlay_element.message = "";
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

                await flux_overlay_element.showLoading(
                    false
                );
                flux_overlay_element.message = "Couldn't load field!";
                await flux_overlay_element.setInputs(
                    false
                );
                flux_overlay_element.buttons = false;

                return addField();
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
                    return false;
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
                        Object.fromEntries(result.inputs.filter(input => input.name !== "type-label").map(value => [
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

                    return addField2();
                }

                flux_overlay_element.remove();

                return true;
            };

            return addField2();
        };

        return addField();
    }

    /**
     * @returns {Promise<boolean>}
     */
    async #addNewValue() {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.new(
            "Add value",
            null,
            null,
            await this.#getFluxStyleSheetManager()
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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
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
            return false;
        }

        await this.#addValue(
            result.inputs.find(value => value.name === "name").value
        );

        return true;
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #addValue(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.new(
            "Add value",
            null,
            null,
            await this.#getFluxStyleSheetManager()
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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
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
                return false;
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

                return addValue();
            }

            flux_overlay_element.remove();

            return true;
        };

        return addValue();
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
            "Yes",
            await this.#getFluxStyleSheetManager()
        )) {
            return false;
        }

        const flux_overlay_element = await FluxOverlayElement.loading(
            await this.#getFluxStyleSheetManager()
        );

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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
        }

        flux_overlay_element.remove();

        return true;
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #deleteValue(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        if (!await FluxOverlayElement.confirm(
            "Delete value",
            "Are you sure you want to delete the value?",
            "No",
            "Yes",
            await this.#getFluxStyleSheetManager()
        )) {
            return false;
        }

        const flux_overlay_element = await FluxOverlayElement.loading(
            await this.#getFluxStyleSheetManager()
        );

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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
        }

        flux_overlay_element.remove();

        return true;
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #editField(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.new(
            "Edit field",
            null,
            null,
            await this.#getFluxStyleSheetManager()
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
                "Couldn't load field!",
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
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
                return false;
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

                return editField();
            }

            flux_overlay_element.remove();

            return true;
        };

        return editField();
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #editValue(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.new(
            "Edit value",
            null,
            null,
            await this.#getFluxStyleSheetManager()
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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
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
                return false;
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

                return editValue();
            }

            flux_overlay_element.remove();

            return true;
        };

        return editValue();
    }

    /**
     * @returns {Promise<void>}
     */
    async #getFieldTable() {
        this.#field_element.innerHTML = "";

        if (this.#field_table === null) {
            this.#flux_button_group_element.disabled = true;

            const flux_loading_spinner_element = await (await import("./Libs/flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs")).FluxLoadingSpinnerElement.new(
                await this.#getFluxStyleSheetManager()
            );
            this.#field_element.append(flux_loading_spinner_element);

            try {
                this.#field_table = await this.#request(
                    "field/get-table"
                );
            } catch (error) {
                console.error(error);

                const error_element = document.createElement("div");
                error_element.innerText = "Couldn't load fields!";
                this.#field_element.append(error_element);

                return;
            } finally {
                this.#flux_button_group_element.disabled = false;

                flux_loading_spinner_element.remove();
            }
        }

        const {
            FLUX_BUTTON_ONLY_BUTTON_GROUP_ELEMENT_EVENT_CLICK,
            FluxButtonOnlyButtonGroupElement
        } = await import("./Libs/flux-button-group/src/FluxButtonOnlyButtonGroupElement.mjs");
        const actions_flux_button_only_button_group_element = await FluxButtonOnlyButtonGroupElement.new(
            [
                {
                    label: "Add",
                    value: "add"
                },
                {
                    label: "Refresh",
                    value: "refresh"
                }
            ],
            await this.#getFluxStyleSheetManager()
        );
        actions_flux_button_only_button_group_element.addEventListener(FLUX_BUTTON_ONLY_BUTTON_GROUP_ELEMENT_EVENT_CLICK, async e => {
            switch (e.detail.value) {
                case "add":
                    if (!await this.#addField()) {
                        return;
                    }

                    this.#field_table = null;
                    this.#value_table_filter_form_element = null;
                    this.#value_table = null;
                    this.#getFieldTable();
                    break;

                case "refresh":
                    this.#field_table = null;
                    this.#value_table_filter_form_element = null;
                    this.#value_table = null;
                    this.#getFieldTable();
                    break;

                default:
                    break;
            }
        });
        this.#field_element.append(actions_flux_button_only_button_group_element);

        const flux_value_format = await this.#getFluxValueFormat();

        const flux_table_element = await (await import("./Libs/flux-table/src/FluxTableElement.mjs")).FluxTableElement.newWithData(
            [
                ...this.#field_table.columns,
                {
                    key: "actions",
                    label: "Actions",
                    "update-rows": true,
                    type: "actions",
                    width: "1px"
                }
            ],
            "name",
            this.#field_table.rows,
            async (value = null, type = null, name = null) => {
                const row = this.#field_table.rows.find(_row => _row.name === name) ?? null;

                if (type === "actions") {
                    const row_actions_flux_button_only_button_group_element = await FluxButtonOnlyButtonGroupElement.new(
                        [
                            {
                                label: "Edit",
                                value: "edit"
                            },
                            {
                                label: "/\\",
                                title: "Move up",
                                value: "move-up"
                            },
                            {
                                label: "\\/",
                                title: "Move down",
                                value: "move-down"
                            },
                            {
                                label: "Delete",
                                value: "delete"
                            }
                        ],
                        await this.#getFluxStyleSheetManager()
                    );
                    row_actions_flux_button_only_button_group_element.addEventListener(FLUX_BUTTON_ONLY_BUTTON_GROUP_ELEMENT_EVENT_CLICK, async e => {
                        switch (e.detail.value) {
                            case "delete": {
                                if (!await this.#deleteField(
                                    row.name
                                )) {
                                    return;
                                }

                                const index = this.#field_table.rows.indexOf(row);
                                if (index !== -1) {
                                    this.#field_table.rows.splice(index, 1);
                                }

                                await flux_table_element.deleteRow(
                                    row.name
                                );

                                this.#value_table_filter_form_element = null;
                                this.#value_table = null;
                            }
                                break;

                            case "edit":
                                if (! await this.#editField(
                                    row.name
                                )) {
                                    return;
                                }

                                this.#field_table = null;
                                this.#value_table_filter_form_element = null;
                                this.#value_table = null;
                                this.#getFieldTable();
                                break;

                            case "move-down": {
                                if (!await this.#moveFieldDown(
                                    row.name
                                )) {
                                    return;
                                }

                                const index = this.#field_table.rows.indexOf(row);
                                if (index !== -1 && index < this.#field_table.rows.length - 1) {
                                    this.#field_table.rows.splice(index, 1);
                                    this.#field_table.rows.splice(index + 1, 0, row);
                                }

                                await flux_table_element.moveRowDown(
                                    row.name
                                );

                                this.#value_table_filter_form_element = null;
                                this.#value_table = null;
                            }
                                break;

                            case "move-up": {
                                if (!await this.#moveFieldUp(
                                    row.name
                                )) {
                                    return;
                                }

                                const index = this.#field_table.rows.indexOf(row);
                                if (index > 0) {
                                    this.#field_table.rows.splice(index, 1);
                                    this.#field_table.rows.splice(index - 1, 0, row);
                                }

                                await flux_table_element.moveRowUp(
                                    row.name
                                );

                                this.#value_table_filter_form_element = null;
                                this.#value_table = null;
                            }
                                break;

                            default:
                                break;
                        }
                    });
                    return row_actions_flux_button_only_button_group_element;
                }

                return flux_value_format.formatValue(
                    value,
                    type
                );
            },
            async (value, type, index) => {
                if (type !== "actions" || !(value instanceof FluxButtonOnlyButtonGroupElement)) {
                    return;
                }

                value.disabled = [
                    ...index === 0 ? [
                        "move-up"
                    ] : [],
                    ...index > this.#field_table.rows.length - 2 ? [
                        "move-down"
                    ] : []
                ];
            },
            "No fields",
            await this.#getFluxStyleSheetManager()
        );
        this.#field_element.append(flux_table_element);
    }

    /**
     * @returns {Promise<FluxColorScheme>}
     */
    async #getFluxColorScheme() {
        this.#flux_color_scheme ??= await (await import("./Libs/flux-color-scheme/src/FluxColorScheme.mjs")).FluxColorScheme.new(
            null,
            null,
            (await import("./Libs/flux-color-scheme/src/ColorScheme/COLOR_SCHEME.mjs")).COLOR_SCHEME_LIGHT,
            null,
            null,
            null,
            null,
            null,
            null,
            await this.#getFluxStyleSheetManager()
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
        this.#flux_pwa_api ??= await (await import("./Libs/flux-pwa-api/src/FluxPwaApi.mjs")).FluxPwaApi.new(
            await this.#getFluxHttpApi(),
            await this.#getFluxStyleSheetManager()
        );

        return this.#flux_pwa_api;
    }

    /**
     * @returns {Promise<FluxStyleSheetManager>}
     */
    async #getFluxStyleSheetManager() {
        this.#flux_style_sheet_manager ??= await (await import("./Libs/flux-style-sheet-manager/src/FluxStyleSheetManager.mjs")).FluxStyleSheetManager.new(
            (await import("./Libs/flux-color-scheme/src/ColorScheme/COLOR_SCHEME_VARIABLE.mjs")).COLOR_SCHEME_VARIABLE_PREFIX
        );

        return this.#flux_style_sheet_manager;
    }

    /**
     * @returns {Promise<FluxValueFormat>}
     */
    async #getFluxValueFormat() {
        this.#flux_value_format ??= await (await import("./Libs/flux-value-format/src/FluxValueFormat.mjs")).FluxValueFormat.new(
            await this.#getFluxStyleSheetManager()
        );

        return this.#flux_value_format;
    }

    /**
     * @returns {Promise<void>}
     */
    async #getValueTable() {
        this.#value_element.innerHTML = "";

        let error_element = null;
        if (this.#value_table_filter_form_element === null || this.#value_table === null) {
            this.#flux_button_group_element.disabled = true;

            const flux_loading_spinner_element = await (await import("./Libs/flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs")).FluxLoadingSpinnerElement.new(
                await this.#getFluxStyleSheetManager()
            );
            this.#value_element.append(flux_loading_spinner_element);

            try {
                if (this.#value_table_filter_form_element === null) {
                    this.#value_table_filter_inputs = [];

                    const value_table_filter_inputs = await this.#request(
                        "value/get-filter-inputs"
                    );

                    const table_filter_form_element = await (await import("./Libs/flux-form/src/FluxFilterFormElement.mjs")).FluxFilterFormElement.new(
                        value_table_filter_inputs,
                        await this.#getFluxStyleSheetManager()
                    );

                    await table_filter_form_element.setValues(
                        this.#value_table_filter
                    );

                    this.#value_table_filter_inputs = value_table_filter_inputs;
                    this.#value_table_filter_form_element = table_filter_form_element;
                }

                if (this.#value_table_filter !== null) {
                    this.#value_table ??= await this.#request(
                        "value/get-table",
                        Object.fromEntries(await Promise.all(this.#value_table_filter.map(async value => [
                            value.name,
                            !value.name.startsWith(FIELD_PREFIX) && [
                                INPUT_TYPE_DATE,
                                INPUT_TYPE_DATETIME_LOCAL,
                                INPUT_TYPE_TIME
                            ].includes(this.#value_table_filter_inputs.find(input => input.name === value.name)?.type ?? null) ? await valueToTimestamp(
                                value.value,
                                true
                            ) : value.value
                        ])))
                    );
                } else {
                    this.#value_table = null;
                }
            } catch (error) {
                console.error(error);

                error_element = document.createElement("div");
                error_element.innerText = "Couldn't load values!";
            } finally {
                this.#flux_button_group_element.disabled = false;

                flux_loading_spinner_element.remove();
            }
        }

        if (this.#value_table_filter_form_element === null) {
            if (error_element !== null) {
                this.#value_element.append(error_element);
            }
            return;
        }

        this.#value_element.append(this.#value_table_filter_form_element);

        const {
            FLUX_BUTTON_ONLY_BUTTON_GROUP_ELEMENT_EVENT_CLICK,
            FluxButtonOnlyButtonGroupElement
        } = await import("./Libs/flux-button-group/src/FluxButtonOnlyButtonGroupElement.mjs");
        const actions_flux_button_only_button_group_element = await FluxButtonOnlyButtonGroupElement.new(
            [
                {
                    label: "View",
                    value: "view"
                },
                ...this.#value_table?.["show-add-new"] ?? false ? [
                    {
                        label: "Add",
                        value: "add"
                    }
                ] : []
            ],
            await this.#getFluxStyleSheetManager()
        );
        actions_flux_button_only_button_group_element.addEventListener(FLUX_BUTTON_ONLY_BUTTON_GROUP_ELEMENT_EVENT_CLICK, async e => {
            switch (e.detail.value) {
                case "add":
                    if (!await this.#addNewValue()) {
                        return;
                    }

                    this.#value_table = null;
                    this.#getValueTable();
                    break;

                case "view":
                    if (!await this.#value_table_filter_form_element.validate()) {
                        return;
                    }

                    this.#value_table_filter = this.#value_table_filter_form_element.values;
                    this.#value_table = null;
                    this.#getValueTable();
                    break;

                default:
                    break;
            }
        });
        this.#value_element.append(actions_flux_button_only_button_group_element);

        if (this.#value_table === null) {
            if (error_element !== null) {
                this.#value_element.append(error_element);
            }
            return;
        }

        const flux_value_format = await this.#getFluxValueFormat();

        this.#value_element.append(await (await import("./Libs/flux-table/src/FluxTableElement.mjs")).FluxTableElement.newWithData(
            [
                ...this.#value_table.columns,
                {
                    key: "actions",
                    label: "Actions",
                    type: "actions",
                    width: "1px"
                }
            ],
            "name",
            this.#value_table.rows,
            async (value = null, type = null, name = null) => {
                const row = this.#value_table.rows.find(_row => _row.name === name) ?? null;

                if (type === "actions") {
                    const row_actions_flux_button_only_button_group_element = await FluxButtonOnlyButtonGroupElement.new(
                        row["has-value"] ? [
                            {
                                label: "Edit",
                                value: "edit"
                            },
                            {
                                label: "Delete",
                                value: "delete"
                            }
                        ] : [
                            {
                                label: "Add",
                                value: "add"
                            }
                        ],
                        await this.#getFluxStyleSheetManager()
                    );
                    row_actions_flux_button_only_button_group_element.addEventListener(FLUX_BUTTON_ONLY_BUTTON_GROUP_ELEMENT_EVENT_CLICK, async e => {
                        switch (e.detail.value) {
                            case "add":
                                if (!await this.#addValue(
                                    row.name
                                )) {
                                    return;
                                }

                                this.#value_table = null;
                                this.#getValueTable();
                                break;

                            case "delete":
                                if (!await this.#deleteValue(
                                    row.name
                                )) {
                                    return;
                                }

                                this.#value_table = null;
                                this.#getValueTable();
                                break;

                            case "edit":
                                if (!await this.#editValue(
                                    row.name
                                )) {
                                    return;
                                }

                                this.#value_table = null;
                                this.#getValueTable();
                                break;

                            default:
                                break;
                        }
                    });
                    return row_actions_flux_button_only_button_group_element;
                }

                return flux_value_format.formatValue(
                    value,
                    type
                );
            },
            null,
            "No values",
            await this.#getFluxStyleSheetManager()
        ));
    }

    /**
     * @returns {Promise<void>}
     */
    async #init() {
        await (await this.#getFluxStyleSheetManager()).addStyleSheet(
            layout_css
        );

        await (await this.#getFluxPwaApi()).initPwa(
            `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/Manifest/manifest.json`
        );

        await this.#getFluxColorScheme();
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #moveFieldDown(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.loading(
            await this.#getFluxStyleSheetManager()
        );

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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
        }

        flux_overlay_element.remove();

        return true;
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async #moveFieldUp(name) {
        const {
            FluxOverlayElement
        } = await import("./Libs/flux-overlay/src/FluxOverlayElement.mjs");

        const flux_overlay_element = await FluxOverlayElement.loading(
            await this.#getFluxStyleSheetManager()
        );

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
                "OK",
                await this.#getFluxStyleSheetManager()
            );

            return false;
        }

        flux_overlay_element.remove();

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
