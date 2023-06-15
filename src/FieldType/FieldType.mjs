/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */

/**
 * @interface
 */
export class FieldType {
    /**
     * @param {Field | null} field
     * @returns {Promise<Input[] | null>}
     * @abstract
     */
    getFieldInputs(field) { }

    /**
     * @param {Field} field
     * @returns {Promise<[string, string][] | null>}
     * @abstract
     */
    getFieldTableAdditionalColumn(field) { }

    /**
     * @param {Field} field
     * @returns {Promise<string | null>}
     * @abstract
     */
    getFormatValueType(field) { }

    /**
     * @returns {Promise<string>}
     * @abstract
     */
    getType() { }

    /**
     * @returns {Promise<string>}
     * @abstract
     */
    getTypeLabel() { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<*>}
     * @abstract
     */
    getValueAsFormat(field, value) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<*>}
     * @abstract
     */
    getValueAsText(field, value) { }

    /**
     * @param {Field} field
     * @returns {Promise<Input[] | null>}
     * @abstract
     */
    getValueFilterInputs(field) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<Input | null>}
     * @abstract
     */
    getValueInput(field, value) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @param {string | null} attribute
     * @returns {Promise<*>}
     * @abstract
     */
    mapFilterValue(field, value, attribute) { }

    /**
     * @param {{[key: string]: *}} field
     * @returns {Promise<{[key: string]: *} | null>}
     * @abstract
     */
    mapGetField(field) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<*>}
     * @abstract
     */
    mapGetValue(field, value) { }

    /**
     * @param {Field} field
     * @returns {Promise<{[key: string]: *} | null>}
     * @abstract
     */
    mapStoreField(field) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<*>}
     * @abstract
     */
    mapStoreValue(field, value) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @param {*} filter_value
     * @param {string | null} attribute
     * @returns {Promise<boolean>}
     * @abstract
     */
    matchFilterValue(field, value, filter_value, attribute) { }

    /**
     * @param {Field} field
     * @returns {Promise<boolean>}
     * @abstract
     */
    validateField(field) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @param {string | null} attribute
     * @returns {Promise<boolean>}
     * @abstract
     */
    validateFilterValue(field, value, attribute) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<boolean>}
     * @abstract
     */
    validateValue(field, value) { }
}
