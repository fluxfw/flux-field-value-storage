/** @typedef {import("../Field/Field.mjs").Field} Field */
/** @typedef {import("../../../flux-overlay/src/Input.mjs").Input} Input */

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
    getFieldTableOtherColumn(field) { }

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
     * @returns {Promise<string>}
     * @abstract
     */
    getValueAsText(field, value) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<Input | null>}
     * @abstract
     */
    getValueInput(field, value) { }

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
     * @returns {Promise<boolean>}
     * @abstract
     */
    validateField(field) { }

    /**
     * @param {Field} field
     * @param {*} value
     * @returns {Promise<boolean>}
     * @abstract
     */
    validateValue(field, value) { }
}
