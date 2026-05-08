import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeaderClient } from "./HeaderClient";

const meta: Meta<typeof HeaderClient> = {
  title: "Navigation/Header",
  component: HeaderClient,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    subscriptionSlot: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof HeaderClient>;

const defaultLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
];

function SubscribeButton() {
  return (
    <button className="bg-accent text-background text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
      Subscribe
    </button>
  );
}

function SubscribedIndicator() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-accent">Subscribed</span>
      <button className="text-xs text-foreground underline hover:opacity-70 transition-opacity">
        Unsubscribe
      </button>
    </div>
  );
}

export const Default: Story = {
  args: {
    links: defaultLinks,
    subscriptionSlot: <SubscribeButton />,
  },
};

export const Subscribed: Story = {
  args: {
    links: defaultLinks,
    subscriptionSlot: <SubscribedIndicator />,
  },
};

export const CustomLinks: Story = {
  args: {
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    subscriptionSlot: <SubscribeButton />,
  },
};

export const MobileMenuOpen: Story = {
  args: {
    links: defaultLinks,
    subscriptionSlot: <SubscribeButton />,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    // @ts-expect-error @storybook/test is available at runtime in Storybook
    const { within, userEvent } = await import("@storybook/test");
    const canvas = within(canvasElement);
    const hamburger = canvas.getByRole("button", { name: /open navigation menu/i });
    await userEvent.click(hamburger);
  },
};
