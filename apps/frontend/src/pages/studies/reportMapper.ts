export interface ReportStudy {
  id: string;
  patientCode: string;
  studyCode: string;
  studyDate: string;
  patientAge?: number | null;
  patientSex?: string | null;
  completedAt?: string | null;
  status: string;
  pdfUrl?: string | null;
  normalizedJson?: any;
  rawJson?: any;
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
    profile: string | null;
  };
  summary: {
    status: ReportHeroStatus;
    title: string;
    description: string;
    tags: string[];
    indicator: string | null;
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
    secondaryStats: Array<{
      label: string;
      value: string;
    }>;
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
    status: string;
    score: string;
    implication: string;
  }>;
  metabolicFunctions: Array<{
    name: string;
    value: string;
    implication: string;
    percent: number;
    score: string;
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

  if (normalized.includes("muy alta") || normalized.includes("óptimo") || normalized.includes("elevada") || normalized.includes("alto")) return 88;
  if (normalized.includes("alta") || normalized.includes("normal")) return 76;
  if (normalized.includes("moderada") || normalized.includes("media") || normalized.includes("alterada")) return 60;
  if (normalized.includes("baja") || normalized.includes("detectable") || normalized.includes("reducida")) return 38;
  if (normalized.includes("no disponible") || normalized.includes("inconclus")) return 20;
  return 52;
};

const stripDiacritics = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const deriveHeroStatus = (
  globalIndicator: string,
  riskScore: number | null,
  tags: string[],
  chronicSignals: string[],
): ReportHeroStatus => {
  const normalizedIndicator = stripDiacritics(globalIndicator.toLowerCase());
  const normalizedTags = tags.map((tag) => stripDiacritics(String(tag).toLowerCase()));
  const normalizedChronicSignals = chronicSignals.map((signal) => stripDiacritics(String(signal).toLowerCase()));
  const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));
  const tagsIncludeAny = (terms: string[]) => normalizedTags.some((tag) => includesAny(tag, terms));
  const chronicSignalsIncludeAny = (terms: string[]) => normalizedChronicSignals.some((signal) => includesAny(signal, terms));

  if (includesAny(normalizedIndicator, ['cronica', 'cronico'])) {
    return 'chronic';
  }

  if (includesAny(normalizedIndicator, ['inconclus', 'insuficiente'])) {
    return 'inconclusive';
  }

  if (includesAny(normalizedIndicator, ['equilibrada', 'equilibrado'])) {
    return 'balanced';
  }

  if (includesAny(normalizedIndicator, ['alterada', 'alterado', 'disbiosis'])) {
    return 'altered';
  }

  if (tagsIncludeAny(['datos insuficientes', 'analisis inconcluso', 'analisis no concluyente', 'inconclus'])) {
    return 'inconclusive';
  }

  if (tagsIncludeAny(['cronica', 'cronico'])) {
    return 'chronic';
  }

  if (
    riskScore !== null &&
    riskScore >= 85 &&
    chronicSignalsIncludeAny(['cronica', 'cronico', 'persistente', 'sostenida', 'sostenido', 'chronic'])
  ) {
    return 'chronic';
  }

  if (tagsIncludeAny(['disbiosis', 'alter', 'desequilibrio'])) {
    return 'altered';
  }

  if (tagsIncludeAny(['microbiota saludable', 'saludable', 'eubiosis'])) {
    return 'balanced';
  }

  if (riskScore !== null) {
    if (riskScore <= 30) return 'balanced';
    if (riskScore >= 70) return 'altered';
    return 'altered';
  }

  return 'altered';
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

const formatProfile = (age?: number | null, sex?: string | null) => {
  const parts: string[] = [];
  if (typeof age === "number") parts.push(`${age} años`);
  if (sex) parts.push(sex === "FEMENINO" ? "F" : sex === "MASCULINO" ? "M" : sex);
  return parts.length ? parts.join(" · ") : null;
};


const resolveDiversityMetric = (normalizedValue: unknown, rawValue: unknown) => {
  const normalizedNumber = numberValue(normalizedValue);
  const rawNumber = numberValue(rawValue);

  if (normalizedNumber !== null && normalizedNumber > 0) return normalizedNumber;
  if (rawNumber !== null) return rawNumber;
  if (normalizedNumber !== null) return normalizedNumber;
  return null;
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
  const rawDiversity = study.rawJson?.diversity ?? {};

  const riskScore = numberValue(finalObservations.risk_score);
  const conclusionTags = Array.isArray(finalObservations.conclusion_tags) ? finalObservations.conclusion_tags : [];
  const summaryTags = Array.isArray(generalSummary.summary_tags) ? generalSummary.summary_tags : [];
  const rawOpportunisticNotes = Array.isArray(study.rawJson?.functionality?.opportunistic_microorganisms)
    ? study.rawJson.functionality.opportunistic_microorganisms.map((item: any) => item?.note).filter(Boolean)
    : [];
  const chronicSignals = [
    study.rawJson?.clinical_context?.inflammatory_markers,
    study.rawJson?.clinical_context?.lab_observations,
    ...rawOpportunisticNotes,
  ].filter(Boolean);
  const heroStatus = deriveHeroStatus(
    finalObservations.global_indicator || "",
    riskScore,
    [...conclusionTags, ...summaryTags],
    chronicSignals,
  );

  const compositionRows = bacterialComposition.length
    ? bacterialComposition.map((item: any) => ({
        name: item?.gender || item?.name || "No disponible",
        presence: item?.presence || "No disponible",
        implication: item?.clinical_implication || "-",
      }))
    : predominantGenera.map((item: any) => ({
        name: item?.name || "No disponible",
        presence: normalizePresence(Number(item?.abundance ?? 0)),
        implication: "-",
      }));

  const metabolicFunctions = inferredMetabolicFunctions.length
    ? inferredMetabolicFunctions.map((item: any, index: number) => {
        const score = numberValue(item?.activity_score);
        const value = item?.activity_status || item?.level || item?.value || "No disponible";
        return {
          name: item?.metabolic_function || item?.function_headline || item?.function || `Función ${index + 1}`,
          value,
          implication: item?.clinical_implication || item?.description || "No disponible",
          percent: score !== null ? clamp(score) : percentFromLabel(String(value)),
          score: score !== null ? `${score}/100` : "No disponible",
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
            score: "No disponible",
          };
        });

  const fbRatio = formatMetric(generalSummary.firmicutes_bacteroidetes_ratio ?? normalized.data?.taxonomy?.firmicutes_bacteroidetes_ratio);
  const resolvedShannon = resolveDiversityMetric(generalSummary.shannon_index ?? diversity.shannon_index, rawDiversity.shannon_index);
  const resolvedOtus = resolveDiversityMetric(diversity.observed_otus, rawDiversity.observed_species ?? rawDiversity.observed_otus);
  const resolvedSimpson = resolveDiversityMetric(diversity.simpson_index, rawDiversity.simpson_index);
  const shannon = formatMetric(resolvedShannon);

  return {
    header: {
      patientCode: study.patientCode,
      studyCode: study.studyCode,
      analysisDate: formatDate(normalized.report_date || study.completedAt || study.studyDate),
      profile: formatProfile(study.patientAge, study.patientSex),
    },
    summary: {
      status: heroStatus,
      title: statusLabelMap[heroStatus],
      description: generalSummary.summary || finalObservations.conclusions || "No disponible",
      tags: summaryTags.length ? summaryTags : conclusionTags,
      indicator: finalObservations.global_indicator || null,
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
          percent: clamp(((resolvedShannon ?? 0) / 5) * 100),
        },
      ],
      secondaryStats: [
        { label: "Risk score", value: formatMetric(riskScore) },
        { label: "OTUs observados", value: formatMetric(resolvedOtus) },
        { label: "Índice Simpson", value: formatMetric(resolvedSimpson) },
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
          name: item?.microorganism || item?.name || item?.gender || "No disponible",
          status: item?.abundance_status || item?.presence || "No disponible",
          score: item?.abundance_score !== undefined ? `${item.abundance_score}/100` : "No disponible",
          implication: item?.clinical_implication || "No disponible",
        }))
      : [
          {
            name: "Otros oportunistas relevantes",
            status: "No detectado",
            score: "No disponible",
            implication: "No detectado",
          },
          {
            name: "Patógenos de interés",
            status: "No detectado",
            score: "No disponible",
            implication: "No detectado",
          },
        ],
    metabolicFunctions,
    pdfUrl: study.pdfUrl ?? null,
  };
};













