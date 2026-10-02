export default function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-1 sm:px-8 sm:pt-4">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="grid flex-1 grid-cols-1 grid-rows-[auto_minmax(540px,1fr)] items-stretch gap-6 sm:grid-cols-[240px_minmax(0,1fr)] sm:grid-rows-1">
          {children}
        </div>
      </div>
    </main>
  );
}
