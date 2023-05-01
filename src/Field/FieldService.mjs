import { INPUT_TYPE_CHECKBOX, INPUT_TYPE_HIDDEN, INPUT_TYPE_SELECT, INPUT_TYPE_TEXT } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("mongodb").Collection} Collection */
/** @typedef {import("./Field.mjs").Field} Field */
/** @typedef {import("../FieldType/FieldTypeService.mjs").FieldTypeService} FieldTypeService */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */
/** @typedef {import("../Value/Value.mjs").Value} Value */
/** @typedef {import("../Value/ValueAsText.mjs").ValueAsText} ValueAsText */

const NAME_PATTERN = /^[\w\-.]+$/;

const POSITION_START = 0;

const POSITION_VALUE = 10;

const POSITION_MOVE = POSITION_VALUE / 2;

export class FieldService {
    /**
     * @type {Collection}
     */
    #collection;
    /**
     * @type {FieldTypeService}
     */
    #field_type_service;

    /**
     * @param {Collection} collection
     * @param {FieldTypeService} field_type_service
     * @returns {FieldService}
     */
    static new(collection, field_type_service) {
        return new this(
            collection,
            field_type_service
        );
    }

    /**
     * @param {Collection} collection
     * @param {FieldTypeService} field_type_service
     * @private
     */
    constructor(collection, field_type_service) {
        this.#collection = collection;
        this.#field_type_service = field_type_service;
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async deleteField(name) {
        if (typeof name !== "string" || !NAME_PATTERN.test(name)) {
            return;
        }

        await this.#collection.deleteMany({
            name
        });

        await this.#repositionFields();
    }

    /**
     * @param {string} name
     * @param {boolean | null} field_type_map
     * @returns {Promise<Field | null>}
     */
    async getField(name, field_type_map = null) {
        if (typeof name !== "string" || !NAME_PATTERN.test(name)) {
            return null;
        }

        const field = await this.#collection.findOne({
            name
        });

        if (field === null) {
            return null;
        }

        return {
            id: field._id,
            position: field.position,
            type: field.type,
            name: field.name,
            label: field.label,
            subtitle: field.subtitle,
            required: field.required,
            ...field_type_map ?? true ? await this.#field_type_service.mapGetField(
                field
            ) : null
        };
    }

    /**
     * @param {string | null} type
     * @param {string | null} name
     * @returns {Promise<Input[] | null>}
     */
    async getFieldInputs(type = null, name = null) {
        if (type !== null && (typeof type !== "string" || type === "")) {
            return null;
        }

        if (name !== null && (typeof name !== "string" || !NAME_PATTERN.test(name))) {
            return null;
        }

        if (type !== null && name !== null) {
            return null;
        }

        if (type === null && name === null) {
            return null;
        }

        let field = null;

        if (name !== null) {
            field = await this.getField(
                name
            );

            if (field === null) {
                return null;
            }
        }

        const field_type = await this.#field_type_service.getFieldType(
            field?.type ?? type
        );

        if (field_type === null) {
            return null;
        }

        const _type = await field_type.getType();

        return [
            {
                name: "type",
                required: true,
                type: INPUT_TYPE_HIDDEN,
                value: _type
            },
            {
                label: "Type",
                "read-only": true,
                type: INPUT_TYPE_TEXT,
                value: await field_type.getTypeLabel()
            },
            {
                label: "Name",
                name: "name",
                pattern: NAME_PATTERN.source,
                ...field !== null ? {
                    "read-only": true
                } : {
                    required: true,
                    subtitle: "Only letters, digits, dashes, underscores or dots. Can not be changed anymore"
                },
                type: INPUT_TYPE_TEXT,
                value: field?.name ?? ""
            },
            {
                label: "Label",
                name: "label",
                required: true,
                type: INPUT_TYPE_TEXT,
                value: field?.label ?? ""
            },
            {
                label: "Subtitle",
                name: "subtitle",
                type: INPUT_TYPE_TEXT,
                value: field?.subtitle ?? ""
            },
            {
                label: "Required",
                name: "required",
                type: INPUT_TYPE_CHECKBOX,
                value: field?.required ?? false
            },
            ...await field_type.getFieldInputs(
                field
            ) ?? []
        ];
    }

    /**
     * @param {boolean | null} field_type_map
     * @returns {Promise<Field[]>}
     */
    async getFields(field_type_map = null) {
        const _field_type_map = field_type_map ?? true;

        const fields = [];

        for (const field of await this.#collection.find().sort({
            position: 1
        }).toArray()) {
            fields.push({
                id: field._id,
                position: field.position,
                type: field.type,
                name: field.name,
                label: field.label,
                subtitle: field.subtitle,
                required: field.required,
                ..._field_type_map ? await this.#field_type_service.mapGetField(
                    field
                ) : null
            });
        }

        return fields;
    }

    /**
     * @returns {Promise<{columns: {[key: string]: string}[], rows: {[key: string]: string}[]}>}
     */
    async getFieldTable() {
        const rows = [];

        for (const field of await this.getFields()) {
            const other = await this.#field_type_service.getFieldTableOtherColumn(
                field
            );

            rows.push({
                type: await this.#field_type_service.getTypeLabel(
                    field
                ),
                name: field.name,
                label: field.label,
                other: other !== null ? other.map(([
                    key,
                    value
                ]) => `${key}: ${value}`).join("\n") : "-"
            });
        }

        return {
            columns: [
                {
                    key: "type",
                    label: "Type"
                },
                {
                    key: "name",
                    label: "Name"
                },
                {
                    key: "label",
                    label: "Label"
                },
                {
                    key: "other",
                    label: "Other "
                }
            ],
            rows
        };
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getFieldTypeInputs() {
        const options = [
            {
                label: "-",
                value: ""
            }
        ];

        for (const field_type of await this.#field_type_service.getFieldTypes()) {
            options.push({
                label: await field_type.getTypeLabel(),
                value: await field_type.getType()
            });
        }

        return [
            {
                label: "Type",
                name: "type",
                options,
                required: true,
                subtitle: "Can not be changed anymore",
                type: INPUT_TYPE_SELECT
            }
        ];
    }

    /**
     * @param {Value} value
     * @returns {Promise<ValueAsText[]>}
     */
    async getValueAsText(value) {
        const values = [];

        for (const field of await this.getFields()) {
            values.push({
                name: field.name,
                label: field.label,
                value: await this.#field_type_service.getValueAsText(
                    field,
                    value.values.find(field_value => field_value.name === field.name)?.value ?? null
                )
            });
        }

        return values;
    }

    /**
     * @param {{[key: string]: *} | null} values
     * @returns {Promise<Input[]>}
     */
    async getValueInputs(values = null) {
        const inputs = [];

        for (const field of await this.getFields()) {
            inputs.push({
                label: field.label,
                name: field.name,
                required: field.required,
                subtitle: field.subtitle,
                ...await this.#field_type_service.getValueInput(
                    field,
                    values?.[field.name] ?? null
                )
            });
        }

        return inputs;
    }

    /**
     * @param {Value[]} values
     * @returns {Promise<{columns: {[key: string]: string}[], rows: {[key: string]: string}[]}>}
     */
    async getValueTable(values) {
        const fields = await this.getFields();

        const rows = [];

        for (const value of values) {
            const row = {
                name: value.name,
                "has-value": true
            };

            for (const field of fields) {
                row[`field-${field.name}`] = await this.#field_type_service.getValueAsText(
                    field,
                    value.values.find(field_value => field_value.name === field.name)?.value ?? null
                );
            }

            rows.push(row);
        }

        return {
            "show-add-new": true,
            columns: [
                {
                    key: "name",
                    label: "Name"
                },
                ...fields.map(field => ({
                    key: `field-${field.name}`,
                    label: field.label
                }))
            ],
            rows
        };
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async moveFieldDown(name) {
        const field = await this.getField(
            name,
            false
        );

        if (field === null) {
            return false;
        }

        await this.#collection.updateOne({
            _id: field.id
        }, {
            $set: {
                position: field.position + POSITION_VALUE + POSITION_MOVE
            }
        });

        await this.#repositionFields();

        return true;
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async moveFieldUp(name) {
        const field = await this.getField(
            name,
            false
        );

        if (field === null) {
            return false;
        }

        await this.#collection.updateOne({
            _id: field.id
        }, {
            $set: {
                position: field.position - POSITION_VALUE - POSITION_MOVE
            }
        });

        await this.#repositionFields();

        return true;
    }

    /**
     * @param {string[]} names
     * @returns {Promise<boolean>}
     */
    async setFieldPositions(names) {
        if (!Array.isArray(names) || names.length === 0 || names.some(name => typeof name !== "string" || !NAME_PATTERN.test(name))) {
            return false;
        }

        const fields = await this.getFields(
            false
        );

        if (names.length !== fields.length || names.some(name => !fields.some(field => field.name === name))) {
            return false;
        }

        let position = POSITION_START;

        for (const name of names) {
            const field = fields.find(_field => _field.name === name);

            position += POSITION_VALUE;

            if (position === field.position) {
                continue;
            }

            await this.#collection.updateOne({
                _id: field.id
            }, {
                $set: {
                    position
                }
            });
        }

        return true;
    }

    /**
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async storeField(field) {
        if (field === null || typeof field !== "object") {
            return false;
        }

        if (typeof field.type !== "string" || field.type === "") {
            return false;
        }

        if (typeof field.name !== "string" || !NAME_PATTERN.test(field.name)) {
            return false;
        }

        if (typeof field.label !== "string" || field.label === "") {
            return false;
        }

        if (typeof field.subtitle !== "string") {
            return false;
        }

        if (typeof field.required !== "boolean") {
            return false;
        }

        const previous_field = await this.getField(
            field.name,
            false
        );

        if (previous_field !== null && previous_field.type !== field.type) {
            return false;
        }

        if (!await this.#field_type_service.validateField(
            field
        )) {
            return false;
        }

        await this.#collection.replaceOne({
            _id: previous_field?.id ?? crypto.randomUUID()
        }, {
            position: previous_field?.position ?? await this.#nextPosition(),
            type: field.type,
            name: field.name,
            label: field.label,
            subtitle: field.subtitle,
            required: field.required,
            ...await this.#field_type_service.mapStoreField(
                field
            )
        }, {
            upsert: true
        });

        return true;
    }

    /**
     * @returns {Promise<number>}
     */
    async #nextPosition() {
        return ((await this.#collection.find().sort({
            position: -1
        }).limit(1).toArray())[0]?.position ?? POSITION_START) + POSITION_VALUE;
    }

    /**
     * @returns {Promise<void>}
     */
    async #repositionFields() {
        let position = POSITION_START;

        for (const field of await this.getFields(
            false
        )) {
            position += POSITION_VALUE;

            if (position === field.position) {
                continue;
            }

            await this.#collection.updateOne({
                _id: field.id
            }, {
                $set: {
                    position
                }
            });
        }
    }
}
