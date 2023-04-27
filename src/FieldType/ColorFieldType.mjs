import { FIELD_TYPE_COLOR } from "./FIELD_TYPE.mjs";
import { INPUT_TYPE_COLOR } from "../../../flux-overlay/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-overlay/src/Input.mjs").Input} Input */

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
     * @param {Field | null} field
     * @returns {Promise<null>}
     */
    async getFieldInputs(field = null) {
        return null;
    }

    /**
     * @param {Field} field
     * @returns {Promise<null>}
     */
    async getFieldTableOtherColumn(field) {
        return null;
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
     * @returns {Promise<string>}
     */
    async getValueAsText(field, value = null) {
        return (value ?? "") !== "" ? value : "-";
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
     * @param {{[key: string]: *}} field
     * @returns {Promise<null>}
     */
    async mapGetField(field) {
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
     * @param {Field} field
     * @returns {Promise<null>}
     */
    async mapStoreField(field) {
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
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
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
