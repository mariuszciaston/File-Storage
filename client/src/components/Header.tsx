import { Link } from "react-router";

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 bg-amber-100 p-4 sm:gap-8 sm:p-8">
      <Link to="/">
        <div className="flex flex-wrap items-center gap-2" id="logo">
          <img
            alt="folder icon"
            className="h-8 w-auto"
            src="/android-chrome-192x192.png"
          />
          <span className="text-2xl font-bold whitespace-nowrap">
            File Storage
          </span>
        </div>
      </Link>
    </header>
  );
}
