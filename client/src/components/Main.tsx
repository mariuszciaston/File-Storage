export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <div className="mx-auto grid h-full w-full max-w-7xl content-start bg-blue-100 p-4 sm:p-8">
        {children}
      </div>
    </main>
  );
}
