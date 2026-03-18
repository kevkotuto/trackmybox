import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LabelFormat {
  id: string;
  name: string;
  isCustom?: boolean;
  // Paper (mm)
  paperWidth: number;
  paperHeight: number;
  // Grid
  cols: number;
  rows: number;
  // Label size (mm)
  labelWidth: number;
  labelHeight: number;
  // Distance from paper edge to first label (mm)
  marginTop: number;
  marginLeft: number;
  // Gap between labels (mm)
  gapH: number; // horizontal: between columns
  gapV: number; // vertical: between rows
}

// ─── Built-in presets ─────────────────────────────────────────────────────────
export const PRESET_FORMATS: LabelFormat[] = [
  {
    id: 'a4-full',
    name: 'A4 – Pleine page',
    paperWidth: 210, paperHeight: 297,
    cols: 1, rows: 1,
    labelWidth: 190, labelHeight: 277,
    marginTop: 10, marginLeft: 10,
    gapH: 0, gapV: 0,
  },
  {
    id: 'a4-2x4',
    name: 'A4 – 8 étiquettes (2×4)',
    paperWidth: 210, paperHeight: 297,
    cols: 2, rows: 4,
    labelWidth: 90, labelHeight: 60,
    marginTop: 15, marginLeft: 10,
    gapH: 10, gapV: 10,
  },
  {
    id: 'a4-2x7',
    name: 'A4 – 14 étiquettes (2×7)',
    paperWidth: 210, paperHeight: 297,
    cols: 2, rows: 7,
    labelWidth: 90, labelHeight: 35,
    marginTop: 15, marginLeft: 10,
    gapH: 10, gapV: 5,
  },
  {
    id: 'a4-4x4',
    name: 'A4 – 16 étiquettes (4×4)',
    paperWidth: 210, paperHeight: 297,
    cols: 4, rows: 4,
    labelWidth: 44, labelHeight: 60,
    marginTop: 15, marginLeft: 9,
    gapH: 5, gapV: 10,
  },
  // ── Avery France ─────────────────────────────────────────────────────────
  {
    id: 'avery-l7160',
    name: 'Avery L7160 – 24 éti. (3×8)',
    paperWidth: 210, paperHeight: 297,
    cols: 3, rows: 8,
    labelWidth: 63.5, labelHeight: 38.1,
    marginTop: 15.15, marginLeft: 7.2,
    gapH: 2.5, gapV: 0,
  },
  {
    id: 'avery-l7163',
    name: 'Avery L7163 – 14 éti. (2×7)',
    paperWidth: 210, paperHeight: 297,
    cols: 2, rows: 7,
    labelWidth: 99.1, labelHeight: 38.1,
    marginTop: 15.15, marginLeft: 4.67,
    gapH: 2.54, gapV: 0,
  },
  {
    id: 'avery-l7165',
    name: 'Avery L7165 – 8 éti. (2×4)',
    paperWidth: 210, paperHeight: 297,
    cols: 2, rows: 4,
    labelWidth: 99.1, labelHeight: 67.7,
    marginTop: 13.5, marginLeft: 4.67,
    gapH: 2.54, gapV: 0,
  },
  {
    id: 'avery-l7169',
    name: 'Avery L7169 – 6 éti. (2×3)',
    paperWidth: 210, paperHeight: 297,
    cols: 2, rows: 3,
    labelWidth: 99.1, labelHeight: 93.1,
    marginTop: 5.35, marginLeft: 4.67,
    gapH: 2.54, gapV: 0,
  },
  {
    id: 'avery-l7173',
    name: 'Avery L7173 – 4 éti. (2×2)',
    paperWidth: 210, paperHeight: 297,
    cols: 2, rows: 2,
    labelWidth: 99.1, labelHeight: 139,
    marginTop: 9.5, marginLeft: 4.67,
    gapH: 2.54, gapV: 0,
  },
  // ── A5 ────────────────────────────────────────────────────────────────────
  {
    id: 'a5-full',
    name: 'A5 – Pleine page',
    paperWidth: 148, paperHeight: 210,
    cols: 1, rows: 1,
    labelWidth: 130, labelHeight: 192,
    marginTop: 9, marginLeft: 9,
    gapH: 0, gapV: 0,
  },
  {
    id: 'a5-2x3',
    name: 'A5 – 6 étiquettes (2×3)',
    paperWidth: 148, paperHeight: 210,
    cols: 2, rows: 3,
    labelWidth: 60, labelHeight: 56,
    marginTop: 15, marginLeft: 10,
    gapH: 8, gapV: 12,
  },
  // ── Thermique ─────────────────────────────────────────────────────────────
  {
    id: 'thermal-58x40',
    name: 'Thermique 58×40 mm',
    paperWidth: 58, paperHeight: 40,
    cols: 1, rows: 1,
    labelWidth: 54, labelHeight: 36,
    marginTop: 2, marginLeft: 2,
    gapH: 0, gapV: 0,
  },
  {
    id: 'thermal-100x70',
    name: 'Thermique 100×70 mm',
    paperWidth: 100, paperHeight: 70,
    cols: 1, rows: 1,
    labelWidth: 94, labelHeight: 64,
    marginTop: 3, marginLeft: 3,
    gapH: 0, gapV: 0,
  },
];

export const DEFAULT_FORMAT = PRESET_FORMATS[0];

// ─── Persistence ──────────────────────────────────────────────────────────────
const STORAGE_KEY = '@tmb/label_formats_v1';
const ACTIVE_KEY  = '@tmb/label_format_active';

export async function loadSavedFormats(): Promise<LabelFormat[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as LabelFormat[]) : [];
  } catch {
    return [];
  }
}

export async function upsertFormat(fmt: LabelFormat): Promise<void> {
  const list = await loadSavedFormats();
  const idx  = list.findIndex(f => f.id === fmt.id);
  if (idx >= 0) list[idx] = fmt; else list.push(fmt);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function deleteFormat(id: string): Promise<void> {
  const list = await loadSavedFormats();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list.filter(f => f.id !== id)));
}

export async function loadActiveFormatId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_KEY);
}

export async function saveActiveFormatId(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_KEY, id);
}

/** Serialize a LabelFormat to a JSON string for sharing */
export function exportFormatJSON(fmt: LabelFormat): string {
  return JSON.stringify({ ...fmt, isCustom: true }, null, 2);
}

/** Parse an imported JSON string; throws if invalid */
export function importFormatJSON(json: string): LabelFormat {
  const obj = JSON.parse(json) as Partial<LabelFormat>;
  const required: (keyof LabelFormat)[] = [
    'name', 'paperWidth', 'paperHeight', 'cols', 'rows',
    'labelWidth', 'labelHeight', 'marginTop', 'marginLeft', 'gapH', 'gapV',
  ];
  for (const key of required) {
    if (obj[key] === undefined) throw new Error(`Champ manquant: ${key}`);
  }
  return {
    ...obj,
    id: obj.id ?? `custom_${Date.now()}`,
    isCustom: true,
  } as LabelFormat;
}

/** Total labels per sheet */
export function labelsPerSheet(fmt: LabelFormat): number {
  return fmt.cols * fmt.rows;
}
