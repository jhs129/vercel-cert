import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import SearchInput from "./index";

const meta: Meta<typeof SearchInput> = {
  title: "UI/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: fn(),
    onSearch: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const WithInitialValue: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("Next.js");
    return (
      <div className="w-96">
        <SearchInput {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};
