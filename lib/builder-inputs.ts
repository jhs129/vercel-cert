import { THEMES } from "./types";
import type { Theme } from "./types";

export const themeInput = {
  name: "theme",
  type: "string",
  enum: [...THEMES],
  defaultValue: "light" satisfies Theme,
  helperText: "Controls the color theme applied to this component.",
};
