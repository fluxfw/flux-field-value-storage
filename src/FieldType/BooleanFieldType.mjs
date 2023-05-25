import { FIELD_TYPE_BOOLEAN } from "./FIELD_TYPE.mjs";
import { FORMAT_TYPE_TEXT } from "../../../flux-format/src/FORMAT_TYPE.mjs";
import { INPUT_TYPE_CHECKBOX } from "../../../flux-form/src/INPUT_TYPE.mjs";

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
    async getFieldTableAdditionalColumn(field) {
        return null;
    }

    /**
     * @param {Field} field
     * @returns {Promise<string>}
     */
    async getFormatType(field) {
        return FORMAT_TYPE_TEXT;
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
     * @param {{[key: string]: *}} field
     * @returns {Promise<null>}
     */
    async mapGetField(field) {
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
     * @param {Field} field
     * @returns {Promise<null>}
     */
    async mapStoreField(field) {
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
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
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
