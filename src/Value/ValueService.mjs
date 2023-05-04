import { INPUT_TYPE_TEXT } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("mongodb").Collection} Collection */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */
/** @typedef {import("./Value.mjs").Value} Value */

const NAME_PATTERN = /^[\w\-.]+$/;

export class ValueService {
    /**
     * @type {Collection}
     */
    #collection;

    /**
     * @param {Collection} collection
     * @returns {ValueService}
     */
    static new(collection) {
        return new this(
            collection
        );
    }

    /**
     * @param {Collection} collection
     * @private
     */
    constructor(collection) {
        this.#collection = collection;
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async deleteValue(name) {
        if (typeof name !== "string" || !NAME_PATTERN.test(name)) {
            return;
        }

        await this.#collection.deleteMany({
            name
        });
    }

    /**
     * @param {string} field_id
     * @returns {Promise<void>}
     */
    async deleteValueField(field_id) {
        if (typeof field_id !== "string" || field_id === "") {
            return;
        }

        await this.#collection.deleteMany({
            "field-id": field_id
        });
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getNewValueInputs() {
        return [
            {
                label: "Name",
                name: "name",
                pattern: NAME_PATTERN.source,
                required: true,
                subtitle: "Only letters, digits, dashes, underscores or dots. Can not be changed anymore",
                type: INPUT_TYPE_TEXT
            }
        ];
    }

    /**
     * @param {string} name
     * @returns {Promise<Value | null>}
     */
    async getValue(name) {
        if (typeof name !== "string" || !NAME_PATTERN.test(name)) {
            return null;
        }

        const field_values = await this.#collection.find({
            name
        }).sort({
            "field-id": 1
        }).toArray();

        if (field_values.length === 0) {
            return null;
        }

        return {
            id: field_values[0].id,
            name: field_values[0].name,
            values: field_values.map(field_value => ({
                _id: field_value._id,
                id: field_value["field-id"],
                value: field_value.value
            }))
        };
    }

    /**
     * @returns {Promise<Value[]>}
     */
    async getValues() {
        return Object.values((await this.#collection.find().sort({
            name: 1,
            "field-id": 1
        }).toArray()).reduce((values, field_value) => {
            values[field_value.id] ??= {
                id: field_value.id,
                name: field_value.name,
                values: []
            };

            values[field_value.id].values.push({
                _id: field_value._id,
                id: field_value["field-id"],
                value: field_value.value
            });

            return values;
        }, {}));
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getValueTableFilterInputs() {
        return [
            {
                label: "Name",
                name: "name",
                pattern: NAME_PATTERN.source,
                type: INPUT_TYPE_TEXT
            }
        ];
    }

    /**
     * @param {Value} value
     * @returns {Promise<boolean>}
     */
    async storeValue(value) {
        if (value === null || typeof value !== "object") {
            return false;
        }

        if (typeof value.name !== "string" || !NAME_PATTERN.test(value.name)) {
            return false;
        }

        if (!Array.isArray(value.values) || value.values.length === 0 || value.values.some(field_value => field_value === null || typeof field_value !== "object" || typeof field_value.id !== "string" || field_value.id === "")) {
            return false;
        }

        const previous_value = await this.getValue(
            value.name
        );

        await this.deleteValue(
            value.name
        );

        const id = previous_value?.id ?? crypto.randomUUID();

        await this.#collection.insertMany(value.values.map(field_value => ({
            id,
            name: value.name,
            _id: previous_value?.values?.find(previous_field_value => previous_field_value.id === field_value.id)?._id ?? crypto.randomUUID(),
            "field-id": field_value.id,
            value: field_value.value ?? null
        })));

        return true;
    }
}
