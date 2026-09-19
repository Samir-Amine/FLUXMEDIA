"use client";
export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="ms-0.5 text-sky">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-[#ff8f8f]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls = "input";
