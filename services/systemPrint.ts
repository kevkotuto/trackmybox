import { Container } from '../types';
import { LabelFormat, labelsPerSheet } from './labelFormats';

// ─── Legacy helpers (kept for backward compat) ────────────────────────────────
export type PerPage = 1 | 4 | 8 | 16;
export function suggestPerPage(count: number): PerPage {
  if (count <= 1) return 1;
  if (count <= 4) return 4;
  if (count <= 8) return 8;
  return 16;
}

// ─── Label text helpers ───────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  carton: 'Carton', sac: 'Sac', valise: 'Valise',
  boite: 'Boîte', dossier: 'Dossier', sachet: 'Sachet',
};
const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  urgent:     { label: 'URGENT',     color: '#FF3B30', bg: '#FFEBEE' },
  semaine:    { label: 'SEMAINE',    color: '#FF9500', bg: '#FFF8E1' },
  pas_presse: { label: 'PAS PRESSÉ', color: '#34C759', bg: '#E8F5E9' },
};
const STATUS_LABELS: Record<string, string> = {
  emballe: 'Emballé', camion: 'En camion', depose: 'Déposé', deballe: 'Déballé',
};

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Single label HTML ────────────────────────────────────────────────────────
function labelHTML(
  c: Container,
  qrDataURL: string | undefined,
  roomName: string | undefined,
  fmt: LabelFormat,
): string {
  const pc        = PRIORITY_CONFIG[c.priority] ?? PRIORITY_CONFIG.pas_presse;
  const typeLabel = TYPE_LABELS[c.type] ?? c.type;
  const statusLabel = STATUS_LABELS[c.status] ?? c.status;
  const itemCount = (c.items ?? []).length;

  // Scale font and QR to label size
  const labelArea = fmt.labelWidth * fmt.labelHeight; // mm²
  const titlePx   = Math.max(7,  Math.min(14, Math.round(fmt.labelWidth * 0.065)));
  const metaPx    = Math.max(6,  Math.min(10, Math.round(fmt.labelWidth * 0.045)));
  const qrMM      = Math.min(fmt.labelWidth * 0.45, fmt.labelHeight * 0.45, 60);
  // Convert mm → px for HTML (96 dpi at print = ~3.78 px/mm, but browsers use 96px/in = 3.78px/mm)
  // We use mm units directly in img width via CSS
  const qrPxApprox = Math.round(qrMM * 3.78);

  const qrImg = qrDataURL
    ? `<img src="${qrDataURL}" style="width:${qrMM}mm;height:${qrMM}mm;display:block;margin:0 auto;" />`
    : `<div style="width:${qrMM}mm;height:${qrMM}mm;border:1px dashed #ccc;margin:0 auto;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:7px;">QR</div>`;

  const showMeta = labelArea > 1500; // skip meta rows on tiny labels (< ~40×38mm)

  return `<div class="label" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;width:${fmt.labelWidth}mm;height:${fmt.labelHeight}mm;overflow:hidden;box-sizing:border-box;">
  <div style="background:${pc.bg};border-bottom:2px solid ${pc.color};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;gap:3px;">
    <span style="font-size:${titlePx}px;font-weight:700;color:#000;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(c.name)}</span>
    <span style="font-size:${metaPx - 1}px;font-weight:800;color:${pc.color};white-space:nowrap;">${pc.label}</span>
  </div>
  <div style="text-align:center;padding:2px 0;">${qrImg}</div>
  ${showMeta ? `<div style="padding:1px 4px;font-size:${metaPx}px;line-height:1.4;">
    <div style="display:flex;justify-content:space-between;"><span style="color:#999;">${esc(typeLabel)}</span><span style="color:#999;">${esc(statusLabel)}</span></div>
    ${roomName ? `<div style="color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(roomName)}</div>` : ''}
    <div style="color:#999;">${itemCount} objet${itemCount !== 1 ? 's' : ''}${c.isThirdParty && c.thirdPartyOwner ? ` · ${esc(c.thirdPartyOwner)}` : ''}</div>
  </div>` : ''}
  <div style="text-align:center;font-family:monospace;font-size:${metaPx - 1}px;color:#ccc;letter-spacing:0.5px;padding:1px 2px;">${esc(c.qrCodeData)}</div>
</div>`;
}

// ─── Page builder ─────────────────────────────────────────────────────────────
function buildPage(labelsOnPage: string[], fmt: LabelFormat): string {
  const cells = labelsOnPage
    .map(l => `      <div style="width:${fmt.labelWidth}mm;height:${fmt.labelHeight}mm;overflow:hidden;">${l}</div>`)
    .join('\n');

  return `  <div style="position:relative;width:${fmt.paperWidth}mm;height:${fmt.paperHeight}mm;page-break-after:always;overflow:hidden;">
    <div style="position:absolute;top:${fmt.marginTop}mm;left:${fmt.marginLeft}mm;display:grid;grid-template-columns:repeat(${fmt.cols},${fmt.labelWidth}mm);column-gap:${fmt.gapH}mm;row-gap:${fmt.gapV}mm;">
${cells}
    </div>
  </div>`;
}

// ─── Main builder ─────────────────────────────────────────────────────────────
export function buildPrintHTML(
  containers: Container[],
  qrDataURLs: Map<string, string>,
  format: LabelFormat,
  roomNames?: Map<string, string>,
): string {
  const perSheet = labelsPerSheet(format);
  const labels   = containers.map(c =>
    labelHTML(c, qrDataURLs.get(c.id), roomNames?.get(c.id), format),
  );

  // Split into pages
  const pages: string[] = [];
  for (let i = 0; i < labels.length; i += perSheet) {
    pages.push(buildPage(labels.slice(i, i + perSheet), format));
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: ${format.paperWidth}mm ${format.paperHeight}mm; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
${pages.join('\n')}
</body>
</html>`;
}
