interface Props {
  message: string;
}

export function LiveAnnouncer({ message }: Props) {
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}