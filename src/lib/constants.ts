/** Iraqi governorates offered in the order form (PRD §12). */
export const GOVERNORATES = [
  "بغداد",
  "الأنبار",
  "بابل",
  "البصرة",
  "دهوك",
  "القادسية",
  "ديالى",
  "ذي قار",
  "السليمانية",
  "صلاح الدين",
  "كربلاء",
  "كركوك",
  "ميسان",
  "المثنى",
  "النجف",
  "نينوى",
  "واسط",
  "أربيل",
] as const;

export type Governorate = (typeof GOVERNORATES)[number];

/**
 * Size is free text rather than a fixed list: Rojin uses numeric sizes
 * alongside the usual letters, and the numbering is brand-specific, so an
 * enum would reject legitimate values. Bounded by length only.
 */
export const SIZE_MAX_LENGTH = 20;

/** Validation safeguards, not sizing recommendations (PRD §19). */
export const HEIGHT_MIN_CM = 100;
export const HEIGHT_MAX_CM = 230;
export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 250;
