import { FIELD_TYPE_PASSWORD } from "./FIELD_TYPE.mjs";
import { INPUT_TYPE_PASSWORD, INPUT_TYPE_TEXT } from "../../../flux-overlay/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-overlay/src/Input.mjs").Input} Input */

/**
 * @implements {FieldType}
 */
export class PasswordFieldType {
    /**
     * @returns {PasswordFieldType}
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
                label: "Placeholder",
                name: "placeholder",
                type: INPUT_TYPE_TEXT,
                value: field?.placeholder ?? ""
            }
        ];
    }

    /**
     * @param {Field} field
     * @returns {Promise<[string, string][]>}
     */
    async getFieldTableOtherColumn(field) {
        return [
            [
                "Placeholder",
                field.placeholder
            ]
        ];
    }

    /**
     * @returns {Promise<string>}
     */
    async getType() {
        return FIELD_TYPE_PASSWORD;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Password";
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string>}
     */
    async getValueAsText(field, value = null) {
        return (value ?? "") !== "" ? "●".repeat(10) : "-";
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<Input>}
     */
    async getValueInput(field, value = null) {
        return {
            ...field.placeholder !== "" ? {
                placeholder: field.placeholder
            } : null,
            type: INPUT_TYPE_PASSWORD,
            value: value ?? ""
        };
    }

    /**
     * @param {{[key: string]: *}} field
     * @returns {Promise<{[key: string]: *}>}
     */
    async mapGetField(field) {
        return {
            placeholder: field.placeholder
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
            placeholder: field.placeholder
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
        if (typeof field.placeholder !== "string") {
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

        if (field.required && value === "") {
            return false;
        }

        return true;
    }
}