interface PlaceholderPageProps {
  title: string;
}

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-gray-500">This page is not yet implemented.</p>
    </div>
  );
}

export default PlaceholderPage;
