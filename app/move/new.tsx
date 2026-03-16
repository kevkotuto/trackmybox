import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import TMBInput from '@/components/ui/TMBInput';
import TMBButton from '@/components/ui/TMBButton';

export default function NewMoveScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [moveDate, setMoveDate] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le d\u00e9m\u00e9nagement.');
      return;
    }

    // In a real app, save to store/database here
    Alert.alert('D\u00e9m\u00e9nagement cr\u00e9\u00e9', name, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TMBInput
        label="Nom du d\u00e9m\u00e9nagement"
        placeholder="Ex: D\u00e9m\u00e9nagement Paris \u2192 Lyon"
        icon="text-outline"
        value={name}
        onChangeText={setName}
      />

      <TMBInput
        label="Description"
        placeholder="D\u00e9tails suppl\u00e9mentaires..."
        icon="document-text-outline"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.textarea}
      />

      <TMBInput
        label="Adresse de d\u00e9part"
        placeholder="Ex: 12 rue de Paris, 75001"
        icon="location-outline"
        value={fromAddress}
        onChangeText={setFromAddress}
      />

      <TMBInput
        label="Adresse d\u2019arriv\u00e9e"
        placeholder="Ex: 8 avenue de Lyon, 69001"
        icon="navigate-outline"
        value={toAddress}
        onChangeText={setToAddress}
      />

      <TMBInput
        label="Date du d\u00e9m\u00e9nagement"
        placeholder="JJ/MM/AAAA"
        icon="calendar-outline"
        value={moveDate}
        onChangeText={setMoveDate}
        keyboardType="numbers-and-punctuation"
      />

      <TMBButton
        title="Cr\u00e9er le d\u00e9m\u00e9nagement"
        onPress={handleCreate}
        icon="checkmark-circle-outline"
        size="lg"
        style={styles.createBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createBtn: {
    marginTop: 16,
  },
});
