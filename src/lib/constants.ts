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

/** Abaya sizes offered in the order form (PRD §15). */
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type Size = (typeof SIZES)[number];

/** Validation safeguards, not sizing recommendations (PRD §19). */
export const HEIGHT_MIN_CM = 100;
export const HEIGHT_MAX_CM = 230;
export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 250;
