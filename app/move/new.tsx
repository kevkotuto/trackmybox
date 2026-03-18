import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MoveStatus } from '@/types';
import { useMoveStore } from '@/stores/useMoveStore';
import TMBButton from '@/components/ui/TMBButton';
import TMBInput from '@/components/ui/TMBInput';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAYS_SHORT = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function CalendarModal({
  visible,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  value: Date | null;
  onChange: (date: Date) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (rawFirst + 6) % 7; // Monday = 0

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (d: number | null) => {
    if (!d || !value) return false;
    return (
      value.getFullYear() === viewYear &&
      value.getMonth() === viewMonth &&
      value.getDate() === d
    );
  };
  const isToday = (d: number | null) => {
    if (!d) return false;
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === d
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={cal.backdrop} onPress={onClose}>
        <Pressable style={cal.sheet} onPress={() => {}}>
          <View style={cal.handle} />

          <View style={cal.header}>
            <Pressable onPress={prevMonth} style={cal.navBtn} hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            </Pressable>
            <Text style={cal.headerTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
            <Pressable onPress={nextMonth} style={cal.navBtn} hitSlop={12}>
              <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
            </Pressable>
          </View>

          <View style={cal.dayNamesRow}>
            {DAYS_SHORT.map(d => (
              <Text key={d} style={cal.dayName}>{d}</Text>
            ))}
          </View>

          <View style={cal.grid}>
            {cells.map((d, i) => (
              <Pressable
                key={i}
                style={[
                  cal.cell,
                  isSelected(d) && cal.cellSelected,
                  isToday(d) && !isSelected(d) && cal.cellToday,
                ]}
                onPress={() => {
                  if (d) { onChange(new Date(viewYear, viewMonth, d)); onClose(); }
                }}
                disabled={!d}
              >
                <Text style={[
                  cal.cellText,
                  isSelected(d) && cal.cellTextSelected,
                  isToday(d) && !isSelected(d) && cal.cellTextToday,
                ]}>
                  {d ?? ''}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={cal.footer}>
            <Pressable
              style={cal.todayBtn}
              onPress={() => { onChange(new Date()); onClose(); }}
            >
              <Ionicons name="today-outline" size={16} color={Colors.primary} />
              <Text style={cal.todayBtnText}>Aujourd'hui</Text>
            </Pressable>
            <Pressable style={cal.cancelBtn} onPress={onClose}>
              <Text style={cal.cancelBtnText}>Annuler</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLong(d: Date): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return `${days[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function NewMoveScreen() {
  const router = useRouter();
  const { addMove } = useMoveStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [moveDate, setMoveDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le déménagement.');
      return;
    }
    setIsLoading(true);
    try {
      await addMove({
        name: name.trim(),
        description: description.trim() || undefined,
        fromAddress: fromAddress.trim() || undefined,
        toAddress: toAddress.trim() || undefined,
        moveDate: moveDate ? formatDate(moveDate) : undefined,
        status: MoveStatus.PREPARATION,
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible de créer le déménagement.';
      Alert.alert('Erreur', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TMBInput
          label="Nom du déménagement *"
          placeholder="Ex: Déménagement Paris → Lyon"
          icon="text-outline"
          value={name}
          onChangeText={setName}
        />

        <TMBInput
          label="Description"
          placeholder="Détails supplémentaires..."
          icon="document-text-outline"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.textarea}
        />

        {/* Addresses */}
        <Text style={styles.sectionLabel}>Adresses</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={styles.addressDotFrom} />
            <View style={styles.addressInputWrap}>
              <Text style={styles.addressFieldLabel}>Adresse de départ</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="Ex: 12 rue de Paris, 75001"
                placeholderTextColor={Colors.grey[400]}
                value={fromAddress}
                onChangeText={setFromAddress}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.addressSeparator} />

          <View style={styles.addressRow}>
            <View style={styles.addressDotTo} />
            <View style={styles.addressInputWrap}>
              <Text style={styles.addressFieldLabel}>Adresse d'arrivée</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="Ex: 8 avenue de Lyon, 69001"
                placeholderTextColor={Colors.grey[400]}
                value={toAddress}
                onChangeText={setToAddress}
                returnKeyType="done"
                autoCapitalize="words"
              />
            </View>
          </View>
        </View>

        {/* Date picker */}
        <Text style={styles.sectionLabel}>Date du déménagement</Text>
        <Pressable
          style={({ pressed }) => [styles.datePicker, pressed && styles.datePickerPressed]}
          onPress={() => setShowCalendar(true)}
        >
          <View style={[styles.datePickerIcon, moveDate && styles.datePickerIconActive]}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={moveDate ? Colors.surface : Colors.grey[500]}
            />
          </View>
          <View style={styles.datePickerContent}>
            <Text style={styles.datePickerMeta}>Date</Text>
            {moveDate ? (
              <Text style={styles.datePickerValue}>{formatDateLong(moveDate)}</Text>
            ) : (
              <Text style={styles.datePickerPlaceholder}>Sélectionner une date</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.grey[400]} />
        </Pressable>

        {moveDate && (
          <Pressable style={styles.clearDate} onPress={() => setMoveDate(null)}>
            <Text style={styles.clearDateText}>Effacer la date</Text>
          </Pressable>
        )}

        <TMBButton
          title="Créer le déménagement"
          onPress={handleCreate}
          icon="checkmark-circle-outline"
          size="lg"
          style={styles.createBtn}
          loading={isLoading}
        />
      </ScrollView>

      <CalendarModal
        visible={showCalendar}
        value={moveDate}
        onChange={setMoveDate}
        onClose={() => setShowCalendar(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
  },

  // Address block
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  addressDotFrom: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  addressDotTo: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.status.success,
  },
  addressSeparator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 26,
  },
  addressInputWrap: { flex: 1 },
  addressFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  addressInput: {
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 0,
  },

  // Date picker
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    marginBottom: 8,
  },
  datePickerPressed: { opacity: 0.7 },
  datePickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.navy.ghost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerIconActive: {
    backgroundColor: Colors.primary,
  },
  datePickerContent: { flex: 1 },
  datePickerMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  datePickerValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  datePickerPlaceholder: {
    fontSize: 15,
    color: Colors.grey[400],
  },
  clearDate: { alignSelf: 'flex-end', paddingHorizontal: 4, marginBottom: 16 },
  clearDateText: { fontSize: 13, color: Colors.status.error, fontWeight: '500' },
  createBtn: { marginTop: 20 },
});

const cal = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.grey[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.navy.ghost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayName: {
    width: `${100 / 7}%` as any,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  cellSelected: {
    backgroundColor: Colors.primary,
  },
  cellToday: {
    backgroundColor: Colors.navy.ghost,
  },
  cellText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  cellTextSelected: {
    color: Colors.surface,
    fontWeight: '700',
  },
  cellTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  todayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.navy.ghost,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.grey[100],
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
});
