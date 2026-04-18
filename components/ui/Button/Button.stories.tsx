import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Button from "./index";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
    theme: {
      control: "select",
      options: ["light", "dark"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    label: "Click me",
    variant: "primary",
    theme: "light",
  },
};

export const Primary: Story = {
  args: {
    label: "Primary Button",
    variant: "primary",
    theme: "light",
  },
};

export const Secondary: Story = {
  args: {
    label: "Secondary Button",
    variant: "secondary",
    theme: "light",
  },
};

export const WithHref: Story = {
  args: {
    label: "Go to Homepage",
    href: "/",
    variant: "primary",
    theme: "light",
  },
};

export const DarkTheme: Story = {
  args: {
    label: "Dark Theme Button",
    variant: "primary",
    theme: "dark",
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const DarkThemeSecondary: Story = {
  args: {
    label: "Dark Secondary",
    variant: "secondary",
    theme: "dark",
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const EmptyLabel: Story = {
  args: {
    label: undefined,
    variant: "primary",
    theme: "light",
  },
};

export const WithStyles: Story = {
  args: {
    label: "Custom Styles",
    variant: "primary",
    theme: "light",
    styles: "w-full",
  },
};
