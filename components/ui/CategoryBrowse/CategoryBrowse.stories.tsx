import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CategoryBrowse from "./index";

const meta: Meta<typeof CategoryBrowse> = {
  title: "UI/CategoryBrowse",
  component: CategoryBrowse,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CategoryBrowse>;

export const Default: Story = {
  args: {
    title: "Browse Articles",
    theme: "light",
  },
};

export const DarkTheme: Story = {
  args: {
    title: "Browse Articles",
    theme: "dark",
  },
};

export const CustomTitle: Story = {
  args: {
    title: "All Resources",
    theme: "light",
  },
};

export const NoTitle: Story = {
  args: {
    theme: "light",
  },
};
