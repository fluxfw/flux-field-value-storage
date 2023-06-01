import { DEFAULT_FIELD_TYPES } from "./DEFAULT_FIELD_TYPES.mjs";

/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("./FieldType.mjs").FieldType} FieldType */
/** @typedef {import("../../../flux-value-format/src/FluxValueFormat.mjs").FluxValueFormat} FluxValueFormat */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

export class FieldTypeService {
    /**
     * @type {Map<string, FieldType>}
     */
    #field_types;
    /**
     * @type {FluxValueFormat}
     */
    #flux_value_format;

    /**
     * @param {FluxValueFormat} flux_value_format
     * @returns {FieldTypeService}
     */
    static new(flux_value_format) {
        return new this(
            flux_value_format
        );
    }

    /**
     * @param {FluxValueFormat} flux_value_format
     * @private
     */
    constructor(flux_value_format) {
        this.#flux_value_format = flux_value_format;
        this.#field_types = new Map();

        for (const field_type of DEFAULT_FIELD_TYPES) {
            this.addFieldType(
                field_type
            ).catch(console.error);
        }
    }

    /**
     * @param {FieldType} field_type
     * @returns {Promise<void>}
     */
    async addFieldType(field_type) {
        const type = await field_type.getType();

        if (this.#field_types.has(type)) {
            throw new Error(`Field type ${type} already exists`);
        }

        this.#field_types.set(type, field_type);
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
        return this.#field_types.get(type) ?? null;
    }

    /**
     * @returns {Promise<FieldType[]>}
     */
    async getFieldTypes() {
        return Array.from(this.#field_types.values());
    }

    /**
     * @param {Field} field
     * @returns {Promise<string | null>}
     */
    async getFormatValueType(field) {
        const field_type = await this.getFieldType(
            field.type
        );

        if (field_type === null) {
            return null;
        }

        return field_type.getFormatValueType();
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

        return this.#flux_value_format.formatValue(
            field_type !== null ? await field_type.getValueAsText(
                field,
                value
            ) : value
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
