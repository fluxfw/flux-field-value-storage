import { FIELD_TYPE_NUMBER } from "./FIELD_TYPE.mjs";
import { INPUT_TYPE_NUMBER } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

const FILTER_ATTRIBUTE_FROM = "from";

const FILTER_ATTRIBUTE_TO = "to";

const STEP_VALUE = 0.000001;

/**
 * @implements {FieldType}
 */
export class NumberFieldType {
    /**
     * @returns {NumberFieldType}
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
                min: `${STEP_VALUE}`,
                name: "step-value",
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
                `${field["step-value"] ?? ""}`
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
        return FIELD_TYPE_NUMBER;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Number";
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
     * @returns {Promise<Input[]>}
     */
    async getValueFilterInputs(field) {
        return [
            {
                ...field["maximal-value"] !== null ? {
                    max: `${field["maximal-value"]}`
                } : null,
                ...field["minimal-value"] !== null ? {
                    min: `${field["minimal-value"]}`
                } : null,
                step: `${field["step-value"] ?? STEP_VALUE}`,
                type: INPUT_TYPE_NUMBER
            },
            {
                label: `${field.label} from`,
                ...field["maximal-value"] !== null ? {
                    max: `${field["maximal-value"]}`
                } : null,
                ...field["minimal-value"] !== null ? {
                    min: `${field["minimal-value"]}`
                } : null,
                name: FILTER_ATTRIBUTE_FROM,
                required: true,
                step: `${field["step-value"] ?? STEP_VALUE}`,
                type: INPUT_TYPE_NUMBER
            },
            {
                label: `${field.label} to`,
                ...field["maximal-value"] !== null ? {
                    max: `${field["maximal-value"]}`
                } : null,
                ...field["minimal-value"] !== null ? {
                    min: `${field["minimal-value"]}`
                } : null,
                name: FILTER_ATTRIBUTE_TO,
                required: true,
                step: `${field["step-value"] ?? STEP_VALUE}`,
                type: INPUT_TYPE_NUMBER
            }
        ];
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
            step: `${field["step-value"] ?? STEP_VALUE}`,
            type: INPUT_TYPE_NUMBER,
            value
        };
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @returns {Promise<number | null>}
     */
    async mapFilterValue(field, value = null) {
        return typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value) ? parseFloat(value) : value === "null" ? null : value;
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
     * @param {number | null} value
     * @param {number | null} filter_value
     * @param {string | null} attribute
     * @returns {Promise<boolean>}
     */
    async matchFilterValue(field, value = null, filter_value = null, attribute = null) {
        switch (attribute) {
            case FILTER_ATTRIBUTE_FROM:
                return value >= filter_value;

            case FILTER_ATTRIBUTE_TO:
                return value <= filter_value;

            default:
                return value === filter_value;
        }
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

        if (field["step-value"] !== null && (!Number.isFinite(field["step-value"]) || field["step-value"] < STEP_VALUE)) {
            return false;
        }

        return true;
    }

    /**
     * @param {Field} field
     * @param {number | null} value
     * @param {string | null} attribute
     * @returns {Promise<boolean>}
     */
    async validateFilterValue(field, value = null, attribute = null) {
        if (attribute !== null && ![
            FILTER_ATTRIBUTE_FROM,
            FILTER_ATTRIBUTE_TO
        ].includes(attribute)) {
            return false;
        }

        if (value !== null && !Number.isFinite(value)) {
            return false;
        }

        if (attribute !== null && value === null) {
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
