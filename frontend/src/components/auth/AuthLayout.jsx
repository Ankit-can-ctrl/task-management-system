import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold text-white shadow-lg">
            TM
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-300">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-slate-300">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthFooterLink({ text, linkText, to }) {
  return (
    <p>
      {text}{" "}
      <Link to={to} className="font-medium text-indigo-300 hover:text-indigo-200">
        {linkText}
      </Link>
    </p>
  );
}
