import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "./DashboardNutritionist.css";

/* ---- Types ---- */
type StudyStatus = "SOLICITADO" | "RECIBIDO" | "EN_ANALISIS" | "INFORME_LISTO" | "RECHAZADO";

interface StudyRow {
  id: string;
  patientCode: string;
  studyCode: string;
  patientAge: number;
  patientSex: string;
  studyDate: string;
  createdAt: string;
  status: StudyStatus;
  processingState?: string;
  assignee?: { id: string; fullName: string; email: string };
  nutritionist?: { id: string; fullName: string; email: string };
}

interface PaginatedResponse {
  data: StudyRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ---- Constants ---- */
const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: "Solicitado",
  RECIBIDO: "Recibido",
  EN_ANALISIS: "En análisis",
  INFORME_LISTO: "Informe listo",
  RECHAZADO: "Rechazado",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS);

const RESULTADO_OPTIONS = [
  { value: "EQUILIBRADA", label: "Equilibrada" },
  { value: "ALTERADA", label: "Alterada" },
  { value: "INCONCLUSA", label: "Inconclusa" },
  { value: "CRITICA", label: "Crítica" },
];

const PAGE_SIZE = 10;

/* ---- SVG Icons ---- */
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

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 12L12 4M12 4H6M12 4v6" />
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

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

/* ---- Filter Dropdown Component ---- */
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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className={`dn-filter-btn ${isActive ? "dn-filter-btn--active" : ""}`}
        onClick={() => setOpen(!open)}
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

/* ---- Main Component ---- */
export const DashboardNutritionist = () => {
  const navigate = useNavigate();

  // Data
  const [studies, setStudies] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Lab options for filter
  const [labOptions, setLabOptions] = useState<{ value: string; label: string }[]>([]);
  const [labFilter, setLabFilter] = useState<string[]>([]);

  // Load lab options
  useEffect(() => {
    const loadLabs = async () => {
      try {
        const labs = await api.listLaboratoryOptions();
        const uniqueLabs = new Map<string, string>();
        labs.forEach((l) => {
          const key = l.laboratory.trim().toLowerCase();
          if (!uniqueLabs.has(key)) {
            uniqueLabs.set(key, l.laboratory.trim());
          }
        });
        setLabOptions(
          Array.from(uniqueLabs.entries()).map(([key, label]) => ({
            value: key,
            label,
          }))
        );
      } catch {
        // silently fail
      }
    };
    loadLabs();
  }, []);

  // Load studies
  const loadStudies = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: PAGE_SIZE,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter.length === 1) params.status = statusFilter[0];
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data: PaginatedResponse = await api.listNutritionistStudies(params);
      setStudies(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error cargando estudios:", err);
      setStudies([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  // Filter toggles
  const toggleStatus = (val: string) => {
    setStatusFilter((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    setPage(1);
  };

  const toggleLab = (val: string) => {
    setLabFilter((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setLabFilter([]);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasActiveFilters = statusFilter.length > 0 || labFilter.length > 0 || dateFrom || dateTo;

  // Client-side lab filter (since API doesn't support multi-lab filter)
  const filteredStudies = useMemo(() => {
    if (labFilter.length === 0) return studies;
    return studies.filter((s) => {
      if (!s.assignee) return false;
      // match against assignee's lab info in fullName or email
      return labFilter.some((lf) => {
        const assigneeName = (s.assignee?.fullName || "").toLowerCase();
        const assigneeEmail = (s.assignee?.email || "").toLowerCase();
        return assigneeName.includes(lf) || assigneeEmail.includes(lf);
      });
    });
  }, [studies, labFilter]);

  // Active chips
  const chips: { label: string; onRemove: () => void }[] = [];
  statusFilter.forEach((s) => {
    chips.push({
      label: STATUS_LABELS[s] || s,
      onRemove: () => toggleStatus(s),
    });
  });
  labFilter.forEach((l) => {
    const opt = labOptions.find((o) => o.value === l);
    chips.push({
      label: opt?.label || l,
      onRemove: () => toggleLab(l),
    });
  });

  // Search on Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPage(1);
      loadStudies();
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Sex abbreviation
  const formatSex = (sex: string) => {
    if (sex === "MASCULINO") return "M";
    if (sex === "FEMENINO") return "F";
    return sex;
  };

  // Pagination numbers
  const paginationRange = useMemo(() => {
    const range: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (page > 3) range.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) range.push(i);
      if (page < totalPages - 2) range.push("...");
      range.push(totalPages);
    }
    return range;
  }, [page, totalPages]);

  return (
    <div className="dn-page">
      {/* Header */}
      <div className="dn-header">
        <div>
          <h1 className="dn-header__title">Panel de estudios</h1>
          <p className="dn-header__subtitle">
            Gestión de estudios de microbiota y generación de informe con IA para apoyo en la decisión
          </p>
        </div>
        <button className="dn-header__btn" onClick={() => navigate("/studies/new")}>
          <PlusIcon />
          Nuevo estudio
        </button>
      </div>

      {/* Filters */}
      <div className="dn-filters">
        <div className="dn-filters__bar">
          <div className="dn-filters__search">
            <span className="dn-filters__search-icon"><SearchIcon /></span>
            <input
              className="dn-filters__search-input"
              type="text"
              placeholder="Por paciente (PCT-...) o código de estudio (BIO-...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div className="dn-filters__dropdowns">
            <FilterDropdown
              label="Resultado"
              options={RESULTADO_OPTIONS}
              selected={[]}
              onToggle={() => {}}
            />
            <FilterDropdown
              label="Laboratorio"
              options={labOptions}
              selected={labFilter}
              onToggle={toggleLab}
            />
            <FilterDropdown
              label="Estado"
              options={STATUS_OPTIONS.map(([value, label]) => ({ value, label }))}
              selected={statusFilter}
              onToggle={toggleStatus}
            />
            <div style={{ position: "relative" }}>
              <button className="dn-filter-btn">
                <CalendarIcon />
                Fecha
                <ChevronDown />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Chips */}
      {(chips.length > 0 || hasActiveFilters) && (
        <div className="dn-chips">
          {chips.map((chip, i) => (
            <span key={i} className="dn-chip">
              {chip.label}
              <span className="dn-chip__remove" onClick={chip.onRemove}>
                <CloseIcon />
              </span>
            </span>
          ))}
          {hasActiveFilters && (
            <button className="dn-chips__reset" onClick={resetFilters}>
              <ResetIcon />
              Restablecer filtros
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="dn-table-wrap">
        <div className="dn-table-container">
          <table className="dn-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Estudio</th>
                <th>Perfil</th>
                <th>Análisis</th>
                <th>Laboratorio</th>
                <th>Estado</th>
                <th>Resultado IA</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="dn-loading">Cargando estudios...</td>
                </tr>
              ) : filteredStudies.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="dn-empty">
                      <p className="dn-empty__title">No hay estudios disponibles</p>
                      <p className="dn-empty__text">Crea un nuevo estudio para comenzar</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudies.map((row) => (
                  <tr key={row.id}>
                    <td>{row.patientCode}</td>
                    <td>
                      <span className="dn-table__study-code">{row.studyCode}</span>
                    </td>
                    <td>{row.patientAge} años · {formatSex(row.patientSex)}</td>
                    <td>{formatDate(row.studyDate)}</td>
                    <td>
                      <span className="dn-table__lab-name">
                        {row.assignee?.fullName || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`dn-status dn-status--${row.status.toLowerCase()}`}>
                        <span className="dn-status__dot" />
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td>
                      {row.status === "INFORME_LISTO" ? (
                        <span className="dn-badge dn-badge--equilibrada">
                          equilibrada
                        </span>
                      ) : (
                        <span className="dn-badge--none">-</span>
                      )}
                    </td>
                    <td>
                      {row.status === "INFORME_LISTO" ? (
                        <button
                          className="dn-action-btn"
                          onClick={() => navigate(`/studies/${row.id}/report`)}
                          title="Ver informe"
                        >
                          <ArrowIcon />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="dn-pagination">
          <button
            className="dn-pagination__btn dn-pagination__edge"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            «
          </button>
          <button
            className="dn-pagination__btn"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>

          {paginationRange.map((item, i) =>
            item === "..." ? (
              <span key={`e-${i}`} className="dn-pagination__ellipsis">…</span>
            ) : (
              <button
                key={item}
                className={`dn-pagination__btn ${page === item ? "dn-pagination__btn--active" : ""}`}
                onClick={() => setPage(item as number)}
              >
                {item}
              </button>
            )
          )}

          <button
            className="dn-pagination__btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
          <button
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