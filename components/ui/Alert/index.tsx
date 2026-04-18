export type AlertVariant = "breaking" | "warning" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  label?: string;
  message: string;
}

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const variantStyles: Record<AlertVariant, { icon: React.ReactNode; badgeBorder: string; iconColor: string }> = {
  breaking: {
    icon: <WarningIcon />,
    iconColor: "text-white",
    badgeBorder: "border-white text-white",
  },
  warning: {
    icon: <WarningIcon />,
    iconColor: "text-yellow-400",
    badgeBorder: "border-yellow-400 text-yellow-400",
  },
  info: {
    icon: <InfoIcon />,
    iconColor: "text-blue-400",
    badgeBorder: "border-blue-400 text-blue-400",
  },
};

export function Alert({ variant = "breaking", label, message }: AlertProps) {
  const { icon, iconColor, badgeBorder } = variantStyles[variant];

  return (
    <div
      className="w-full bg-black text-white flex items-center gap-3 px-6 py-3"
      role="alert"
      aria-live="polite"
    >
      <span className={iconColor}>{icon}</span>
      {label && (
        <span
          className={`border font-bold text-xs uppercase tracking-wider px-2 py-0.5 shrink-0 ${badgeBorder}`}
        >
          {label}
        </span>
      )}
      <span className="text-sm">{message}</span>
    </div>
  );
}
