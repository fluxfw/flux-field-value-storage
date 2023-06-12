import { FIELD_TYPE_COLOR } from "./FIELD_TYPE.mjs";
import { FORMAT_VALUE_TYPE_COLOR } from "../../../flux-value-format/src/FORMAT_VALUE_TYPE.mjs";
import { INPUT_TYPE_COLOR } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

const COLOR_PATTERN = /^#[\da-f]{6}$/;

/**
 * @implements {FieldType}
 */
export class ColorFieldType {
    /**
     * @returns {ColorFieldType}
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
     * @returns {Promise<string>}
     */
    async getFormatValueType() {
        return FORMAT_VALUE_TYPE_COLOR;
    }

    /**
     * @returns {Promise<string>}
     */
    async getType() {
        return FIELD_TYPE_COLOR;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Color";
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string | null>}
     */
    async getValueAsFormat(field, value = null) {
        return value;
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string | null>}
     */
    async getValueAsText(field, value = null) {
        return value;
    }

    /**
     * @param {Field} field
     * @returns {Promise<Input>}
     */
    async getValueFilterInput(field) {
        return {
            type: INPUT_TYPE_COLOR
        };
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<Input>}
     */
    async getValueInput(field, value = null) {
        return {
            type: INPUT_TYPE_COLOR,
            value: value ?? ""
        };
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string | null>}
     */
    async mapFilterValue(field, value = null) {
        return value;
    }

    /**
     * @returns {Promise<null>}
     */
    async mapGetField() {
        return null;
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
     * @returns {Promise<null>}
     */
    async mapStoreField() {
        return null;
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
     * @param {string | null} filter_value
     * @returns {Promise<boolean>}
     */
    async matchFilterValue(field, value = null, filter_value = null) {
        if (filter_value === null) {
            return true;
        }

        return value === filter_value;
    }

    /**
     * @returns {Promise<boolean>}
     */
    async validateField() {
        return true;
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<boolean>}
     */
    async validateFilterValue(field, value = null) {
        if (value === null) {
            return true;
        }

        if (typeof value !== "string" || value === "") {
            return false;
        }

        if (!COLOR_PATTERN.test(value)) {
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

        if (value !== "" && !COLOR_PATTERN.test(value)) {
            return false;
        }

        if (field.required && value === "") {
            return false;
        }

        return true;
    }
}
