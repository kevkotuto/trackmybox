import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import TMBCard from '@/components/ui/TMBCard';
import TMBButton from '@/components/ui/TMBButton';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [printerConnected, setPrinterConnected] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [thirdPartyMode, setThirdPartyMode] = useState(true);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>R\u00e9glages</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Printer Section */}
        <Text style={styles.sectionTitle}>Imprimante</Text>
        <TMBCard style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="print-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Imprimante connect\u00e9e</Text>
                <Text style={styles.settingHint}>
                  {printerConnected ? 'Brother QL-820NWB' : 'Aucune'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: printerConnected ? Colors.status.success : Colors.grey[300] },
              ]}
            />
          </View>
          <TMBButton
            title="Rechercher des appareils"
            onPress={() => Alert.alert('Recherche', 'Recherche d\u2019appareils Bluetooth...')}
            variant="secondary"
            icon="bluetooth-outline"
            size="sm"
            style={styles.scanBtn}
          />
        </TMBCard>

        {/* Modules Section */}
        <Text style={styles.sectionTitle}>Modules</Text>
        <TMBCard style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="extension-puzzle-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Mode avanc\u00e9</Text>
                <Text style={styles.settingHint}>
                  Photos, valeurs estim\u00e9es, cat\u00e9gories
                </Text>
              </View>
            </View>
            <Switch
              value={advancedMode}
              onValueChange={setAdvancedMode}
              trackColor={{ false: Colors.grey[300], true: Colors.primaryLight }}
              thumbColor={Colors.surface}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingLeft}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Tiers d\u00e9positaire</Text>
                <Text style={styles.settingHint}>
                  G\u00e9rer les objets d\u2019autres personnes
                </Text>
              </View>
            </View>
            <Switch
              value={thirdPartyMode}
              onValueChange={setThirdPartyMode}
              trackColor={{ false: Colors.grey[300], true: Colors.primaryLight }}
              thumbColor={Colors.surface}
            />
          </View>
        </TMBCard>

        {/* About Section */}
        <Text style={styles.sectionTitle}>\u00c0 propos</Text>
        <TMBCard style={styles.sectionCard}>
          <SettingInfoRow label="Version" value="1.0.0" />
          <SettingInfoRow label="Build" value="2026.03" last />
        </TMBCard>

        {/* Data Section */}
        <Text style={styles.sectionTitle}>Donn\u00e9es</Text>
        <TMBCard style={styles.sectionCard}>
          <View style={styles.dataButtons}>
            <TMBButton
              title="Exporter"
              onPress={() => Alert.alert('Export', 'Export en cours...')}
              variant="secondary"
              icon="download-outline"
              size="sm"
              style={styles.dataBtn}
            />
            <TMBButton
              title="Importer"
              onPress={() => Alert.alert('Import', 'Import en cours...')}
              variant="secondary"
              icon="cloud-upload-outline"
              size="sm"
              style={styles.dataBtn}
            />
          </View>
        </TMBCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function SettingInfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  sectionCard: {
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  settingHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scanBtn: {
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  dataButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dataBtn: {
    flex: 1,
  },
});
