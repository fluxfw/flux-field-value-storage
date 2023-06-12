import { FIELD_NAME_PATTERN } from "./FIELD_NAME.mjs";
import { VALUE_NAME_PATTERN } from "../Value/VALUE_NAME.mjs";
import { FIELD_POSITION_MOVE, FIELD_POSITION_START, FIELD_POSITION_VALUE } from "./FIELD_POSITION.mjs";
import { INPUT_TYPE_CHECKBOX, INPUT_TYPE_HIDDEN, INPUT_TYPE_SELECT, INPUT_TYPE_TEXT } from "../../../flux-form/src/INPUT_TYPE.mjs";

/** @typedef {import("mongodb").Collection} Collection */
/** @typedef {import("./Field.mjs").Field} Field */
/** @typedef {import("./FieldTable.mjs").FieldTable} FieldTable */
/** @typedef {import("../FieldType/FieldTypeService.mjs").FieldTypeService} FieldTypeService */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */
/** @typedef {import("../Value/Value.mjs").Value} Value */
/** @typedef {import("../Value/ValueAsFormat.mjs").ValueAsFormat} ValueAsFormat */
/** @typedef {import("../Value/ValueAsText.mjs").ValueAsText} ValueAsText */
/** @typedef {import("../Value/ValueTable.mjs").ValueTable} ValueTable */

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
     * @returns {Promise<boolean>}
     */
    async deleteField(name) {
        if (typeof name !== "string" || !FIELD_NAME_PATTERN.test(name)) {
            return false;
        }

        await this.#collection.deleteMany({
            name
        });

        await this.#repositionFields();

        return true;
    }

    /**
     * @param {string} name
     * @param {boolean | null} field_type_map
     * @returns {Promise<Field | null>}
     */
    async getField(name, field_type_map = null) {
        if (typeof name !== "string" || !FIELD_NAME_PATTERN.test(name)) {
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

        if (name !== null && (typeof name !== "string" || !FIELD_NAME_PATTERN.test(name))) {
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
                pattern: FIELD_NAME_PATTERN.source,
                required: true,
                subtitle: "Only letters, digits, dashes, underscores or dots",
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
     * @returns {Promise<FieldTable>}
     */
    async getFieldTable() {
        const rows = [];

        for (const field of await this.getFields()) {
            const additional = await this.#field_type_service.getFieldTableAdditionalColumn(
                field
            );

            rows.push({
                type: await this.#field_type_service.getTypeLabel(
                    field
                ),
                name: field.name,
                label: field.label,
                ...additional !== null ? {
                    additional: additional.map(([
                        key,
                        value
                    ]) => `${key}: ${value}`).join("\n")
                } : null
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
                    key: "additional",
                    label: "Additional "
                }
            ],
            rows
        };
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getFieldTypeInputs() {
        const options = [];

        for (const [
            label,
            field_type
        ] of (await Promise.all((await this.#field_type_service.getFieldTypes()).map(async _field_type => [
            await _field_type.getTypeLabel(),
            _field_type
        ]))).sort(([
            label_1
        ], [
            label_2
        ]) => (label_1 > label_2 ? 1 : label_1 < label_2 ? -1 : 0))) {
            options.push({
                label,
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
     * @returns {Promise<ValueAsFormat[]>}
     */
    async getValueAsFormat(value) {
        const values = [];

        for (const field of await this.getFields()) {
            values.push({
                name: field.name,
                label: field.label,
                type: await this.#field_type_service.getFormatValueType(
                    field
                ),
                value: await this.#field_type_service.getValueAsFormat(
                    field,
                    value.values.find(field_value => field_value.name === field.name)?.value ?? null
                )
            });
        }

        return values;
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
     * @returns {Promise<Input[]>}
     */
    async getValueFilterInputs() {
        const inputs = [
            {
                label: "Name",
                name: "name",
                pattern: VALUE_NAME_PATTERN.source,
                subtitle: "Only letters, digits, dashes, underscores or dots",
                type: INPUT_TYPE_TEXT
            },
            {
                label: "Has value",
                name: "has-value",
                options: [
                    {
                        label: "No",
                        value: "false"
                    },
                    {
                        label: "Yes",
                        value: "true"
                    }
                ],
                type: INPUT_TYPE_SELECT
            }
        ];

        for (const field of await this.getFields()) {
            inputs.push({
                label: field.label,
                name: `field-${field.name}`,
                subtitle: field.subtitle,
                ...await this.#field_type_service.getValueFilterInput(
                    field
                )
            });
        }

        return inputs;
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
     * @returns {Promise<ValueTable>}
     */
    async getValueTable(values) {
        const fields = await this.getFields();

        const columns = [
            {
                key: "name",
                label: "Name"
            }
        ];

        for (const field of fields) {
            columns.push({
                key: `field-${field.name}`,
                label: field.label,
                type: await this.#field_type_service.getFormatValueType(
                    field
                )
            });
        }

        const rows = [];

        for (const value of values) {
            const row = {
                name: value.name,
                "has-value": true
            };

            for (const field of fields) {
                row[`field-${field.name}`] = await this.#field_type_service.getValueAsFormat(
                    field,
                    value.values.find(field_value => field_value.name === field.name)?.value ?? null
                );
            }

            rows.push(row);
        }

        return {
            "show-add-new": true,
            columns,
            rows
        };
    }

    /**
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    async moveFieldDown(name) {
        if (typeof name !== "string" || !FIELD_NAME_PATTERN.test(name)) {
            return false;
        }

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
                position: field.position + FIELD_POSITION_VALUE + FIELD_POSITION_MOVE
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
        if (typeof name !== "string" || !FIELD_NAME_PATTERN.test(name)) {
            return false;
        }

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
                position: field.position - FIELD_POSITION_VALUE - FIELD_POSITION_MOVE
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
        if (!Array.isArray(names) || names.length === 0 || names.some(name => typeof name !== "string" || !FIELD_NAME_PATTERN.test(name))) {
            return false;
        }

        const fields = await this.getFields(
            false
        );

        if (names.length !== fields.length || names.some(name => !fields.some(field => field.name === name))) {
            return false;
        }

        let position = FIELD_POSITION_START;

        for (const name of names) {
            const field = fields.find(_field => _field.name === name);

            position += FIELD_POSITION_VALUE;

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
     * @param {string} name
     * @param {Field} field
     * @returns {Promise<boolean>}
     */
    async storeField(name, field) {
        if (typeof name !== "string" || !FIELD_NAME_PATTERN.test(name)) {
            return false;
        }

        if (field === null || typeof field !== "object") {
            return false;
        }

        if (typeof field.type !== "string" || field.type === "") {
            return false;
        }

        if (typeof field.name !== "string" || !FIELD_NAME_PATTERN.test(field.name)) {
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

        if (name !== field.name && await this.getField(
            field.name,
            false
        ) !== null) {
            return false;
        }

        const previous_field = await this.getField(
            name,
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
        }).limit(1).toArray())[0]?.position ?? FIELD_POSITION_START) + FIELD_POSITION_VALUE;
    }

    /**
     * @returns {Promise<void>}
     */
    async #repositionFields() {
        let position = FIELD_POSITION_START;

        for (const field of await this.getFields(
            false
        )) {
            position += FIELD_POSITION_VALUE;

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
