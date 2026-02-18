export const PageLayout: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="p-6 w-full">
      {title && (
        <h1 className="text-2xl font-semibold text-slate-200 mb-4">{title}</h1>
      )}
      {children}
    </div>
  );
};
