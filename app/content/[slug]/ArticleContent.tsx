"use client";

// Re-exported as a default so next/dynamic can import it with ssr: false,
// preventing Builder.io's inline <script> from being SSR'd and triggering
// React 19's script-in-component warning.
export { Content as default } from "@builder.io/sdk-react";
