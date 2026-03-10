import { Link } from "react-router";

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 bg-amber-100 p-4 sm:gap-8 sm:p-8">
      <Link to="/">
        <div className="flex items-end gap-2" id="logo">
          <img
            alt="folder icon"
            src="./public/android-chrome-192x192.png"
            width="32px"
          />
          <span className="text-2xl font-bold">File Storage</span>
        </div>
      </Link>
    </header>
  );
}
