import { FIELD_TYPE_TIME } from "./FIELD_TYPE.mjs";
import { FORMAT_VALUE_TYPE_TIME } from "../../../flux-value-format/src/FORMAT_VALUE_TYPE.mjs";
import { INPUT_TYPE_TIME } from "../../../flux-form/src/INPUT_TYPE.mjs";
import { TIME_PATTERN } from "../../../flux-value-format/src/DEFAULT_FORMAT_VALUE_TYPES.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */
/** @typedef {import("../../../flux-value-format/src/Time/TimeValue.mjs").TimeValue} TimeValue */

/**
 * @implements {FieldType}
 */
export class TimeFieldType {
    /**
     * @returns {TimeFieldType}
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
                step: "1",
                type: INPUT_TYPE_TIME,
                value: field?.["minimal-value"] ?? ""
            },
            {
                label: "Maximal value",
                name: "maximal-value",
                step: "1",
                type: INPUT_TYPE_TIME,
                value: field?.["maximal-value"] ?? ""
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
                field["minimal-value"]
            ],
            [
                "Maximal value",
                field["maximal-value"]
            ]
        ];
    }

    /**
     * @returns {Promise<string>}
     */
    async getFormatValueType() {
        return FORMAT_VALUE_TYPE_TIME;
    }

    /**
     * @returns {Promise<string>}
     */
    async getType() {
        return FIELD_TYPE_TIME;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Time";
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<TimeValue>}
     */
    async getValueAsFormat(field, value = null) {
        return {
            time: value,
            "show-as-utc": true
        };
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
            ...field["maximal-value"] !== "" ? {
                max: field["maximal-value"]
            } : null,
            ...field["minimal-value"] !== "" ? {
                min: field["minimal-value"]
            } : null,
            step: "1",
            type: INPUT_TYPE_TIME
        };
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<Input>}
     */
    async getValueInput(field, value = null) {
        return {
            ...field["maximal-value"] !== "" ? {
                max: field["maximal-value"]
            } : null,
            ...field["minimal-value"] !== "" ? {
                min: field["minimal-value"]
            } : null,
            step: "1",
            type: INPUT_TYPE_TIME,
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
            "minimal-value": field["minimal-value"],
            "maximal-value": field["maximal-value"]
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
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
        if (typeof field["minimal-value"] !== "string" && !TIME_PATTERN.test(field["minimal-value"])) {
            return false;
        }

        if (typeof field["maximal-value"] !== "string" && !TIME_PATTERN.test(field["maximal-value"])) {
            return false;
        }

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

        if (!TIME_PATTERN.test(value)) {
            return false;
        }

        if (field["minimal-value"] !== "" && value < field["minimal-value"]) {
            return false;
        }

        if (field["maximal-value"] !== "" && value > field["maximal-value"]) {
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

        if (value !== "" && !TIME_PATTERN.test(value)) {
            return false;
        }

        if (field.required && value === "") {
            return false;
        }

        if (value !== "" && field["minimal-value"] !== "" && value < field["minimal-value"]) {
            return false;
        }

        if (value !== "" && field["maximal-value"] !== "" && value > field["maximal-value"]) {
            return false;
        }

        return true;
    }
}
