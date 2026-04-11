export type FieldComponent =
  | "BaseInput"
  | "BaseTextArea"
  | "BaseDate"
  | "BaseFileUpload"
  | "BaseTagInput"
  | "BaseSelect"
  | "BaseMultiSelect";

export interface FormField {
  component: FieldComponent; // which base component
  name: string; // used as key in form object
  props?: Record<string, any>; // to pass props to the base component
}
