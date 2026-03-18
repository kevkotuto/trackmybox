import LabelFormatEditor from "@/components/print/LabelFormatEditor";
import { Colors } from "@/constants/colors";
import {
  DEFAULT_FORMAT,
  LabelFormat,
  deleteFormat,
  labelsPerSheet,
  loadActiveFormatId,
  loadSavedFormats,
  saveActiveFormatId,
  upsertFormat,
} from "@/services/labelFormats";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { SymbolView as Icon } from "expo-symbols";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

// ─── Public handle ────────────────────────────────────────────────────────────
export interface LabelFormatSheetHandle {
  present: () => void;
  dismiss: () => void;
  activeFormat: LabelFormat;
}

const SNAP_POINTS = ["75%", "95%"];

const LabelFormatSheet = forwardRef<LabelFormatSheetHandle>((_, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  const [activeFormat, setActiveFormat] = useState<LabelFormat>(DEFAULT_FORMAT);
  const [savedFormats, setSavedFormats] = useState<LabelFormat[]>([]);

  // Load persisted formats once
  useEffect(() => {
    (async () => {
      const [saved, activeId] = await Promise.all([loadSavedFormats(), loadActiveFormatId()]);
      setSavedFormats(saved);
      if (activeId) {
        const found = saved.find(f => f.id === activeId);
        if (found) setActiveFormat(found);
      }
    })();
  }, []);

  // Expose handle to parent
  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
    get activeFormat() { return activeFormat; },
  }), [activeFormat]);

  const handleFormatChange = useCallback((fmt: LabelFormat) => {
    setActiveFormat(fmt);
    saveActiveFormatId(fmt.id);
  }, []);

  const handleFormatSave = useCallback(async (fmt: LabelFormat) => {
    await upsertFormat(fmt);
    const updated = await loadSavedFormats();
    setSavedFormats(updated);
    setActiveFormat(fmt);
    saveActiveFormatId(fmt.id);
  }, []);

  const handleFormatDelete = useCallback(async (id: string) => {
    await deleteFormat(id);
    const updated = await loadSavedFormats();
    setSavedFormats(updated);
  }, []);

  const handleFormatImport = useCallback(async (fmt: LabelFormat) => {
    await upsertFormat(fmt);
    const updated = await loadSavedFormats();
    setSavedFormats(updated);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Format d'étiquettes</Text>
          <View style={s.badge}>
            <Icon name="doc.text" size={12} colors={[Colors.primary]} weight="medium" />
            <Text style={s.badgeText}>
              {labelsPerSheet(activeFormat)} / page · {activeFormat.paperWidth}×{activeFormat.paperHeight} mm
            </Text>
          </View>
        </View>

        <LabelFormatEditor
          value={activeFormat}
          onChange={handleFormatChange}
          savedFormats={savedFormats}
          onSave={handleFormatSave}
          onDelete={handleFormatDelete}
          onImport={handleFormatImport}
        />

      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

LabelFormatSheet.displayName = "LabelFormatSheet";
export default LabelFormatSheet;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.background },
  handle:  { backgroundColor: Colors.grey[300], width: 36 },
  content: { paddingHorizontal: 16, paddingBottom: 48 },

  header: { marginBottom: 16, marginTop: 4 },
  title:  { fontSize: 20, fontWeight: "700", color: Colors.text.primary, marginBottom: 6 },

  badge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, backgroundColor: Colors.navy.ghost,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: Colors.primary },
});
