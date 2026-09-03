import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { ChecklistItem } from '@/types';
import { checklistApi } from '@/services/api';

interface ChecklistSectionProps {
  containerId: string;
}

export default function ChecklistSection({ containerId }: ChecklistSectionProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    load();
  }, [containerId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await checklistApi.getByContainer(containerId);
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item: ChecklistItem) => {
    try {
      const updated = await checklistApi.toggle(item.id, !item.isDone);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour.');
    }
  };

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    try {
      const created = await checklistApi.create(containerId, newLabel.trim());
      setItems((prev) => [...prev, created]);
      setNewLabel('');
      setShowInput(false);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ajouter.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (item: ChecklistItem) => {
    Alert.alert('Supprimer', `Supprimer "${item.label}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await checklistApi.delete(item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        },
      },
    ]);
  };

  const doneCount = items.filter((i) => i.isDone).length;
  const total = items.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Checklist</Text>
          {total > 0 && (
            <Text style={styles.progress}>
              {doneCount}/{total}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => setShowInput(!showInput)}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name={showInput ? 'close' : 'add'} size={18} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Progress bar */}
      {total > 0 && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round((doneCount / total) * 100)}%` as any }]} />
        </View>
      )}

      {/* Add input */}
      {showInput && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="Ajouter un élément..."
            placeholderTextColor={Colors.grey[400]}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoFocus
          />
          <Pressable
            onPress={handleAdd}
            disabled={adding || !newLabel.trim()}
            style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.7 }]}
          >
            {adding
              ? <ActivityIndicator size="small" color={Colors.surface} />
              : <Ionicons name="checkmark" size={16} color={Colors.surface} />
            }
          </Pressable>
        </View>
      )}

      {/* Items */}
      {loading
        ? <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
        : items.length === 0
          ? (
            <Text style={styles.emptyText}>Aucun élément. Appuyez sur + pour ajouter.</Text>
          )
          : items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
              onPress={() => handleToggle(item)}
              onLongPress={() => handleDelete(item)}
            >
              <View style={[styles.checkbox, item.isDone && styles.checkboxDone]}>
                {item.isDone && (
                  <Ionicons name="checkmark" size={12} color={Colors.surface} />
                )}
              </View>
              <Text style={[styles.itemLabel, item.isDone && styles.itemLabelDone]}>
                {item.label}
              </Text>
            </Pressable>
          ))
      }

      {total > 0 && (
        <Text style={styles.hint}>Appui long pour supprimer</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progress: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.navy.ghost,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.navy.ghost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.grey[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.status.success,
    borderRadius: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.grey[100],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.text.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.grey[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.status.success,
    borderColor: Colors.status.success,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  itemLabelDone: {
    color: Colors.text.muted,
    textDecorationLine: 'line-through',
  },
  hint: {
    fontSize: 11,
    color: Colors.text.muted,
    textAlign: 'center',
    paddingTop: 2,
  },
});
