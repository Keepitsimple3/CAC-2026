import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MeshBrand, StatusColor } from '@/constants/mesh-colors';
import {
  MOCK_PEERS,
  STATUS_LABEL,
  type MeshStatus,
} from '@/constants/mock-mesh-data';
import { Spacing } from '@/constants/theme';

type FilterKey = 'all' | MeshStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: 'Safe' },
  { key: 'help', label: 'Need Help' },
  { key: 'sos', label: 'SOS' },
];

export default function DevicesScreen() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    return MOCK_PEERS.reduce(
      (acc, peer) => {
        acc[peer.status] += 1;
        return acc;
      },
      { safe: 0, help: 0, sos: 0 } as Record<MeshStatus, number>,
    );
  }, []);

  const filteredPeers = useMemo(() => {
    const peers =
      filter === 'all'
        ? [...MOCK_PEERS]
        : MOCK_PEERS.filter((peer) => peer.status === filter);

    /*
     * All:
     * SOS → Need Help → Safe
     *
     * Within each status:
     * closest → farthest
     *
     * Individual filters:
     * closest → farthest
     */
    if (filter === 'all') {
      const priority: Record<MeshStatus, number> = {
        sos: 0,
        help: 1,
        safe: 2,
      };

      return peers.sort((a, b) => {
        const priorityDifference =
          priority[a.status] - priority[b.status];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return a.distanceMi - b.distanceMi;
      });
    }

    return peers.sort((a, b) => a.distanceMi - b.distanceMi);
  }, [filter]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Ionicons
                  name="triangle-outline"
                  size={22}
                  color={MeshBrand.forest}
                />
              </View>

              <View>
                <ThemedText style={styles.brandTitle}>
                  Devices
                </ThemedText>

                <ThemedText style={styles.brandTagline}>
                  {MOCK_PEERS.length} in your mesh
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Status summary */}
          <View style={styles.summaryRow}>
            <SummaryPill
              status="safe"
              count={counts.safe}
            />

            <SummaryPill
              status="help"
              count={counts.help}
            />

            <SummaryPill
              status="sos"
              count={counts.sos}
            />
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((filterOption) => {
              const active = filter === filterOption.key;

              return (
                <Pressable
                  key={filterOption.key}
                  onPress={() => setFilter(filterOption.key)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    active && styles.filterChipActive,
                    pressed && styles.filterChipPressed,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {filterOption.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Device list */}
          <View style={styles.list}>
            {filteredPeers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="radio-outline"
                  size={28}
                  color={MeshBrand.muted}
                />

                <ThemedText style={styles.emptyText}>
                  No devices match this filter
                </ThemedText>
              </View>
            ) : (
              filteredPeers.map((peer) => {
                const colors = StatusColor[peer.status];

                const icon =
                  peer.status === 'safe'
                    ? 'shield-checkmark'
                    : peer.status === 'help'
                      ? 'hand-left'
                      : 'alert';

                return (
                  <Pressable
                    key={peer.id}
                    style={({ pressed }) => [
                      styles.peerCard,
                      pressed && styles.peerCardPressed,
                    ]}
                  >
                    {/* Status icon */}
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor: colors.bg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={icon as any}
                        size={20}
                        color={colors.fg}
                      />
                    </View>

                    {/* Name + status */}
                    <View style={styles.peerInfo}>
                      <ThemedText style={styles.peerName}>
                        {peer.name}
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.peerStatus,
                          {
                            color: colors.fg,
                          },
                        ]}
                      >
                        {STATUS_LABEL[peer.status]}
                      </ThemedText>
                    </View>

                    {/* Distance + last update */}
                    <View style={styles.peerMeta}>
                      <ThemedText style={styles.peerDistance}>
                        {peer.distanceMi} mi
                      </ThemedText>

                      <ThemedText style={styles.peerTime}>
                        {peer.lastUpdate}
                      </ThemedText>
                    </View>

                    {/* Chevron */}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={MeshBrand.muted}
                    />
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryPill({
  status,
  count,
}: {
  status: MeshStatus;
  count: number;
}) {
  const colors = StatusColor[status];

  return (
    <View
      style={[
        styles.summaryPill,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.summaryCount,
          {
            color: colors.fg,
          },
        ]}
      >
        {count}
      </ThemedText>

      <ThemedText
        style={[
          styles.summaryLabel,
          {
            color: colors.fg,
          },
        ]}
      >
        {STATUS_LABEL[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MeshBrand.cream,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },

  content: {
    paddingBottom: Spacing.six,
  },

  // ─────────────────────────────
  // Header
  // ─────────────────────────────

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },

  logoMark: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,

    alignItems: 'center',
    justifyContent: 'center',
  },

  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MeshBrand.forest,
  },

  brandTagline: {
    fontSize: 12,
    color: MeshBrand.muted,
    marginTop: 2,
  },

  // ─────────────────────────────
  // Status summary
  // ─────────────────────────────

  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },

  summaryPill: {
    flex: 1,

    borderRadius: Spacing.three,

    paddingVertical: Spacing.two,

    alignItems: 'center',
    justifyContent: 'center',

    gap: 2,
  },

  summaryCount: {
    fontSize: 18,
    fontWeight: '800',
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ─────────────────────────────
  // Filters
  // ─────────────────────────────

  filterRow: {
    gap: Spacing.two,

    paddingVertical: 2,
    paddingBottom: Spacing.three,

    alignItems: 'center',
  },

  filterChip: {
    height: 36,
    minWidth: 58,

    paddingHorizontal: Spacing.three,

    borderRadius: 999,

    backgroundColor: MeshBrand.card,

    alignItems: 'center',
    justifyContent: 'center',
  },

  filterChipActive: {
    backgroundColor: MeshBrand.forest,
  },

  filterChipPressed: {
    opacity: 0.7,
  },

  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: MeshBrand.forest,
  },

  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // ─────────────────────────────
  // Device list
  // ─────────────────────────────

  list: {
    gap: Spacing.two,
  },

  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: Spacing.two,

    backgroundColor: MeshBrand.card,

    borderRadius: Spacing.three,

    padding: Spacing.three,
  },

  peerCardPressed: {
    opacity: 0.75,
  },

  avatar: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',
  },

  peerInfo: {
    flex: 1,
  },

  peerName: {
    fontSize: 15,
    fontWeight: '600',
    color: MeshBrand.forest,
  },

  peerStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },

  peerMeta: {
    alignItems: 'flex-end',
  },

  peerDistance: {
    fontSize: 13,
    color: MeshBrand.forest,
  },

  peerTime: {
    fontSize: 11,
    color: MeshBrand.muted,
  },

  // ─────────────────────────────
  // Empty state
  // ─────────────────────────────

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',

    gap: Spacing.two,

    paddingVertical: Spacing.six,
  },

  emptyText: {
    fontSize: 13,
    color: MeshBrand.muted,
  },
});