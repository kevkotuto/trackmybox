import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Item } from '@/types';
import TMBBadge from '@/components/ui/TMBBadge';

interface ItemRowProps {
  item: Item;
  onDelete?: () => void;
}

export default function ItemRow({ item, onDelete }: ItemRowProps) {
  const [showDelete, setShowDelete] = React.useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onLongPress={() => setShowDelete(!showDelete)}
      >
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="image-outline" size={20} color={Colors.grey[300]} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.meta}>
            {item.category && (
              <TMBBadge
                label={item.category}
                color={Colors.navy.ghost}
                textColor={Colors.navy.medium}
              />
            )}
            {item.isFragile && (
              <View style={styles.fragile}>
                <Ionicons name="warning-outline" size={12} color={Colors.status.warning} />
                <Text style={styles.fragileText}>Fragile</Text>
              </View>
            )}
          </View>
        </View>

        {item.estimatedValue != null && item.estimatedValue > 0 && (
          <Text style={styles.value}>{item.estimatedValue} \u20ac</Text>
        )}
      </TouchableOpacity>

      {showDelete && onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.text.inverse} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fragile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  fragileText: {
    fontSize: 11,
    color: Colors.status.warning,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: Colors.status.error,
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
