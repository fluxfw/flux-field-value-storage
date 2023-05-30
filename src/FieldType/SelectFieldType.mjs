import { FIELD_TYPE_SELECT } from "./FIELD_TYPE.mjs";
import { VALUE_FORMAT_TYPE_TEXT } from "../../../flux-value-format/src/VALUE_FORMAT_TYPE.mjs";
import { INPUT_TYPE_ENTRIES, INPUT_TYPE_SELECT, INPUT_TYPE_TEXT } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

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
                        required: true,
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
     * @param {Field} field
     * @returns {Promise<string>}
     */
    async getValueFormatType(field) {
        return VALUE_FORMAT_TYPE_TEXT;
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
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
        if (!Array.isArray(field.options) || field.options.length === 0 || field.options.some(option => option === null || typeof option !== "object" || typeof option.value !== "string" || option.value === "" || typeof option.label !== "string" || option.label === "") || new Set(field.options.map(option => option.value)).size !== field.options.length) {
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

        if (value !== "" && !field.options.some(option => option.value === value)) {
            return false;
        }

        if (field.required && value === "") {
            return false;
        }

        return true;
    }
}
