interface DismissButtonProps {
  onClick: () => void;
}

export function DismissButton({ onClick }: DismissButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Dismiss alert"
      className="ml-auto shrink-0 text-white/60 hover:text-white transition-colors cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M12 4L4 12M4 4l8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
