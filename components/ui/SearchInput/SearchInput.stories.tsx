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
    onSearch: fn(),
    value: "",
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

function ControlledSearchInput(props: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  return <SearchInput value={value} onChange={setValue} onSearch={props.onSearch} />;
}

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <ControlledSearchInput onSearch={args.onSearch} />
    </div>
  ),
};

export const WithInitialValue: Story = {
  render: (args) => {
    function WithValue() {
      const [value, setValue] = useState("Next.js");
      return <SearchInput value={value} onChange={setValue} onSearch={args.onSearch} />;
    }
    return (
      <div className="w-96">
        <WithValue />
      </div>
    );
  },
};
