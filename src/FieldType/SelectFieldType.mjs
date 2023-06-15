import { FIELD_TYPE_SELECT } from "./FIELD_TYPE.mjs";
import { INPUT_TYPE_ENTRIES, INPUT_TYPE_SELECT, INPUT_TYPE_TEXT } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

const VALUE_PATTERN = /^[^,]+$/;

/**
 * @implements {FieldType}
 */
export class SelectFieldType {
    /**
     * @returns {SelectFieldType}
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
     * @param {Field | null} field
     * @returns {Promise<Input[]>}
     */
    async getFieldInputs(field = null) {
        return [
            {
                entries: [
                    {
                        label: "Value",
                        name: "value",
                        pattern: VALUE_PATTERN.source,
                        required: true,
                        subtitle: "Commas can't be used",
                        type: INPUT_TYPE_TEXT
                    },
                    {
                        label: "Label",
                        name: "label",
                        required: true,
                        type: INPUT_TYPE_TEXT
                    }
                ],
                label: "Options",
                name: "options",
                required: true,
                type: INPUT_TYPE_ENTRIES,
                value: field?.options?.map(option => Object.entries(option).map(([
                    name,
                    value
                ]) => ({
                    name,
                    value
                }))) ?? []
            }
        ];
    }

    /**
     * @param {Field} field
     * @returns {Promise<[string, string][]>}
     */
    async getFieldTableAdditionalColumn(field) {
        return [
            [
                "Options",
                field.options.map(option => `${option.label} (${option.value})`).join(", ")
            ]
        ];
    }

    /**
     * @returns {Promise<null>}
     */
    async getFormatValueType() {
        return null;
    }

    /**
     * @returns {Promise<string>}
     */
    async getType() {
        return FIELD_TYPE_SELECT;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Select";
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string | null>}
     */
    async getValueAsFormat(field, value = null) {
        return this.getValueAsText(
            field,
            value
        );
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string | null>}
     */
    async getValueAsText(field, value = null) {
        return (value ?? "") !== "" ? field.options.find(option => option.value === value)?.label ?? value : null;
    }

    /**
     * @param {Field} field
     * @returns {Promise<Input[]>}
     */
    async getValueFilterInputs(field) {
        return [
            {
                multiple: true,
                options: field.options.map(option => ({
                    label: option.label,
                    value: option.value
                })),
                type: INPUT_TYPE_SELECT
            }
        ];
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<Input>}
     */
    async getValueInput(field, value = null) {
        return {
            options: field.options.map(option => ({
                label: option.label,
                value: option.value
            })),
            type: INPUT_TYPE_SELECT,
            value: value ?? ""
        };
    }

    /**
     * @param {Field} field
     * @param {string[] | null} value
     * @returns {Promise<string[] | null>}
     */
    async mapFilterValue(field, value = null) {
        return typeof value === "string" ? value.split(",") : value;
    }

    /**
     * @param {{[key: string]: *}} field
     * @returns {Promise<{[key: string]: *}>}
     */
    async mapGetField(field) {
        return {
            options: field.options.map(option => ({
                label: option.label,
                value: option.value
            }))
        };
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string>}
     */
    async mapGetValue(field, value = null) {
        return value ?? "";
    }

    /**
     * @param {Field} field
     * @returns {Promise<{[key: string]: *}>}
     */
    async mapStoreField(field) {
        return {
            options: field.options.map(option => ({
                label: option.label,
                value: option.value
            }))
        };
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string>}
     */
    async mapStoreValue(field, value = null) {
        return value ?? "";
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @param {string[] | null} filter_value
     * @returns {Promise<boolean>}
     */
    async matchFilterValue(field, value = null, filter_value = null) {
        const _filter_value = filter_value ?? [];
        const _value = value ?? "";

        if (_filter_value.length === 0) {
            return _value === "";
        }

        return _filter_value.includes(_value);
    }

    /**
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
        if (!Array.isArray(field.options) || field.options.length === 0 || field.options.some(option => option === null || typeof option !== "object" || typeof option.value !== "string" || !VALUE_PATTERN.test(option.value) || typeof option.label !== "string" || option.label === "") || new Set(field.options.map(option => option.value)).size !== field.options.length) {
            return false;
        }

        return true;
    }

    /**
     * @param {Field} field
     * @param {string[] | null} value
     * @param {string | null} attribute
     * @returns {Promise<boolean>}
     */
    async validateFilterValue(field, value = null, attribute = null) {
        if (attribute !== null) {
            return false;
        }

        if (!Array.isArray(value) || value.some(_value => typeof _value !== "string" || !VALUE_PATTERN.test(_value) || !field.options.some(option => option.value === _value)) || new Set(value).size !== value.length) {
            return false;
        }

        return true;
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<boolean>}
     */
    async validateValue(field, value = null) {
        if (typeof value !== "string") {
            return false;
        }

        if (value !== "" && (!VALUE_PATTERN.test(value) || !field.options.some(option => option.value === value))) {
            return false;
        }

        if (field.required && value === "") {
            return false;
        }

        return true;
    }
}
