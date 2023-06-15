import { ADDITIONAL_VALIDATION_TYPE_REGULAR_EXPRESSION } from "../../../flux-form/src/ADDITIONAL_VALIDATION_TYPE.mjs";
import { FIELD_TYPE_REGULAR_EXPRESSION } from "./FIELD_TYPE.mjs";
import { INPUT_TYPE_TEXT } from "../../../flux-form/src/INPUT_TYPE.mjs";
import { validateRegularExpressionValue, valueToRegExp } from "../../../flux-form/src/DEFAULT_ADDITIONAL_VALIDATION_TYPES.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

const FILTER_ATTRIBUTE_CONTAINS = "contains";

/**
 * @implements {FieldType}
 */
export class RegularExpressionFieldType {
    /**
     * @returns {RegularExpressionFieldType}
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
            },
            {
                "additional-validation-type": ADDITIONAL_VALIDATION_TYPE_REGULAR_EXPRESSION,
                label: "Regular expression",
                name: "regular-expression",
                required: true,
                type: INPUT_TYPE_TEXT,
                value: field?.["regular-expression"] ?? ""
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
                "Placeholder",
                field.placeholder
            ],
            [
                "Regular expression",
                field["regular-expression"]
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
        return FIELD_TYPE_REGULAR_EXPRESSION;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTypeLabel() {
        return "Regular expression";
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<string | null}
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
     * @returns {Promise<Input[]>}
     */
    async getValueFilterInputs(field) {
        return [
            {
                pattern: field["regular-expression"],
                ...field.placeholder !== "" ? {
                    placeholder: field.placeholder
                } : null,
                type: INPUT_TYPE_TEXT
            },
            {
                label: `${field.label} contains`,
                name: FILTER_ATTRIBUTE_CONTAINS,
                ...field.placeholder !== "" ? {
                    placeholder: field.placeholder
                } : null,
                required: true,
                type: INPUT_TYPE_TEXT
            }
        ];
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @returns {Promise<Input>}
     */
    async getValueInput(field, value = null) {
        return {
            pattern: field["regular-expression"],
            ...field.placeholder !== "" ? {
                placeholder: field.placeholder
            } : null,
            type: INPUT_TYPE_TEXT,
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
            placeholder: field.placeholder,
            "regular-expression": field["regular-expression"]
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
            placeholder: field.placeholder,
            "regular-expression": field["regular-expression"]
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
     * @param {string | null} attribute
     * @returns {Promise<boolean>}
     */
    async matchFilterValue(field, value = null, filter_value = null, attribute = null) {
        switch (attribute) {
            case FILTER_ATTRIBUTE_CONTAINS:
                return (value ?? "").toLowerCase().includes((filter_value ?? "").toLowerCase());

            default:
                return (value ?? "") === (filter_value ?? "");
        }
    }

    /**
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
        if (typeof field.placeholder !== "string") {
            return false;
        }

        if (typeof field["regular-expression"] !== "string" || field["regular-expression"] === "") {
            return false;
        }

        if (!await validateRegularExpressionValue(
            field["regular-expression"]
        )) {
            return false;
        }

        return true;
    }

    /**
     * @param {Field} field
     * @param {string | null} value
     * @param {string | null} attribute
     * @returns {Promise<boolean>}
     */
    async validateFilterValue(field, value = null, attribute = null) {
        if (attribute !== null && attribute !== FILTER_ATTRIBUTE_CONTAINS) {
            return false;
        }

        if (typeof value !== "string") {
            return false;
        }

        if (attribute === null && value !== "" && !(await valueToRegExp(
            field["regular-expression"]
        )).test(value)) {
            return false;
        }

        if (attribute !== null && value === "") {
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

        if (value !== "" && !(await valueToRegExp(
            field["regular-expression"]
        )).test(value)) {
            return false;
        }

        if (field.required && value === "") {
            return false;
        }

        return true;
    }
}
