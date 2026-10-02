import { type ReactNode, useId } from "react";

export default function ModalDialog({
  children,
  footer,
  onClose,
  title,
}: {
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  title: string;
}) {
  const titleId = useId();

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-gray-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-110 rounded-3xl border border-gray-200 bg-white p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="mb-5 text-xl font-medium" id={titleId}>
          {title}
        </h2>
        {children}
        <div className="mt-6 flex justify-end gap-2">{footer}</div>
      </section>
    </div>
  );
}
