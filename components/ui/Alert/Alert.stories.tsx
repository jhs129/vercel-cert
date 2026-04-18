import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert } from "./index";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["breaking", "warning", "info"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Breaking: Story = {
  args: {
    variant: "breaking",
    label: "BREAKING",
    message: "Vercel CDN Now Collapses Over 3M Requests Per Day",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    label: "WARNING",
    message: "Scheduled maintenance window begins in 30 minutes.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    label: "INFO",
    message: "New feature deployment is complete and available for all users.",
  },
};

export const NoLabel: Story = {
  args: {
    variant: "breaking",
    message: "A critical system alert has been triggered — please review.",
  },
};

export const LongMessage: Story = {
  args: {
    variant: "warning",
    label: "WARNING",
    message:
      "An extended maintenance window is scheduled for this weekend starting Saturday at 11 PM UTC through Sunday 6 AM UTC, affecting all North American edge nodes.",
  },
};
