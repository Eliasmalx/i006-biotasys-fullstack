import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../services/api";
import "./DashboardNutritionist.css";

type OrderStatus = "SOLICITADO" | "RECIBIDO" | "EN_ANALISIS" | "INFORME_LISTO" | "RECHAZADO";

interface StudyRow {
  id: string;
  patientCode: string;
  studyCode: string;
  createdAt: string;
  studyDate: string;
  status: OrderStatus;
  nutritionist?: {
    id: string;
    fullName: string;
    email: string;
    role: string | null;
  } | null;
}

interface OrdersResponse {
  data: StudyRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  SOLICITADO: "Solicitado",
  RECIBIDO: "Recibido",
  EN_ANALISIS: "En análisis",
  INFORME_LISTO: "Informe listo",
  RECHAZADO: "Rechazado",
};

const PAGE_SIZE = 10;

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="7" r="5.5" />
    <path d="M11 11l3.5 3.5" />
  </svg>
);

const ChevronDown = () => (
  <svg className="dn-filter-btn__chevron" viewBox="0 0 12 12" fill="currentColor">
    <path d="M2.5 4.5l3.5 3 3.5-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="dn-filter-btn__icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="1" y="2" width="12" height="11" rx="2" />
    <path d="M1 5.5h12" />
    <path d="M4.5 0.5v2.5M9.5 0.5v2.5" />
  </svg>
);

const ResetIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M11.5 2.5a6 6 0 11-8.5.6" />
    <path d="M11.5 2.5V5.5H8.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="currentColor">
    <path fillRule="evenodd" d="M10.28 2.72a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 01-1.06 0L1.72 6.78a.75.75 0 011.06-1.06L5 7.94l4.72-4.72a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 12 12" fill="currentColor">
    <path d="M3.17 3.17a.5.5 0 01.7 0L6 5.29l2.13-2.12a.5.5 0 01.7.7L6.71 6l2.12 2.13a.5.5 0 01-.7.7L6 6.71 3.87 8.83a.5.5 0 01-.7-.7L5.29 6 3.17 3.87a.5.5 0 010-.7z" />
  </svg>
);

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  icon,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = selected.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={`dn-filter-btn ${isActive ? "dn-filter-btn--active" : ""}`}
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
        {label}
        {isActive && ` (${selected.length})`}
        <ChevronDown />
      </button>

      {open && (
        <>
          <div className="dn-overlay" onClick={() => setOpen(false)} />
          <div className="dn-dropdown">
            {options.map((opt) => {
              const isChecked = selected.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  className="dn-dropdown__item"
                  onClick={() => onToggle(opt.value)}
                >
                  <span className={`dn-dropdown__check ${isChecked ? "dn-dropdown__check--active" : ""}`}>
                    {isChecked && <CheckIcon />}
                  </span>
                  {opt.label}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export const DashboardLaboratory = () => {
  const [orders, setOrders] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [date, setDate] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.listLaboratoryOrders({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        estado: statusFilter.length === 1 ? statusFilter[0] : undefined,
        date: date || undefined,
      })) as OrdersResponse;

      setOrders(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, date]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleStatus = (value: string) => {
    setStatusFilter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setDate("");
    setPage(1);
  };

  const chips = statusFilter.map((status) => ({
    label: STATUS_LABELS[status as OrderStatus] || status,
    onRemove: () => toggleStatus(status),
  }));

  const hasActiveFilters = statusFilter.length > 0 || Boolean(date);

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      setPage(1);
      loadOrders();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const paginationRange = useMemo(() => {
    const range: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let index = 1; index <= totalPages; index += 1) {
        range.push(index);
      }
      return range;
    }

    range.push(1);
    if (page > 3) range.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let index = start; index <= end; index += 1) {
      range.push(index);
    }

    if (page < totalPages - 2) range.push("...");
    range.push(totalPages);

    return range;
  }, [page, totalPages]);

  return (
    <div className="dn-page">
      <div className="dn-header">
        <div>
          <h1 className="dn-header__title">Panel de órdenes</h1>
          <p className="dn-header__subtitle">
            Gestión de estudios de microbiota para integración clínica
          </p>
        </div>
      </div>

      <div className="dn-filters">
        <div className="dn-filters__bar">
          <div className="dn-filters__search">
            <span className="dn-filters__search-icon"><SearchIcon /></span>
            <input
              className="dn-filters__search-input"
              type="text"
              placeholder="Por paciente (PCT-...) o código de estudio (BIO-...)"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div className="dn-filters__dropdowns">
            <FilterDropdown
              label="Estado"
              options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              selected={statusFilter}
              onToggle={toggleStatus}
            />
            <label className="dn-filter-btn" style={{ gap: 8 }}>
              <CalendarIcon />
              <input
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setPage(1);
                }}
                style={{ border: "none", background: "transparent", color: "inherit", font: "inherit", outline: "none", minWidth: 110 }}
              />
            </label>
          </div>
        </div>
      </div>

      {(chips.length > 0 || hasActiveFilters) && (
        <div className="dn-chips">
          {chips.map((chip, index) => (
            <span key={`${chip.label}-${index}`} className="dn-chip">
              {chip.label}
              <span className="dn-chip__remove" onClick={chip.onRemove}>
                <CloseIcon />
              </span>
            </span>
          ))}
          {hasActiveFilters && (
            <button type="button" className="dn-chips__reset" onClick={resetFilters}>
              <ResetIcon />
              Restablecer filtros
            </button>
          )}
        </div>
      )}

      <div className="dn-table-wrap">
        <div className="dn-table-container">
          <table className="dn-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Estudio</th>
                <th>Nutricionista</th>
                <th>Solicitud</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="dn-loading">Cargando órdenes...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="dn-empty">
                      <p className="dn-empty__title">No hay órdenes disponibles</p>
                      <p className="dn-empty__text">Ajusta los filtros para revisar estudios asignados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((row) => (
                  <tr key={row.id}>
                    <td>{row.patientCode}</td>
                    <td>
                      <span className="dn-table__study-code">{row.studyCode}</span>
                    </td>
                    <td>
                      <span className="dn-table__lab-name">{row.nutritionist?.fullName || "-"}</span>
                    </td>
                    <td>{formatDate(row.studyDate || row.createdAt)}</td>
                    <td>
                      <span className={`dn-status dn-status--${row.status.toLowerCase()}`}>
                        <span className="dn-status__dot" />
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td>
                      {["SOLICITADO", "RECIBIDO"].includes(row.status) ? (
                        <button type="button" className="dn-action-link">
                          Cargar archivo
                        </button>
                      ) : (
                        <span className="dn-badge--none">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="dn-pagination">
          <button
            type="button"
            className="dn-pagination__btn dn-pagination__edge"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            «
          </button>
          <button
            type="button"
            className="dn-pagination__btn"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            ‹
          </button>

          {paginationRange.map((item, index) =>
            item === "..." ? (
              <span key={`ellipsis-${index}`} className="dn-pagination__ellipsis">…</span>
            ) : (
              <button
                type="button"
                key={item}
                className={`dn-pagination__btn ${page === item ? "dn-pagination__btn--active" : ""}`}
                onClick={() => setPage(item as number)}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className="dn-pagination__btn"
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            ›
          </button>
          <button
            type="button"
            className="dn-pagination__btn dn-pagination__edge"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            {totalPages} »
          </button>
        </div>
      )}
    </div>
  );
};