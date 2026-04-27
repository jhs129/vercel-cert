import type { RegisteredComponent } from "@builder.io/sdk-react";
import { themeInput } from "@/lib/builder-inputs";
import CategoryBrowse from ".";

export const CategoryBrowseRegistration: RegisteredComponent = {
  component: CategoryBrowse,
  name: "CategoryBrowse",
  inputs: [
    {
      name: "title",
      type: "string",
      defaultValue: "Browse Articles",
      helperText: "Heading displayed above the category navigation bar.",
    },
    {
      name: "categories",
      type: "list",
      defaultValue: [{ label: "All", value: "all" }],
      subFields: [
        {
          name: "label",
          type: "string",
          defaultValue: "All",
          helperText: "The label to display for the category.",
        },
        {
          name: "value",
          type: "string",
          defaultValue: "all",
          helperText: "The category slug to filter by. Must match the category value in the article data.",
        },
      ],
    },
    themeInput
  ],
};
