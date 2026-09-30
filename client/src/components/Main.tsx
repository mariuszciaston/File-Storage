export default function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col px-4 sm:px-8 sm:pt-4">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        {children}
      </div>
    </main>
  );
}
