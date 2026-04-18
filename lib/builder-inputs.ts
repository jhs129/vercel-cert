import { THEMES } from "./types";
import type { Theme } from "./types";

export const themeInput = {
  name: "theme",
  type: "string",
  enum: [...THEMES],
  defaultValue: "light" satisfies Theme,
  helperText: "Controls the color theme applied to this component.",
};

export const STYLABLE_BUILDER_INPUT = {
  name: "styles",
  type: "string",
  required: false,
  helperText:
    "Optional Tailwind CSS utility classes to append to this component's top-level element. Classes listed here are applied last, giving them the highest specificity.",
};
