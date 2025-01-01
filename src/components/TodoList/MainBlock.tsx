export function MainBlock({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="my-4">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <div className=" border px-4 pb-0 rounded-md">
        <div className="my-4 flex flex-wrap items-center justify-between gap-4">{children}</div>
      </div>
    </div>
  );
}
