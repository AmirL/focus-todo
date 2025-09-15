export function ErrorState({ title, error }: { title: string; error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  return (
    <div className="flex justify-center items-center h-20 text-red-500">
      <div className="text-center">
        <p className="font-semibold">{title}</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

