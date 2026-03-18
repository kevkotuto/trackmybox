import TMBButton from "@/components/ui/TMBButton";
import { Colors } from "@/constants/colors";
import { useBatchPrint } from "@/hooks/useBatchPrint";
import { LabelFormat, labelsPerSheet } from "@/services/labelFormats";
import { useContainerStore } from "@/stores/useContainerStore";
import { Container } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { SymbolView as Icon } from "expo-symbols";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

// ─── Public handle ────────────────────────────────────────────────────────────
export interface PrintContainersSheetHandle {
  present: () => void;
  dismiss: () => void;
}

interface Props {
  /** Pass the currently active format so the sheet always reflects the latest */
  getActiveFormat: () => LabelFormat;
  /** The hidden QR node from useBatchPrint must be rendered outside this sheet */
  onRequestHiddenNode: (node: React.ReactNode) => void;
}

const SNAP_POINTS = ["55%", "90%"];

const PrintContainersSheet = forwardRef<PrintContainersSheetHandle, Props>(
  ({ getActiveFormat, onRequestHiddenNode }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const { containers } = useContainerStore();
    const { captureAndPrint, hiddenQRNode, isPrinting } = useBatchPrint();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Expose the hidden QR node to parent so it stays in the main view tree
    React.useEffect(() => {
      onRequestHiddenNode(hiddenQRNode);
    }, [hiddenQRNode]);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const toggle = useCallback((id: string) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }, []);

    const selectAll  = useCallback(() => setSelectedIds(new Set(containers.map(c => c.id))), [containers]);
    const selectNone = useCallback(() => setSelectedIds(new Set()), []);

    const toPrintCount = selectedIds.size > 0 ? selectedIds.size : containers.length;
    const format       = getActiveFormat();
    const pageCount    = Math.ceil(toPrintCount / labelsPerSheet(format));

    const handlePrint = async () => {
      const toPrint = selectedIds.size > 0
        ? containers.filter(c => selectedIds.has(c.id))
        : containers;

      if (!toPrint.length) {
        Alert.alert("Impression", "Aucun carton à imprimer.");
        return;
      }

      await captureAndPrint(toPrint, { format });
    };

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
      [],
    );

    const renderItem = useCallback(({ item, index }: { item: Container; index: number }) => {
      const checked = selectedIds.size === 0 || selectedIds.has(item.id);
      return (
        <View>
          {index > 0 && <View style={s.divider} />}
          <Pressable style={s.containerRow} onPress={() => toggle(item.id)}>
            <Icon
              name={checked ? "checkmark.square.fill" : "square"}
              size={20}
              colors={[checked ? Colors.primary : Colors.grey[300]]}
              weight="medium"
            />
            <Text style={s.containerName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.containerMeta}>{(item.items ?? []).length} obj.</Text>
          </Pressable>
        </View>
      );
    }, [selectedIds, toggle]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={s.sheetBg}
        handleIndicatorStyle={s.handle}
      >
        {/* Sticky header + footer */}
        <View style={s.header}>
          <Text style={s.title}>Imprimer les étiquettes</Text>

          {/* Format summary pill */}
          <View style={s.formatPill}>
            <Icon name="doc.text" size={12} colors={[Colors.primary]} weight="medium" />
            <Text style={s.formatPillText}>
              {format.name} · {labelsPerSheet(format)} / page
            </Text>
          </View>

          {/* Select all / none */}
          <View style={s.selectionActions}>
            <Pressable style={s.selectionAction} onPress={selectAll}>
              <Text style={s.selectionActionText}>Tout sélectionner</Text>
            </Pressable>
            <View style={s.selectionSep} />
            <Pressable style={s.selectionAction} onPress={selectNone}>
              <Text style={s.selectionActionText}>Tout désélectionner</Text>
            </Pressable>
          </View>
        </View>

        {/* Container list */}
        <BottomSheetFlatList
          data={containers}
          keyExtractor={(c: Container) => c.id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <Text style={s.emptyText}>Aucun carton enregistré.</Text>
          }
        />

        {/* Print bar */}
        <View style={s.footer}>
          <Text style={s.summary}>
            {toPrintCount} étiquette{toPrintCount !== 1 ? "s" : ""} · {pageCount} page{pageCount !== 1 ? "s" : ""}
          </Text>
          <TMBButton
            title={isPrinting ? "Préparation…" : `Imprimer${selectedIds.size > 0 ? ` (${selectedIds.size})` : " tout"}`}
            onPress={handlePrint}
            variant="primary"
            icon="print-outline"
            size="md"
            disabled={isPrinting || containers.length === 0}
          />
        </View>
      </BottomSheetModal>
    );
  },
);

PrintContainersSheet.displayName = "PrintContainersSheet";
export default PrintContainersSheet;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.background },
  handle:  { backgroundColor: Colors.grey[300], width: 36 },

  header: {
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text.primary, marginBottom: 8 },

  formatPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, backgroundColor: Colors.navy.ghost,
    borderWidth: 1, borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  formatPillText: { fontSize: 12, fontWeight: "600", color: Colors.primary },

  selectionActions: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10, borderCurve: "continuous",
    borderWidth: 1, borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  selectionAction:     { flex: 1, paddingVertical: 8, alignItems: "center" },
  selectionActionText: { fontSize: 13, fontWeight: "600", color: Colors.primary },
  selectionSep:        { width: 1, height: "100%", backgroundColor: Colors.borderLight },

  listContent: { paddingHorizontal: 16, paddingBottom: 8 },

  divider:       { height: 1, backgroundColor: Colors.borderLight },
  containerRow:  { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  containerName: { flex: 1, fontSize: 15, fontWeight: "500", color: Colors.text.primary },
  containerMeta: { fontSize: 13, color: Colors.text.muted },
  emptyText:     { textAlign: "center", color: Colors.text.muted, paddingVertical: 32, fontSize: 14 },

  footer: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    gap: 8,
  },
  summary: { fontSize: 13, color: Colors.text.secondary, textAlign: "center" },
});
