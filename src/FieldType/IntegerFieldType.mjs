import { FIELD_TYPE_INTEGER } from "./FIELD_TYPE.mjs";
import { INPUT_TYPE_NUMBER } from "../../../flux-overlay/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-overlay/src/Input.mjs").Input} Input */

const STEP_VALUE = 1;

/**
 * @implements {FieldType}
 */
export class IntegerFieldType {
    /**
     * @returns {IntegerFieldType}
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
                label: "Minimal value",
                name: "minimal-value",
                step: `${STEP_VALUE}`,
                type: INPUT_TYPE_NUMBER,
                value: field?.["minimal-value"] ?? null
            },
            {
                label: "Maximal value",
                name: "maximal-value",
                step: `${STEP_VALUE}`,
                type: INPUT_TYPE_NUMBER,
                value: field?.["maximal-value"] ?? null
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
                "Minimal value",
                `${field["minimal-value"] ?? ""}`
            ],
            [
                "Maximal value",
                `${field["maximal-value"] ?? ""}`
            ]
        ];
    }

    /**
     * @returns {Promise<string>}
     */
    async getType() {
        return FIELD_TYPE_INTEGER;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Integer";
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<string>}
     */
    async getValueAsText(field, value = null) {
        return `${value ?? "-"}`;
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<Input>}
     */
    async getValueInput(field, value = null) {
        return {
            ...field["maximal-value"] !== null ? {
                max: `${field["maximal-value"]}`
            } : null,
            ...field["minimal-value"] !== null ? {
                min: `${field["minimal-value"]}`
            } : null,
            step: `${STEP_VALUE}`,
            type: INPUT_TYPE_NUMBER,
            value
        };
    }

    /**
     * @param {{[key: string]: *}} field
     * @returns {Promise<{[key: string]: *}>}
     */
    async mapGetField(field) {
        return {
            "minimal-value": field["minimal-value"],
            "maximal-value": field["maximal-value"]
        };
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<number | null>}
     */
    async mapGetValue(field, value = null) {
        return value;
    }

    /**
     * @param {Field} field
     * @returns {Promise<{[key: string]: *}>}
     */
    async mapStoreField(field) {
        return {
            "minimal-value": field["minimal-value"],
            "maximal-value": field["maximal-value"]
        };
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<number | null>}
     */
    async mapStoreValue(field, value = null) {
        return value;
    }

    /**
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
        if (field["minimal-value"] !== null && !Number.isInteger(field["minimal-value"])) {
            return false;
        }

        if (field["maximal-value"] !== null && !Number.isInteger(field["maximal-value"])) {
            return false;
        }

        return true;
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<boolean>}
     */
    async validateValue(field, value = null) {
        if (value !== null && !Number.isInteger(value)) {
            return false;
        }

        if (field.required && value === null) {
            return false;
        }

        if (value !== null && field["minimal-value"] !== null && value < field["minimal-value"]) {
            return false;
        }

        if (value !== null && field["maximal-value"] !== null && value > field["maximal-value"]) {
            return false;
        }

        return true;
    }
}