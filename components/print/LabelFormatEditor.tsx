import { Colors } from "@/constants/colors";
import {
  DEFAULT_FORMAT,
  LabelFormat,
  PRESET_FORMATS,
  exportFormatJSON,
  importFormatJSON,
  labelsPerSheet,
} from "@/services/labelFormats";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

// ─── Tiny numeric field ───────────────────────────────────────────────────────
function NumField({
  label,
  value,
  onChange,
  unit = "mm",
  decimals = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  decimals?: number;
}) {
  const [text, setText] = useState(String(value));

  const commit = useCallback(() => {
    const n = parseFloat(text.replace(",", "."));
    if (!isNaN(n) && n >= 0) onChange(parseFloat(n.toFixed(decimals)));
    else setText(String(value));
  }, [text, value, onChange, decimals]);

  return (
    <View style={nf.wrap}>
      <Text style={nf.label}>{label}</Text>
      <View style={nf.row}>
        <TextInput
          style={nf.input}
          value={text}
          onChangeText={t => { setText(t); }}
          onBlur={commit}
          onEndEditing={commit}
          keyboardType="decimal-pad"
          selectTextOnFocus
        />
        <Text style={nf.unit}>{unit}</Text>
      </View>
    </View>
  );
}
const nf = StyleSheet.create({
  wrap:  { flex: 1, minWidth: 70 },
  label: { fontSize: 10, color: Colors.text.secondary, marginBottom: 4, fontWeight: "600" },
  row:   { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 8, height: 36, backgroundColor: Colors.surface },
  input: { flex: 1, fontSize: 14, color: Colors.text.primary },
  unit:  { fontSize: 11, color: Colors.text.muted },
});

// ─── Paper preview (scaled) ───────────────────────────────────────────────────
function PaperPreview({ fmt }: { fmt: LabelFormat }) {
  const PREVIEW_W = 120;
  const scale     = PREVIEW_W / fmt.paperWidth;
  const PREVIEW_H = fmt.paperHeight * scale;
  const count     = labelsPerSheet(fmt);

  return (
    <View style={[prev.paper, { width: PREVIEW_W, height: PREVIEW_H }]}>
      {Array.from({ length: fmt.rows }).map((_, r) =>
        Array.from({ length: fmt.cols }).map((_, c) => {
          const left = (fmt.marginLeft + c * (fmt.labelWidth + fmt.gapH)) * scale;
          const top  = (fmt.marginTop  + r * (fmt.labelHeight + fmt.gapV)) * scale;
          const w    = fmt.labelWidth  * scale;
          const h    = fmt.labelHeight * scale;
          if (left + w > PREVIEW_W || top + h > PREVIEW_H) return null;
          return (
            <View
              key={`${r}-${c}`}
              style={[prev.label, { left, top, width: w, height: h }]}
            />
          );
        }),
      )}
      <Text style={prev.count}>{count}</Text>
    </View>
  );
}
const prev = StyleSheet.create({
  paper: { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.border, position: "relative", borderRadius: 4 },
  label: { position: "absolute", backgroundColor: Colors.navy.ghost, borderWidth: 0.5, borderColor: Colors.primary, borderRadius: 1 },
  count: { position: "absolute", bottom: 2, right: 4, fontSize: 9, color: Colors.text.muted, fontWeight: "700" },
});

// ─── Main editor ──────────────────────────────────────────────────────────────
interface Props {
  value: LabelFormat;
  onChange: (f: LabelFormat) => void;
  savedFormats: LabelFormat[];
  onSave: (f: LabelFormat) => void;
  onDelete: (id: string) => void;
  onImport: (f: LabelFormat) => void;
}

export default function LabelFormatEditor({
  value,
  onChange,
  savedFormats,
  onSave,
  onDelete,
  onImport,
}: Props) {
  const [advanced, setAdvanced] = useState(false);
  const [editingName, setEditingName] = useState(value.name);

  const allFormats = [...PRESET_FORMATS, ...savedFormats];
  const set = useCallback(<K extends keyof LabelFormat>(key: K, v: LabelFormat[K]) => {
    onChange({ ...value, [key]: v });
  }, [value, onChange]);

  const handleSave = () => {
    const fmt: LabelFormat = {
      ...value,
      id: value.isCustom ? value.id : `custom_${Date.now()}`,
      name: editingName.trim() || value.name,
      isCustom: true,
    };
    onSave(fmt);
    onChange(fmt);
    Alert.alert("Sauvegardé", `"${fmt.name}" a été sauvegardé.`);
  };

  const handleExport = async () => {
    try {
      const json = exportFormatJSON({ ...value, name: editingName.trim() || value.name });
      const path = `${FileSystem.cacheDirectory}format_${value.id}.json`;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: "application/json", dialogTitle: "Exporter le format" });
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'exporter ce format.");
    }
  };

  const handleImportPrompt = () => {
    Alert.prompt(
      "Importer un format",
      "Collez le JSON du format ici :",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Importer",
          onPress: (text: string | undefined) => {
            if (!text) return;
            try {
              const fmt = importFormatJSON(text);
              onImport(fmt);
              onChange(fmt);
              Alert.alert("Importé", `"${fmt.name}" a été importé.`);
            } catch (e) {
              Alert.alert("Erreur", "JSON invalide ou champs manquants.");
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleDelete = () => {
    if (!value.isCustom) return;
    Alert.alert("Supprimer", `Supprimer le format "${value.name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          onDelete(value.id);
          onChange(DEFAULT_FORMAT);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>

      {/* ── Preset selector ─────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>Format prédéfini</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll} contentContainerStyle={styles.presetList}>
        {allFormats.map(f => {
          const active = f.id === value.id;
          return (
            <Pressable
              key={f.id}
              style={[styles.presetChip, active && styles.presetChipActive]}
              onPress={() => { onChange(f); setEditingName(f.name); }}
            >
              <Text style={[styles.presetChipText, active && styles.presetChipTextActive]} numberOfLines={2}>
                {f.name}
              </Text>
              {f.isCustom && (
                <View style={styles.customDot} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Preview + summary ────────────────────────────────────────── */}
      <View style={styles.previewRow}>
        <PaperPreview fmt={value} />
        <View style={styles.previewInfo}>
          <Text style={styles.previewTitle}>{value.name}</Text>
          <Text style={styles.previewStat}>{labelsPerSheet(value)} étiquettes / page</Text>
          <Text style={styles.previewStat}>{value.paperWidth}×{value.paperHeight} mm</Text>
          <Text style={styles.previewStat}>{value.cols} col × {value.rows} lignes</Text>
          <Text style={styles.previewStat}>Éti. {value.labelWidth}×{value.labelHeight} mm</Text>
        </View>
      </View>

      {/* ── Advanced toggle ───────────────────────────────────────────── */}
      <Pressable
        style={styles.advancedToggle}
        onPress={() => setAdvanced(v => !v)}
      >
        <Text style={styles.advancedToggleText}>
          {advanced ? "Masquer les paramètres avancés" : "Paramètres avancés"}
        </Text>
        <Switch
          value={advanced}
          onValueChange={setAdvanced}
          trackColor={{ false: Colors.grey[300], true: Colors.primary }}
          thumbColor={Colors.surface}
        />
      </Pressable>

      {/* ── Advanced editor ───────────────────────────────────────────── */}
      {advanced && (
        <View style={styles.advancedPanel}>

          {/* Name */}
          <Text style={styles.groupLabel}>Nom du format</Text>
          <View style={nf.row}>
            <TextInput
              style={[nf.input, { flex: 1 }]}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Nom personnalisé…"
              placeholderTextColor={Colors.text.muted}
            />
          </View>

          {/* Paper */}
          <Text style={styles.groupLabel}>Papier</Text>
          <View style={styles.fieldRow}>
            <NumField label="Largeur" value={value.paperWidth}  onChange={v => set("paperWidth", v)} />
            <NumField label="Hauteur" value={value.paperHeight} onChange={v => set("paperHeight", v)} />
          </View>

          {/* Grid */}
          <Text style={styles.groupLabel}>Grille</Text>
          <View style={styles.fieldRow}>
            <NumField label="Colonnes" value={value.cols} onChange={v => set("cols", Math.max(1, Math.round(v)))} unit="col" decimals={0} />
            <NumField label="Lignes"   value={value.rows} onChange={v => set("rows", Math.max(1, Math.round(v)))} unit="lig" decimals={0} />
          </View>

          {/* Label size */}
          <Text style={styles.groupLabel}>Taille de l'étiquette</Text>
          <View style={styles.fieldRow}>
            <NumField label="Largeur" value={value.labelWidth}  onChange={v => set("labelWidth", v)} />
            <NumField label="Hauteur" value={value.labelHeight} onChange={v => set("labelHeight", v)} />
          </View>

          {/* Margins */}
          <Text style={styles.groupLabel}>Marges (bord du papier → 1ère étiquette)</Text>
          <View style={styles.fieldRow}>
            <NumField label="Marge haute"   value={value.marginTop}  onChange={v => set("marginTop", v)} />
            <NumField label="Marge gauche"  value={value.marginLeft} onChange={v => set("marginLeft", v)} />
          </View>

          {/* Gaps */}
          <Text style={styles.groupLabel}>Espacement entre étiquettes</Text>
          <View style={styles.fieldRow}>
            <NumField label="Horizontal (↔)" value={value.gapH} onChange={v => set("gapH", v)} />
            <NumField label="Vertical (↕)"   value={value.gapV} onChange={v => set("gapV", v)} />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={handleSave}>
              <Text style={styles.actionBtnText}>Sauvegarder</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleExport}>
              <Text style={styles.actionBtnText}>Exporter</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleImportPrompt}>
              <Text style={styles.actionBtnText}>Importer</Text>
            </Pressable>
            {value.isCustom && (
              <Pressable style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleDelete}>
                <Text style={[styles.actionBtnText, { color: Colors.status.error }]}>Supprimer</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingVertical: 4 },

  sectionLabel: {
    fontSize: 12, fontWeight: "700", color: Colors.text.secondary,
    textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8,
  },

  presetScroll: { marginHorizontal: -4 },
  presetList: { gap: 6, paddingHorizontal: 4, paddingBottom: 4 },
  presetChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderCurve: "continuous",
    maxWidth: 140, backgroundColor: Colors.grey[50],
    borderWidth: 1, borderColor: Colors.borderLight, position: "relative",
  },
  presetChipActive: { backgroundColor: Colors.navy.ghost, borderColor: Colors.primary },
  presetChipText: { fontSize: 11, fontWeight: "600", color: Colors.text.secondary, textAlign: "center" },
  presetChipTextActive: { color: Colors.primary },
  customDot: {
    position: "absolute", top: 4, right: 4,
    width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.info,
  },

  previewRow: { flexDirection: "row", gap: 16, alignItems: "flex-start", marginVertical: 12 },
  previewInfo: { flex: 1, gap: 4 },
  previewTitle: { fontSize: 14, fontWeight: "700", color: Colors.text.primary },
  previewStat: { fontSize: 12, color: Colors.text.secondary },

  advancedToggle: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  advancedToggleText: { fontSize: 14, fontWeight: "600", color: Colors.text.primary },

  advancedPanel: { paddingTop: 8, gap: 4 },
  groupLabel: {
    fontSize: 11, fontWeight: "700", color: Colors.text.secondary,
    textTransform: "uppercase", letterSpacing: 0.3,
    marginTop: 12, marginBottom: 6,
  },
  fieldRow: { flexDirection: "row", gap: 10 },

  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderCurve: "continuous",
    backgroundColor: Colors.grey[50], borderWidth: 1, borderColor: Colors.borderLight,
  },
  actionBtnDanger: { backgroundColor: Colors.status.errorLight, borderColor: Colors.status.error + "40" },
  actionBtnText: { fontSize: 13, fontWeight: "600", color: Colors.text.primary },
});
