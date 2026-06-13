export type DataTableSelectFilterField = {
  columnId: string;
  label: string;
  type: "select";
  options: { value: string; label: string }[];
  allLabel?: string;
};

export type DataTableTextFilterField = {
  columnId: string;
  label: string;
  type: "text";
  placeholder?: string;
};

export type DataTableFilterField =
  | DataTableSelectFilterField
  | DataTableTextFilterField;
