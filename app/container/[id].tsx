import React, { useEffect, useState, useRef } from 'react';
import { useQRSettingsStore } from '@/stores/useQRSettingsStore';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-styled';
import { getModuleProps, getEyeProps } from '@/services/qrShapes';
import { Colors } from '@/constants/colors';
import { ContainerType, ContainerStatus, ContainerPriority } from '@/types';
import { useContainerStore } from '@/stores/useContainerStore';
import { usePrinterStore } from '@/stores/usePrinterStore';
import { itemApi, photoApi } from '@/services/api';
import TMBCard from '@/components/ui/TMBCard';
import TMBBadge from '@/components/ui/TMBBadge';
import TMBButton from '@/components/ui/TMBButton';
import ItemRow from '@/components/containers/ItemRow';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const typeIcons: Record<ContainerType, keyof typeof Ionicons.glyphMap> = {
  [ContainerType.CARTON]: 'cube-outline',
  [ContainerType.SAC]: 'bag-outline',
  [ContainerType.VALISE]: 'briefcase-outline',
  [ContainerType.BOITE]: 'archive-outline',
  [ContainerType.DOSSIER]: 'folder-outline',
  [ContainerType.SACHET]: 'pricetag-outline',
};

const typeLabels: Record<ContainerType, string> = {
  [ContainerType.CARTON]: 'Carton',
  [ContainerType.SAC]: 'Sac',
  [ContainerType.VALISE]: 'Valise',
  [ContainerType.BOITE]: 'Boîte',
  [ContainerType.DOSSIER]: 'Dossier',
  [ContainerType.SACHET]: 'Sachet',
};

const statusLabels: Record<ContainerStatus, string> = {
  [ContainerStatus.EMBALLE]: 'Emballé',
  [ContainerStatus.CAMION]: 'Camion',
  [ContainerStatus.DEPOSE]: 'Déposé',
  [ContainerStatus.DEBALLE]: 'Débállé',
};

const priorityLabels: Record<ContainerPriority, string> = {
  [ContainerPriority.URGENT]: 'Urgent',
  [ContainerPriority.SEMAINE]: 'Semaine',
  [ContainerPriority.PAS_PRESSE]: 'Pas pressé',
};

const statusFlow: ContainerStatus[] = [
  ContainerStatus.EMBALLE,
  ContainerStatus.CAMION,
  ContainerStatus.DEPOSE,
  ContainerStatus.DEBALLE,
];

const ITEM_SUGGESTIONS = [
  'Vêtements', 'Livres', 'Vaisselle', 'Câbles', 'Jouets',
  'Documents', 'Outils', 'Déco', 'Literie', 'Électronique',
];

export default function ContainerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    containers,
    updateContainer,
    deleteContainer,
    fetchContainerById,
    addItemToContainer,
    removeItemFromContainer,
    addPhotoToContainer,
  } = useContainerStore();
  const { printerStatus, printSticker } = usePrinterStore();
  const { fgColor: qrFg, bgColor: qrBg, showLogo: qrShowLogo, containerShape: qrShape, moduleShape: qrModule, eyeShape: qrEye, load: loadQR } = useQRSettingsStore();

  useEffect(() => { loadQR(); }, []);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Item modal state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // Photo state
  const [pendingAssets, setPendingAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [showAnnotateModal, setShowAnnotateModal] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoLinkedItemId, setPhotoLinkedItemId] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Lightbox state
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxRef = useRef<FlatList>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [printing, setPrinting] = useState(false);

  // QR code SVG ref for PDF export
  const qrSvgRef = useRef<any>(null);

  const container = containers.find(c => c.id === id);

  // Load from API if not in store (e.g. after scan)
  useEffect(() => {
    if (id) {
      fetchContainerById(id);
    }
  }, [id]);

  const handleStatusChange = async (newStatus: ContainerStatus) => {
    if (!container || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await updateContainer(container.id, { status: newStatus });
    } catch {
      Alert.alert('Erreur', 'Impossible de changer le statut.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openEditModal = () => {
    if (!container) return;
    setEditName(container.name);
    setEditDescription(container.description ?? '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!container || !editName.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await updateContainer(container.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setShowEditModal(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier le carton.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmAddItem = async () => {
    if (!newItemName.trim() || !container || addingItem) return;
    setAddingItem(true);
    try {
      const item = await itemApi.create({
        name: newItemName.trim(),
        category: newItemCategory.trim() || undefined,
        containerId: container.id,
      });
      addItemToContainer(container.id, item);
      setShowAddItem(false);
      setNewItemName('');
      setNewItemCategory('');
    } catch {
      Alert.alert('Erreur', "Impossible d'ajouter l'objet.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Supprimer', 'Supprimer cet objet ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await itemApi.delete(itemId);
            if (container) removeItemFromContainer(container.id, itemId);
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer cet objet.');
          }
        },
      },
    ]);
  };

  const stagePhotos = async (fromCamera: boolean) => {
    if (!container) return;

    let result;
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', "Autorisez l'accès à la caméra.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', "Autorisez l'accès à la galerie.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 30,
      });
    }

    if (result.canceled || !result.assets.length) return;

    // Show annotation modal before uploading
    setPendingAssets(result.assets);
    setPhotoCaption('');
    setPhotoLinkedItemId(null);
    setShowAnnotateModal(true);
  };

  const handleConfirmPhotos = async () => {
    if (!container || !pendingAssets.length || uploadingPhotos) return;
    setUploadingPhotos(true);
    setShowAnnotateModal(false);

    // Upload each photo independently — Promise.allSettled so one failure doesn't kill others
    const results = await Promise.allSettled(
      pendingAssets.map(asset =>
        photoApi.upload(container.id, asset.uri, photoCaption || undefined)
      )
    );

    let firstUrl: string | null = null;
    let successCount = 0;
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        addPhotoToContainer(container.id, r.value);
        if (!firstUrl) firstUrl = r.value.url;
        successCount++;
      }
    });

    // Link first uploaded photo to selected item
    if (photoLinkedItemId && firstUrl) {
      try {
        await itemApi.update(photoLinkedItemId, { photoUrl: firstUrl });
        // Update item in store
        const updatedItems = (container.items ?? []).map(i =>
          i.id === photoLinkedItemId ? { ...i, photoUrl: firstUrl! } : i
        );
        useContainerStore.setState(state => ({
          containers: state.containers.map(c =>
            c.id === container.id ? { ...c, items: updatedItems } : c
          ),
        }));
      } catch {
        // Non-blocking — photo still saved
      }
    }

    const failCount = results.length - successCount;
    if (successCount === 0) {
      Alert.alert('Erreur', "Impossible d'ajouter les photos.");
    } else if (failCount > 0) {
      Alert.alert('Partiel', `${successCount} photo(s) ajoutée(s), ${failCount} échouée(s).`);
    }

    setPendingAssets([]);
    setUploadingPhotos(false);
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Supprimer', 'Supprimer cette photo ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await photoApi.delete(photoId);
            useContainerStore.setState(state => ({
              containers: state.containers.map(c =>
                c.id === container?.id
                  ? { ...c, photos: (c.photos ?? []).filter(p => p.id !== photoId) }
                  : c
              ),
            }));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer cette photo.');
          }
        },
      },
    ]);
  };

  const handlePhotoPress = () => {
    Alert.alert('Ajouter des photos', '', [
      { text: 'Prendre une photo', onPress: () => stagePhotos(true) },
      { text: 'Choisir dans la galerie', onPress: () => stagePhotos(false) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const handleExportPDF = () => {
    if (!container) return;

    const { fgColor: pdfFg, bgColor: pdfBg, showLogo: pdfShowLogo } = useQRSettingsStore.getState();

    const generate = async (qrDataUrl?: string) => {
      const itemsList = (container.items ?? []).slice(0, 8).map(i => `<li>${i.name}</li>`).join('');
      const typeLabel = typeLabels[container.type] ?? container.type;
      const priorityLabel = priorityLabels[container.priority] ?? container.priority;
      const qrImg = qrDataUrl
        ? `<div style="position:relative;display:inline-block;">
             <img src="${qrDataUrl}" width="180" height="180" style="display:block;" />
             ${pdfShowLogo ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:${pdfBg};padding:5px 8px;border-radius:7px;font-size:12px;font-weight:700;color:${pdfFg};border:1.5px solid ${pdfFg}22;">${typeLabel.charAt(0)}</div>` : ''}
           </div>`
        : `<p class="qr-text">${container.qrCodeData}</p>`;

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, sans-serif; padding: 32px; background: #fff; }
  .label { max-width: 400px; margin: 0 auto; border: 1.5px solid #E5E5EA; border-radius: 16px; padding: 28px; }
  .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .type-badge { background: #F2F2F7; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 600; color: #3A3A3C; white-space: nowrap; }
  h1 { font-size: 22px; font-weight: 800; color: #000; flex: 1; }
  .meta { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
  .badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-status { background: #E3F2FD; color: #007AFF; }
  .badge-priority { background: #FFEBEE; color: #FF3B30; }
  .section-title { font-size: 12px; font-weight: 700; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  ul { list-style: none; padding: 0; }
  ul li { font-size: 14px; color: #3A3A3C; padding: 5px 0; border-bottom: 1px solid #F2F2F7; }
  .qr-section { margin-top: 20px; text-align: center; }
  .qr-name { font-size: 15px; font-weight: 700; color: #000; margin-top: 10px; }
  .qr-text { font-size: 11px; color: #8E8E93; font-family: monospace; margin-top: 8px; word-break: break-all; }
</style>
</head>
<body>
<div class="label">
  <div class="header">
    <h1>${container.name}</h1>
    <span class="type-badge">${typeLabel}</span>
  </div>
  <div class="meta">
    <span class="badge badge-status">${statusLabels[container.status]}</span>
    <span class="badge badge-priority">${priorityLabel}</span>
  </div>
  ${(container.items?.length ?? 0) > 0 ? `
  <div style="margin-bottom:18px;">
    <div class="section-title">Objets</div>
    <ul>${itemsList}</ul>
  </div>` : ''}
  <div class="qr-section">
    <div class="section-title" style="margin-bottom:12px;">QR Code</div>
    ${qrImg}
    <div class="qr-name">${container.name}</div>
  </div>
</div>
</body>
</html>`;

      try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: "Exporter l'étiquette",
          UTI: 'com.adobe.pdf',
        });
      } catch {
        Alert.alert('Erreur', 'Impossible de générer le PDF.');
      }
    };

    if (qrSvgRef.current?.toDataURL) {
      qrSvgRef.current.toDataURL((data: string) =>
        generate(`data:image/png;base64,${data}`)
      );
    } else {
      generate();
    }
  };

  const handlePrint = async () => {
    if (!container) return;
    if (printerStatus !== 'connected') {
      Alert.alert(
        'Imprimante non connectée',
        "Connectez l'imprimante ou exportez en PDF.",
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Exporter en PDF', onPress: handleExportPDF },
          { text: 'Réglages', onPress: () => router.push('/(tabs)/settings') },
        ]
      );
      return;
    }
    setPrinting(true);
    try {
      await printSticker({
        containerName: container.name,
        containerNumber: containers.indexOf(container) + 1,
        roomName: undefined,
        items: (container.items ?? []).map(i => i.name).slice(0, 3),
        qrCodeData: container.qrCodeData,
        type: container.type,
        priority: container.priority,
      });
    } catch {
      Alert.alert('Erreur', "Impression échouée.");
    } finally {
      setPrinting(false);
    }
  };

  const handleDelete = () => {
    if (!container) return;
    Alert.alert('Supprimer le carton', 'Cette action est irréversible. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteContainer(container.id);
          router.back();
        },
      },
    ]);
  };

  if (!container) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const statusColor = Colors.containerStatus[container.status];
  const priorityColor = Colors.priority[container.priority];
  const currentStatusIndex = statusFlow.indexOf(container.status);
  const photos = container.photos ?? [];

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconBg}>
            <Ionicons name={typeIcons[container.type]} size={26} color={Colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{container.name}</Text>
            {container.description && (
              <Text style={styles.description}>{container.description}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={openEditModal}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          <TMBBadge
            label={statusLabels[container.status]}
            color={statusColor.bg}
            textColor={statusColor.text}
          />
          <TMBBadge
            label={priorityLabels[container.priority]}
            color={priorityColor.bg}
            textColor={priorityColor.text}
          />
          {container.isScannedOnArrival && (
            <TMBBadge
              label="Scanné"
              color={Colors.status.successLight}
              textColor={Colors.status.success}
              icon="checkmark-circle"
            />
          )}
        </View>

        {/* Status flow */}
        <TMBCard style={styles.statusCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>État du carton</Text>
            {updatingStatus && <ActivityIndicator size="small" color={Colors.primary} />}
          </View>
          <View style={styles.statusFlow}>
            {statusFlow.map((status, index) => {
              const isCurrent = status === container.status;
              const isPast = index < currentStatusIndex;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusBtn,
                    isCurrent && styles.statusBtnCurrent,
                    isPast && styles.statusBtnPast,
                  ]}
                  onPress={() => { if (!isCurrent) handleStatusChange(status); }}
                  disabled={isCurrent || updatingStatus}
                >
                  <Text style={[styles.statusBtnText, (isCurrent || isPast) && styles.statusBtnTextActive]}>
                    {statusLabels[status]}
                  </Text>
                  {isPast && (
                    <Ionicons name="checkmark" size={12} color={Colors.status.success} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TMBCard>

        {/* Items */}
        <TMBCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Objets ({container.items?.length ?? 0})</Text>
            <TouchableOpacity onPress={() => setShowAddItem(true)} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {(container.items?.length ?? 0) === 0 ? (
            <Pressable style={styles.emptyAction} onPress={() => setShowAddItem(true)}>
              <Ionicons name="cube-outline" size={18} color={Colors.text.muted} />
              <Text style={styles.emptyActionText}>Ajouter le premier objet</Text>
            </Pressable>
          ) : (
            container.items?.map(item => (
              <ItemRow key={item.id} item={item} onDelete={() => handleDeleteItem(item.id)} />
            ))
          )}
        </TMBCard>

        {/* Photos */}
        <TMBCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Photos ({photos.length})</Text>
            <TouchableOpacity onPress={handlePhotoPress} style={styles.addBtn} disabled={uploadingPhotos}>
              {uploadingPhotos ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="camera-outline" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          {photos.length === 0 ? (
            <Pressable style={styles.emptyAction} onPress={handlePhotoPress}>
              <Ionicons name="images-outline" size={18} color={Colors.text.muted} />
              <Text style={styles.emptyActionText}>Ajouter une photo</Text>
            </Pressable>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => openLightbox(index)}
                  onLongPress={() => handleDeletePhoto(photo.id)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: photo.url }} style={styles.photoThumb} />
                  {!!photo.caption && (
                    <Text style={styles.photoCaption} numberOfLines={1}>{photo.caption}</Text>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.photoAddThumb}
                onPress={handlePhotoPress}
                disabled={uploadingPhotos}
              >
                {uploadingPhotos ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="add" size={22} color={Colors.grey[400]} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </TMBCard>

        {/* QR Code */}
        <TMBCard style={styles.section}>
          <Text style={styles.sectionLabel}>QR Code</Text>
          <View style={styles.qrContainer}>
            <View style={[
              styles.qrWrapper,
              qrShape === 'rounded' && { borderRadius: 16, overflow: 'hidden' as const },
              qrShape === 'circle'  && { borderRadius: 90, overflow: 'hidden' as const },
            ]}>
              <QRCode
                ref={qrSvgRef}
                data={container.qrCodeData}
                size={160}
                style={{ backgroundColor: qrBg }}
                color={qrFg}
                {...getModuleProps(qrModule)}
                outerEyesOptions={getEyeProps(qrEye).outer}
                innerEyesOptions={getEyeProps(qrEye).inner}
              />
              {qrShowLogo && (
                <View style={styles.qrIconOverlay} pointerEvents="none">
                  <View style={[styles.qrIconBg, { backgroundColor: qrBg }]}>
                    <Ionicons name={typeIcons[container.type]} size={18} color={qrFg} />
                  </View>
                </View>
              )}
            </View>
            <Text style={styles.qrNameLabel}>{container.name}</Text>
            <Text style={styles.qrCodeText} numberOfLines={2}>{container.qrCodeData}</Text>
          </View>
          <TMBButton
            title={printing ? "Impression..." : "Imprimer l'étiquette"}
            onPress={handlePrint}
            variant="secondary"
            icon="print-outline"
            size="sm"
            style={styles.printBtn}
            loading={printing}
            disabled={printing}
          />
        </TMBCard>

        {/* Third party */}
        {container.isThirdParty && (
          <TMBCard style={styles.section}>
            <Text style={styles.sectionLabel}>Tiers dépositaire</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{container.thirdPartyOwner || 'Non renseigné'}</Text>
            </View>
            {container.returnDate && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoText}>Retour : {container.returnDate}</Text>
              </View>
            )}
          </TMBCard>
        )}

        {/* Notes */}
        {container.notes && (
          <TMBCard style={styles.section}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notesText}>{container.notes}</Text>
          </TMBCard>
        )}

        {/* Delete */}
        <View style={styles.dangerZone}>
          <TMBButton
            title="Supprimer ce carton"
            onPress={handleDelete}
            variant="danger"
            icon="trash-outline"
            size="md"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Container Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable style={modal.backdrop} onPress={() => setShowEditModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={modal.sheet} onStartShouldSetResponder={() => true}>
              <View style={modal.handle} />
              <Text style={modal.title}>Modifier le carton</Text>

              <View style={modal.inputGroup}>
                <Text style={modal.label}>Nom *</Text>
                <TextInput
                  style={modal.input}
                  placeholder="Nom du carton"
                  placeholderTextColor={Colors.grey[400]}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  returnKeyType="next"
                />
              </View>

              <View style={modal.inputGroup}>
                <Text style={modal.label}>Description</Text>
                <TextInput
                  style={[modal.input, { minHeight: 72, textAlignVertical: 'top' }]}
                  placeholder="Description optionnelle..."
                  placeholderTextColor={Colors.grey[400]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  returnKeyType="done"
                />
              </View>

              <View style={modal.buttons}>
                <Pressable style={modal.cancelBtn} onPress={() => setShowEditModal(false)}>
                  <Text style={modal.cancelBtnText}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={[modal.confirmBtn, (!editName.trim() || savingEdit) && modal.confirmBtnDisabled]}
                  onPress={handleSaveEdit}
                  disabled={!editName.trim() || savingEdit}
                >
                  {savingEdit
                    ? <ActivityIndicator size="small" color={Colors.surface} />
                    : <Text style={modal.confirmBtnText}>Enregistrer</Text>
                  }
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItem}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddItem(false);
          setNewItemName('');
          setNewItemCategory('');
        }}
      >
        <Pressable
          style={modal.backdrop}
          onPress={() => {
            setShowAddItem(false);
            setNewItemName('');
            setNewItemCategory('');
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
          <Pressable style={modal.sheet} onPress={() => {}}>
            <View style={modal.handle} />
            <Text style={modal.title}>Ajouter un objet</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={modal.suggestionsScroll}
              contentContainerStyle={modal.suggestionsContent}
            >
              {ITEM_SUGGESTIONS.map(s => (
                <Pressable
                  key={s}
                  style={[modal.chip, newItemName === s && modal.chipActive]}
                  onPress={() => setNewItemName(s)}
                >
                  <Text style={[modal.chipText, newItemName === s && modal.chipTextActive]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={modal.inputGroup}>
              <Text style={modal.label}>Nom de l'objet *</Text>
              <TextInput
                style={modal.input}
                placeholder="Ex: Lampe de salon"
                placeholderTextColor={Colors.grey[400]}
                value={newItemName}
                onChangeText={setNewItemName}
                autoFocus
                returnKeyType="next"
              />
            </View>

            <View style={modal.inputGroup}>
              <Text style={modal.label}>Catégorie (optionnel)</Text>
              <TextInput
                style={modal.input}
                placeholder="Ex: Électroménager"
                placeholderTextColor={Colors.grey[400]}
                value={newItemCategory}
                onChangeText={setNewItemCategory}
                returnKeyType="done"
                onSubmitEditing={handleConfirmAddItem}
              />
            </View>

            <View style={modal.buttons}>
              <Pressable
                style={modal.cancelBtn}
                onPress={() => {
                  setShowAddItem(false);
                  setNewItemName('');
                  setNewItemCategory('');
                }}
              >
                <Text style={modal.cancelBtnText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[
                  modal.confirmBtn,
                  (!newItemName.trim() || addingItem) && modal.confirmBtnDisabled,
                ]}
                onPress={handleConfirmAddItem}
                disabled={!newItemName.trim() || addingItem}
              >
                {addingItem ? (
                  <ActivityIndicator size="small" color={Colors.surface} />
                ) : (
                  <Text style={modal.confirmBtnText}>Ajouter</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Photo Annotation Modal */}
      <Modal
        visible={showAnnotateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAnnotateModal(false)}
      >
        <Pressable style={modal.backdrop} onPress={() => setShowAnnotateModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={modal.sheet} onStartShouldSetResponder={() => true}>
              <View style={modal.handle} />

              <Text style={modal.title}>
                {pendingAssets.length > 1
                  ? `${pendingAssets.length} photos sélectionnées`
                  : '1 photo sélectionnée'}
              </Text>

              {/* Thumbnails preview */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={annot.thumbsScroll}
                contentContainerStyle={annot.thumbsContent}
              >
                {pendingAssets.map((asset, i) => (
                  <Image key={i} source={{ uri: asset.uri }} style={annot.thumb} />
                ))}
              </ScrollView>

              {/* Caption */}
              <View style={modal.inputGroup}>
                <Text style={modal.label}>Description (optionnel)</Text>
                <TextInput
                  style={modal.input}
                  placeholder="Ex: Vue de face, fragile..."
                  placeholderTextColor={Colors.grey[400]}
                  value={photoCaption}
                  onChangeText={setPhotoCaption}
                  returnKeyType="done"
                />
              </View>

              {/* Link to item */}
              {(container?.items?.length ?? 0) > 0 && (
                <View style={modal.inputGroup}>
                  <Text style={modal.label}>Lier à un objet (optionnel)</Text>
                  <ScrollView
                    style={annot.itemListScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    <Pressable
                      style={[annot.itemRow, photoLinkedItemId === null && annot.itemRowActive]}
                      onPress={() => setPhotoLinkedItemId(null)}
                    >
                      <Ionicons
                        name={photoLinkedItemId === null ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={photoLinkedItemId === null ? Colors.primary : Colors.grey[400]}
                      />
                      <Text style={annot.itemRowText}>Aucun objet</Text>
                    </Pressable>
                    {container?.items?.map(item => (
                      <Pressable
                        key={item.id}
                        style={[annot.itemRow, photoLinkedItemId === item.id && annot.itemRowActive]}
                        onPress={() => setPhotoLinkedItemId(item.id)}
                      >
                        <Ionicons
                          name={photoLinkedItemId === item.id ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={photoLinkedItemId === item.id ? Colors.primary : Colors.grey[400]}
                        />
                        <Text style={annot.itemRowText} numberOfLines={1}>{item.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Buttons */}
              <View style={modal.buttons}>
                <Pressable style={modal.cancelBtn} onPress={() => setShowAnnotateModal(false)}>
                  <Text style={modal.cancelBtnText}>Annuler</Text>
                </Pressable>
                <Pressable style={modal.confirmBtn} onPress={handleConfirmPhotos}>
                  <Ionicons name="cloud-upload-outline" size={16} color={Colors.surface} />
                  <Text style={modal.confirmBtnText}>
                    {pendingAssets.length > 1
                      ? `Envoyer ${pendingAssets.length} photos`
                      : 'Envoyer la photo'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Photo Lightbox */}
      <Modal
        visible={lightboxVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setLightboxVisible(false)}
        onShow={() => {
          if (lightboxRef.current && photos.length > 1) {
            lightboxRef.current.scrollToIndex({ index: lightboxIndex, animated: false });
          }
        }}
      >
        <View style={lb.container}>
          {/* Close button */}
          <TouchableOpacity
            style={lb.closeBtn}
            onPress={() => setLightboxVisible(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Counter */}
          {photos.length > 1 && (
            <View style={lb.counter}>
              <Text style={lb.counterText}>{lightboxIndex + 1} / {photos.length}</Text>
            </View>
          )}

          {/* Photo swipe list */}
          <FlatList
            ref={lightboxRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            initialScrollIndex={lightboxIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_W,
              offset: SCREEN_W * index,
              index,
            })}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setLightboxIndex(idx);
            }}
            renderItem={({ item }) => (
              <View style={lb.slide}>
                <Image
                  source={{ uri: item.url }}
                  style={lb.image}
                  resizeMode="contain"
                />
                {!!item.caption && (
                  <View style={lb.captionBar}>
                    <Text style={lb.captionText}>{item.caption}</Text>
                  </View>
                )}
              </View>
            )}
          />

          {/* Dots indicator */}
          {photos.length > 1 && (
            <View style={lb.dots}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[lb.dot, i === lightboxIndex && lb.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background, gap: 12,
  },
  loadingText: { fontSize: 15, color: Colors.text.secondary },
  content: { padding: 16 },

  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  headerIconBg: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: Colors.navy.ghost, alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.3 },
  description: { fontSize: 14, color: Colors.text.secondary, marginTop: 2 },
  editBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.navy.ghost, alignItems: 'center', justifyContent: 'center',
  },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },

  statusCard: { marginBottom: 12 },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  statusFlow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  statusBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: Colors.grey[100],
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 4,
  },
  statusBtnCurrent: {
    backgroundColor: Colors.navy.ghost,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  statusBtnPast: { backgroundColor: Colors.status.successLight },
  statusBtnText: { fontSize: 11, fontWeight: '600', color: Colors.text.muted },
  statusBtnTextActive: { color: Colors.text.primary },

  section: { marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  addBtn: { padding: 4 },

  emptyAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 20,
    backgroundColor: Colors.grey[50], borderRadius: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyActionText: { fontSize: 14, color: Colors.text.muted },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  photoThumb: { width: 76, height: 76, borderRadius: 10 },
  photoCaption: { fontSize: 11, color: Colors.text.muted, marginTop: 3, maxWidth: 76 },
  photoAddThumb: {
    width: 76, height: 76, borderRadius: 10,
    backgroundColor: Colors.grey[50],
    borderWidth: 1, borderColor: Colors.borderLight, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },

  qrContainer: { alignItems: 'center', paddingVertical: 16 },
  qrWrapper: {
    padding: 16, backgroundColor: Colors.surface,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.borderLight,
    marginBottom: 10,
    position: 'relative',
  },
  qrIconOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconBg: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  qrNameLabel: {
    fontSize: 14, fontWeight: '700', color: Colors.text.primary,
    marginBottom: 4, textAlign: 'center',
  },
  qrCodeText: {
    fontSize: 11, color: Colors.text.muted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center', maxWidth: 240,
  },
  printBtn: { marginTop: 8 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  infoText: { fontSize: 14, color: Colors.text.primary },

  notesText: {
    fontSize: 14, color: Colors.text.secondary, lineHeight: 20, marginTop: 6,
  },
  dangerZone: {
    marginTop: 20, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
});

const modal = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36, height: 4, backgroundColor: Colors.grey[300],
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginBottom: 16 },

  suggestionsScroll: { marginHorizontal: -20, marginBottom: 16 },
  suggestionsContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.grey[100],
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary },
  chipTextActive: { color: Colors.surface, fontWeight: '600' },

  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: '600', color: Colors.text.muted,
    textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6,
  },
  input: {
    fontSize: 16, color: Colors.text.primary,
    backgroundColor: Colors.grey[50],
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },

  buttons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.grey[100], alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: Colors.text.secondary },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  confirmBtnDisabled: { backgroundColor: Colors.grey[300] },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: Colors.surface },
});

const annot = StyleSheet.create({
  thumbsScroll: { marginHorizontal: -20, marginBottom: 16, height: 80 },
  thumbsContent: { paddingHorizontal: 20, gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 10 },
  itemListScroll: { maxHeight: 160 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 4,
    backgroundColor: Colors.grey[50],
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  itemRowActive: { borderColor: Colors.primary, backgroundColor: Colors.navy.ghost },
  itemRowText: { fontSize: 14, color: Colors.text.primary, flex: 1 },
});

const lb = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 32,
    right: 20,
    zIndex: 10,
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 36,
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  counterText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  slide: {
    width: SCREEN_W,
    height: SCREEN_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  captionBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0, right: 0,
    paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captionText: { fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 20 },
  dots: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: { backgroundColor: '#fff', width: 18 },
});
