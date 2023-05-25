import { FORMAT_TYPE_TEXT } from "../../../flux-format/src/FORMAT_TYPE.mjs";
import { FIELD_TYPE_BOOLEAN, FIELD_TYPE_COLOR, FIELD_TYPE_DATE, FIELD_TYPE_EMAIL, FIELD_TYPE_FLOAT, FIELD_TYPE_INTEGER, FIELD_TYPE_MULTILINE_TEXT, FIELD_TYPE_MULTIPLE_SELECT, FIELD_TYPE_PASSWORD, FIELD_TYPE_REGULAR_EXPRESSION, FIELD_TYPE_SELECT, FIELD_TYPE_TEXT, FIELD_TYPE_TIME, FIELD_TYPE_URL } from "./FIELD_TYPE.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-format/src/FluxFormat.mjs").FluxFormat} FluxFormat */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

export class FieldTypeService {
    /**
     * @type {Map<string, FieldType>}
     */
    #field_types;
    /**
     * @type {FluxFormat}
     */
    #flux_format;

    /**
     * @param {FluxFormat} flux_format
     * @returns {FieldTypeService}
     */
    static new(flux_format) {
        return new this(
            flux_format
        );
    }

    /**
     * @param {FluxFormat} flux_format
     * @private
     */
    constructor(flux_format) {
        this.#flux_format = flux_format;
        this.#field_types = new Map();
    }

    /**
     * @param {Field | null} field
     * @returns {Promise<Input[] | null>}
     */
    async getFieldInputs(field = null) {
        if (field === null) {
            return null;
        }

        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return null;
        }

        return field_type.getFieldInputs(
            field
        );
    }

    /**
     * @param {Field} field
     * @returns {Promise<[string, string][] | null>}
     */
    async getFieldTableAdditionalColumn(field) {
        const additional = [
            [
                "Subtitle",
                field.subtitle
            ],
            [
                "Required",
                field.required ? "Yes" : ""
            ],
            ...await (await this.getFieldType(
                field.type
            ))?.getFieldTableAdditionalColumn(
                field
            ) ?? []
        ].filter(([
            ,
            value
        ]) => (value ?? "") !== "");

        return additional.length > 0 ? additional : null;
    }

    /**
     * @param {string} type
     * @returns {Promise<FieldType | null>}
     */
    async getFieldType(type) {
        let field_type = null;

        if (this.#field_types.has(type)) {
            field_type = this.#field_types.get(type) ?? null;
        } else {
            switch (type) {
                case FIELD_TYPE_BOOLEAN:
                    field_type = (await import("./BooleanFieldType.mjs")).BooleanFieldType.new();
                    break;

                case FIELD_TYPE_COLOR:
                    field_type = (await import("./ColorFieldType.mjs")).ColorFieldType.new();
                    break;

                case FIELD_TYPE_DATE:
                    field_type = (await import("./DateFieldType.mjs")).DateFieldType.new();
                    break;

                case FIELD_TYPE_EMAIL:
                    field_type = (await import("./EmailFieldType.mjs")).EmailFieldType.new();
                    break;

                case FIELD_TYPE_FLOAT:
                    field_type = (await import("./FloatFieldType.mjs")).FloatFieldType.new();
                    break;

                case FIELD_TYPE_INTEGER:
                    field_type = (await import("./IntegerFieldType.mjs")).IntegerFieldType.new();
                    break;

                case FIELD_TYPE_MULTILINE_TEXT:
                    field_type = (await import("./MultilineTextFieldType.mjs")).MultilineTextFieldType.new();
                    break;

                case FIELD_TYPE_MULTIPLE_SELECT:
                    field_type = (await import("./MultipleSelectFieldType.mjs")).MultipleSelectFieldType.new();
                    break;

                case FIELD_TYPE_PASSWORD:
                    field_type = (await import("./PasswordFieldType.mjs")).PasswordFieldType.new();
                    break;

                case FIELD_TYPE_REGULAR_EXPRESSION:
                    field_type = (await import("./RegularExpressionFieldType.mjs")).RegularExpressionFieldType.new();
                    break;

                case FIELD_TYPE_SELECT:
                    field_type = (await import("./SelectFieldType.mjs")).SelectFieldType.new();
                    break;

                case FIELD_TYPE_TEXT:
                    field_type = (await import("./TextFieldType.mjs")).TextFieldType.new();
                    break;

                case FIELD_TYPE_TIME:
                    field_type = (await import("./TimeFieldType.mjs")).TimeFieldType.new();
                    break;

                case FIELD_TYPE_URL:
                    field_type = (await import("./UrlFieldType.mjs")).UrlFieldType.new();
                    break;

                default:
                    break;
            }

            this.#field_types.set(type, field_type);
        }

        return field_type;
    }

    /**
     * @returns {Promise<FieldType[]>}
     */
    async getFieldTypes() {
        const field_types = [];

        for (const type of [
            FIELD_TYPE_BOOLEAN,
            FIELD_TYPE_COLOR,
            FIELD_TYPE_DATE,
            FIELD_TYPE_EMAIL,
            FIELD_TYPE_FLOAT,
            FIELD_TYPE_INTEGER,
            FIELD_TYPE_MULTILINE_TEXT,
            FIELD_TYPE_MULTIPLE_SELECT,
            FIELD_TYPE_PASSWORD,
            FIELD_TYPE_REGULAR_EXPRESSION,
            FIELD_TYPE_SELECT,
            FIELD_TYPE_TEXT,
            FIELD_TYPE_TIME,
            FIELD_TYPE_URL
        ]) {
            field_types.push(await this.getFieldType(
                type
            ));
        }

        return field_types;
    }

    /**
     * @param {Field} field
     * @returns {Promise<string>}
     */
    async getFormatType(field) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return FORMAT_TYPE_TEXT;
        }

        return field_type.getFormatType();
    }

    /**
     * @param {Field} field
     * @returns {Promise<string>}
     */
    async getType(field) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return field.type;
        }

        return field_type.getType();
    }

    /**
     * @param {Field} field
     * @returns {Promise<string>}
     */
    async getTypeLabel(field) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return field.type;
        }

        return field_type.getTypeLabel();
    }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<*>}
     */
    async getValueAsFormat(field, value = null) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return value;
        }

        return field_type.getValueAsFormat(
            field,
            value
        );
    }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<string>}
     */
    async getValueAsText(field, value = null) {
        const field_type = await this.getFieldType(
            field.type
        );

        return this.#flux_format.formatValue(
            field_type !== null ? await field_type.getValueAsText(
                field,
                value
            ) : value,
            FORMAT_TYPE_TEXT
        );
    }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<Input | null>}
     */
    async getValueInput(field, value = null) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return null;
        }

        return field_type.getValueInput(
            field,
            value
        );
    }

    /**
     * @param {{[key: string]: *}} field
     * @returns {Promise<{[key: string]: *} | null>}
     */
    async mapGetField(field) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return null;
        }

        return field_type.mapGetField(
            field
        );
    }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<*>}
     */
    async mapGetValue(field, value = null) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return value;
        }

        return field_type.mapGetValue(
            field,
            value
        );
    }

    /**
     * @param {Field} field
     * @returns {Promise<{[key: string]: *} | null>}
     */
    async mapStoreField(field) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return null;
        }

        return field_type.mapStoreField(
            field
        );
    }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<*>}
     */
    async mapStoreValue(field, value = null) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return value;
        }

        return field_type.mapStoreValue(
            field,
            value
        );
    }

    /**
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async validateField(field) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return false;
        }

        return field_type.validateField(
            field
        );
    }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<boolean>}
     */
    async validateValue(field, value = null) {
        if (field.required && value === null) {
            return false;
        }

        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return false;
        }

        return field_type.validateValue(
            field,
            value
        );
    }
}
