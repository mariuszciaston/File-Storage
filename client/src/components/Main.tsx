export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-blue-100">
      <div className="mx-auto grid h-full w-full max-w-7xl content-start py-8 sm:p-8">
        {children}
      </div>
    </main>
  );
}
