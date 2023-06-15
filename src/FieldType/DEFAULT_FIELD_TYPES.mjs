import { BooleanFieldType } from "./BooleanFieldType.mjs";
import { ColorFieldType } from "./ColorFieldType.mjs";
import { DateFieldType } from "./DateFieldType.mjs";
import { DateTimeFieldType } from "./DateTimeFieldType.mjs";
import { EmailFieldType } from "./EmailFieldType.mjs";
import { MultilineTextFieldType } from "./MultilineTextFieldType.mjs";
import { MultipleSelectFieldType } from "./MultipleSelectFieldType.mjs";
import { NumberFieldType } from "./NumberFieldType.mjs";
import { PasswordFieldType } from "./PasswordFieldType.mjs";
import { RegularExpressionFieldType } from "./RegularExpressionFieldType.mjs";
import { SelectFieldType } from "./SelectFieldType.mjs";
import { TextFieldType } from "./TextFieldType.mjs";
import { TimeFieldType } from "./TimeFieldType.mjs";
import { UrlFieldType } from "./UrlFieldType.mjs";

/** @typedef {import("./FieldType.mjs").FieldType} FieldType */

/**
 * @type {FieldType[]}}
 */
export const DEFAULT_FIELD_TYPES = Object.freeze([
    BooleanFieldType.new(),
    ColorFieldType.new(),
    DateFieldType.new(),
    DateTimeFieldType.new(),
    EmailFieldType.new(),
    NumberFieldType.new(),
    MultilineTextFieldType.new(),
    MultipleSelectFieldType.new(),
    PasswordFieldType.new(),
    RegularExpressionFieldType.new(),
    SelectFieldType.new(),
    TextFieldType.new(),
    TimeFieldType.new(),
    UrlFieldType.new()
]);
