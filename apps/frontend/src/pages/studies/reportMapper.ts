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

export interface ReportViewModel {
  header: {
    patientCode: string;
    studyCode: string;
    analysisDate: string;
  };
  summary: {
    title: string;
    conclusions: string;
    tags: string[];
  };
  generalSummary: {
    summary: string;
    summaryTags: string[];
  };
  metrics: {
    fbRatio: string;
    shannon: string;
    riskScore: string;
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
  }>;
  pdfUrl: string | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return "No disponible";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

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

export const mapStudyToReportView = (study: ReportStudy): ReportViewModel => {
  const normalized = study.normalizedJson ?? {};
  const interpretation = normalized.interpretation ?? {};
  const finalObservations = interpretation.final_observations ?? {};
  const generalSummary = interpretation.general_summary ?? {};
  const inferredMetabolicFunctions = Array.isArray(interpretation.inferred_metabolic_functions)
    ? interpretation.inferred_metabolic_functions
    : [];
  const fallbackFunctionality = normalized.data?.functionality ?? {};

  const metabolicFunctions = inferredMetabolicFunctions.length
    ? inferredMetabolicFunctions.map((item: any, index: number) => ({
        name: item?.function_headline || item?.function || `Función ${index + 1}`,
        value: item?.level || item?.value || "No disponible",
        implication: item?.clinical_implication || item?.description || "No disponible",
      }))
    : Object.entries(fallbackFunctionality).map(([key, value]) => ({
        name: labelize(key),
        value: formatMetric(value),
        implication: "No disponible",
      }));

  return {
    header: {
      patientCode: study.patientCode,
      studyCode: study.studyCode,
      analysisDate: formatDate(normalized.report_date || study.completedAt || study.studyDate),
    },
    summary: {
      title: finalObservations.global_indicator || "Informe de microbiota intestinal",
      conclusions: finalObservations.conclusions || "No disponible",
      tags: Array.isArray(finalObservations.conclusion_tags) ? finalObservations.conclusion_tags : [],
    },
    generalSummary: {
      summary: generalSummary.summary || "No disponible",
      summaryTags: Array.isArray(generalSummary.summary_tags) ? generalSummary.summary_tags : [],
    },
    metrics: {
      fbRatio: formatMetric(generalSummary.firmicutes_bacteroidetes_ratio),
      shannon: formatMetric(generalSummary.shannon_index),
      riskScore: formatMetric(finalObservations.risk_score),
    },
    compositionRows: Array.isArray(interpretation.bacterial_composition)
      ? interpretation.bacterial_composition.map((item: any) => ({
          name: item?.gender || item?.name || "No disponible",
          presence: item?.presence || "No disponible",
          implication: item?.clinical_implication || "No disponible",
        }))
      : [],
    diversityRows: Array.isArray(interpretation.bacterial_diversity)
      ? interpretation.bacterial_diversity.map((item: any) => ({
          headline: item?.diversity_headline || "No disponible",
          implication: item?.clinical_implication || "No disponible",
        }))
      : [],
    opportunists: Array.isArray(interpretation.opportunistic_microorganisms)
      ? interpretation.opportunistic_microorganisms.map((item: any) => ({
          name: item?.name || item?.gender || "No disponible",
          implication: item?.clinical_implication || item?.presence || "No disponible",
        }))
      : [],
    metabolicFunctions,
    pdfUrl: study.pdfUrl ?? null,
  };
};
