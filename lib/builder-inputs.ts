import { THEMES, ALIGNMENTS } from "./types";
import type { Theme } from "./types";

export const themeInput = {
  name: "theme",
  type: "string",
  enum: [...THEMES],
  defaultValue: "light" satisfies Theme,
  helperText: "Controls the color theme applied to this component.",
};

export const ALIGNABLE_BUILDER_INPUT = [
  {
    name: "alignment",
    type: "string",
    enum: [...ALIGNMENTS],
    helperText: "Controls the text alignment of inner content. Leave unset to use the component's default.",
  },
];
