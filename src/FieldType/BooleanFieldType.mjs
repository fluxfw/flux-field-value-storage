import { FIELD_TYPE_BOOLEAN } from "./FIELD_TYPE.mjs";
import { INPUT_TYPE_CHECKBOX, INPUT_TYPE_SELECT } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

/**
 * @implements {FieldType}
 */
export class BooleanFieldType {
    /**
     * @returns {BooleanFieldType}
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
     * @returns {Promise<null>}
     */
    async getFieldInputs() {
        return null;
    }

    /**
     * @returns {Promise<null>}
     */
    async getFieldTableAdditionalColumn() {
        return null;
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
        return FIELD_TYPE_BOOLEAN;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Boolean";
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<string>}
     */
    async getValueAsFormat(field, value = null) {
        return this.getValueAsText(
            field,
            value
        );
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<string>}
     */
    async getValueAsText(field, value = null) {
        return value ?? false ? "Yes" : "No";
    }

    /**
     * @param {Field} field
     * @returns {Promise<Input>}
     */
    async getValueFilterInput(field) {
        return {
            options: [
                {
                    label: "No",
                    value: "false"
                },
                {
                    label: "Yes",
                    value: "true"
                }
            ],
            type: INPUT_TYPE_SELECT
        };
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<Input>}
     */
    async getValueInput(field, value = null) {
        return {
            type: INPUT_TYPE_CHECKBOX,
            value: value ?? false
        };
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<boolean | null>}
     */
    async mapFilterValue(field, value = null) {
        return value === "true" ? true : value === "false" ? false : value;
    }

    /**
     * @returns {Promise<null>}
     */
    async mapGetField() {
        return null;
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<boolean>}
     */
    async mapGetValue(field, value = null) {
        return value ?? false;
    }

    /**
     * @returns {Promise<null>}
     */
    async mapStoreField() {
        return null;
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<boolean>}
     */
    async mapStoreValue(field, value = null) {
        return value ?? false;
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @param {boolean | null} filter_value
     * @returns {Promise<boolean>}
     */
    async matchFilterValue(field, value = null, filter_value = null) {
        if (filter_value === null) {
            return true;
        }

        return (value ?? false) === filter_value;
    }

    /**
     * @returns {Promise<boolean>}
     */
    async validateField() {
        return true;
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<boolean>}
     */
    async validateFilterValue(field, value = null) {
        if (value === null) {
            return true;
        }

        if (typeof value !== "boolean") {
            return false;
        }

        return true;
    }

    /**
     * @param {Field} field
     * @param {boolean | null} value
     * @returns {Promise<boolean>}
     */
    async validateValue(field, value = null) {
        if (typeof value !== "boolean") {
            return false;
        }

        if (field.required && !value) {
            return false;
        }

        return true;
    }
}
