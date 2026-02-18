interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Sin datos",
  description = "No hay información disponible",
  action,
}) => {
  return (
    <div className="text-center py-10 flex flex-col items-center gap-2">
      <h3 className="text-lg font-medium text-slate-300">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};
