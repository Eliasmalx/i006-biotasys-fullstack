export interface ReportStudy {
  id: string;
  patientCode: string;
  studyCode: string;
  studyDate: string;
  completedAt?: string | null;
  status: string;
  pdfUrl?: string | null;
  normalizedJson?: any;
}

export interface ReportMetricGauge {
  label: string;
  value: string;
  caption: string;
  percent: number;
}

export type ReportHeroStatus = "balanced" | "altered" | "inconclusive" | "chronic";

export interface ReportViewModel {
  header: {
    patientCode: string;
    studyCode: string;
    analysisDate: string;
  };
  summary: {
    status: ReportHeroStatus;
    title: string;
    description: string;
    tags: string[];
  };
  generalSummary: {
    title: string;
    description: string;
    tags: string[];
  };
  metrics: {
    fbRatio: string;
    shannon: string;
    riskScore: string;
    gauges: ReportMetricGauge[];
  };
  compositionRows: Array<{
    name: string;
    presence: string;
    implication: string;
  }>;
  diversityRows: Array<{
    headline: string;
    implication: string;
  }>;
  opportunists: Array<{
    name: string;
    implication: string;
  }>;
  metabolicFunctions: Array<{
    name: string;
    value: string;
    implication: string;
    percent: number;
  }>;
  pdfUrl: string | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return "No disponible";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("es-ES");
};

const formatMetric = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "No disponible";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return String(value);
};

const labelize = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const percentFromLabel = (value: string) => {
  const normalized = value.toLowerCase();

  if (normalized.includes("muy alta") || normalized.includes("óptimo") || normalized.includes("elevada")) return 88;
  if (normalized.includes("alta") || normalized.includes("normal")) return 76;
  if (normalized.includes("moderada") || normalized.includes("media")) return 60;
  if (normalized.includes("baja") || normalized.includes("detectable")) return 38;
  if (normalized.includes("no disponible") || normalized.includes("inconclus")) return 20;
  return 52;
};

const stripDiacritics = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const deriveHeroStatus = (
  globalIndicator: string,
  riskScore: number | null,
  tags: string[],
): ReportHeroStatus => {
  const normalizedText = stripDiacritics([globalIndicator, ...tags].join(" ").toLowerCase());

  if (
    normalizedText.includes("inconclus") ||
    normalizedText.includes("insuficiente") ||
    normalizedText.includes("no concluyente") ||
    normalizedText.includes("analisis limitado")
  ) {
    return "inconclusive";
  }

  if (
    normalizedText.includes("cronica") ||
    normalizedText.includes("cronico") ||
    normalizedText.includes("persistente")
  ) {
    return "chronic";
  }

  if (
    normalizedText.includes("optimo") ||
    normalizedText.includes("salud") ||
    normalizedText.includes("equilibr") ||
    normalizedText.includes("eubiosis")
  ) {
    return "balanced";
  }

  if (
    normalizedText.includes("alter") ||
    normalizedText.includes("disbios") ||
    normalizedText.includes("riesgo") ||
    normalizedText.includes("desequilibrio")
  ) {
    return "altered";
  }

  if (riskScore !== null) {
    if (riskScore <= 33) return "balanced";
    if (riskScore <= 66) return "altered";
    return "chronic";
  }

  return "inconclusive";
};

const statusLabelMap: Record<ReportHeroStatus, string> = {
  balanced: "Microbiota equilibrada",
  altered: "Microbiota alterada",
  inconclusive: "Microbiota inconclusa",
  chronic: "Microbiota crónica",
};

const normalizePresence = (abundance: number) => {
  if (abundance >= 10) return "Predominante";
  if (abundance >= 5) return "Relevante";
  if (abundance > 0) return "Detectable";
  return "No disponible";
};

const numberValue = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const mapStudyToReportView = (study: ReportStudy): ReportViewModel => {
  const normalized = study.normalizedJson ?? {};
  const interpretation = normalized.interpretation ?? {};
  const finalObservations = interpretation.final_observations ?? {};
  const generalSummary = interpretation.general_summary ?? {};
  const bacterialComposition = Array.isArray(interpretation.bacterial_composition)
    ? interpretation.bacterial_composition
    : [];
  const predominantGenera = Array.isArray(normalized.data?.taxonomy?.predominant_genera)
    ? normalized.data.taxonomy.predominant_genera
    : [];
  const inferredMetabolicFunctions = Array.isArray(interpretation.inferred_metabolic_functions)
    ? interpretation.inferred_metabolic_functions
    : [];
  const fallbackFunctionality = normalized.data?.functionality ?? {};
  const diversity = normalized.data?.diversity ?? {};

  const riskScore = numberValue(finalObservations.risk_score);
  const conclusionTags = Array.isArray(finalObservations.conclusion_tags) ? finalObservations.conclusion_tags : [];
  const summaryTags = Array.isArray(generalSummary.summary_tags) ? generalSummary.summary_tags : [];
  const heroStatus = deriveHeroStatus(finalObservations.global_indicator || "", riskScore, [...conclusionTags, ...summaryTags]);

  const compositionRows = predominantGenera.length
    ? predominantGenera.map((item: any) => ({
        name: item?.name || "No disponible",
        presence: normalizePresence(Number(item?.abundance ?? 0)),
        implication:
          bacterialComposition.find((entry: any) => (entry?.gender || entry?.name) === item?.name)?.clinical_implication ||
          "-",
      }))
    : bacterialComposition.map((item: any) => ({
        name: item?.gender || item?.name || "No disponible",
        presence: item?.presence || "No disponible",
        implication: item?.clinical_implication || "-",
      }));

  const metabolicFunctions = inferredMetabolicFunctions.length
    ? inferredMetabolicFunctions.map((item: any, index: number) => {
        const value = item?.level || item?.value || "No disponible";
        return {
          name: item?.function_headline || item?.function || `Función ${index + 1}`,
          value,
          implication: item?.clinical_implication || item?.description || "No disponible",
          percent: percentFromLabel(String(value)),
        };
      })
    : Object.entries(fallbackFunctionality)
        .filter(([key]) => key !== "functional_markers_list" && key !== "opportunistic_microorganisms")
        .map(([key, value]) => {
          const formatted = formatMetric(value);
          return {
            name: labelize(key),
            value: formatted,
            implication: "No disponible",
            percent: percentFromLabel(formatted),
          };
        });

  const fbRatio = formatMetric(generalSummary.firmicutes_bacteroidetes_ratio ?? normalized.data?.taxonomy?.firmicutes_bacteroidetes_ratio);
  const shannon = formatMetric(generalSummary.shannon_index ?? diversity.shannon_index);

  return {
    header: {
      patientCode: study.patientCode,
      studyCode: study.studyCode,
      analysisDate: formatDate(normalized.report_date || study.completedAt || study.studyDate),
    },
    summary: {
      status: heroStatus,
      title: statusLabelMap[heroStatus],
      description: generalSummary.summary || finalObservations.conclusions || "No disponible",
      tags: summaryTags.length ? summaryTags : conclusionTags,
    },
    generalSummary: {
      title: "Resumen general",
      description: finalObservations.conclusions || generalSummary.summary || "No disponible",
      tags: conclusionTags,
    },
    metrics: {
      fbRatio,
      shannon,
      riskScore: formatMetric(riskScore),
      gauges: [
        {
          label: "F/B Ratio",
          value: fbRatio,
          caption: generalSummary.firmicutes_bacteroidetes_range || "Rango normal adulto",
          percent: clamp(((numberValue(generalSummary.firmicutes_bacteroidetes_ratio) ?? 1) / 2.5) * 100),
        },
        {
          label: "Índice Shannon",
          value: shannon,
          caption: generalSummary.shannon_range || "Diversidad",
          percent: clamp(((numberValue(generalSummary.shannon_index) ?? 0) / 5) * 100),
        },
      ],
    },
    compositionRows,
    diversityRows: Array.isArray(interpretation.bacterial_diversity)
      ? interpretation.bacterial_diversity.map((item: any) => ({
          headline: item?.diversity_headline || "No disponible",
          implication: item?.clinical_implication || "No disponible",
        }))
      : [],
    opportunists: Array.isArray(interpretation.opportunistic_microorganisms) && interpretation.opportunistic_microorganisms.length
      ? interpretation.opportunistic_microorganisms.map((item: any) => ({
          name: item?.name || item?.gender || "No disponible",
          implication: item?.clinical_implication || item?.presence || "No disponible",
        }))
      : [
          {
            name: "Otros oportunistas relevantes",
            implication: "No detectado",
          },
          {
            name: "Patógenos de interés",
            implication: "No detectado",
          },
        ],
    metabolicFunctions,
    pdfUrl: study.pdfUrl ?? null,
  };
};
