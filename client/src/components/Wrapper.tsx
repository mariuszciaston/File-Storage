export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh)] flex-col" id="wrapper">
      {children}
    </div>
  );
}
