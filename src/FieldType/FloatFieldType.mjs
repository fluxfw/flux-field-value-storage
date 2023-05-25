import { FIELD_TYPE_FLOAT } from "./FIELD_TYPE.mjs";
import { FORMAT_TYPE_TEXT } from "../../../flux-format/src/FORMAT_TYPE.mjs";
import { INPUT_TYPE_NUMBER } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

const STEP_VALUE = 0.000001;

const MAX_STEP_VALUE = 1 - STEP_VALUE;

const MIN_STEP_VALUE = STEP_VALUE;

/**
 * @implements {FieldType}
 */
export class FloatFieldType {
    /**
     * @returns {FloatFieldType}
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
            },
            {
                label: "Step value",
                max: `${MAX_STEP_VALUE}`,
                min: `${MIN_STEP_VALUE}`,
                name: "step-value",
                required: true,
                step: `${STEP_VALUE}`,
                type: INPUT_TYPE_NUMBER,
                value: field?.["step-value"] ?? null
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
                "Minimal value",
                `${field["minimal-value"] ?? ""}`
            ],
            [
                "Maximal value",
                `${field["maximal-value"] ?? ""}`
            ],
            [
                "Step value",
                `${field["step-value"]}`
            ]
        ];
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
        return FIELD_TYPE_FLOAT;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Float";
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<number | null>}
     */
    async getValueAsFormat(field, value = null) {
        return value;
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<number | null>}
     */
    async getValueAsText(field, value = null) {
        return value;
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
            step: `${field["step-value"]}`,
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
            "maximal-value": field["maximal-value"],
            "step-value": field["step-value"]
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
            "maximal-value": field["maximal-value"],
            "step-value": field["step-value"]
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
        if (field["minimal-value"] !== null && !Number.isFinite(field["minimal-value"])) {
            return false;
        }

        if (field["maximal-value"] !== null && !Number.isFinite(field["maximal-value"])) {
            return false;
        }

        if (!Number.isFinite(field["step-value"]) || field["step-value"] < MIN_STEP_VALUE || field["step-value"] > MAX_STEP_VALUE) {
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
        if (value !== null && !Number.isFinite(value)) {
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
