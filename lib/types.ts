export interface NavLink {
  href: string;
  label: string;
}

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export interface Themeable {
  theme?: Theme;
}

export const ALIGNMENTS = ["left", "center", "right"] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

export interface Alignable {
  alignment?: Alignment;
}

export interface Stylable {
  styles?: string;
}
