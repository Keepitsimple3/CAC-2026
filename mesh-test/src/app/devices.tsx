import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MeshBrand, StatusColor } from '@/constants/mesh-colors';
import { MOCK_PEERS, STATUS_LABEL, type MeshStatus } from '@/constants/mock-mesh-data';
import { Spacing } from '@/constants/theme';

type FilterKey = 'all' | MeshStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: "Safe" },
  { key: 'help', label: 'Need Help' },
  { key: 'sos', label: 'SOS' },
];

export default function DevicesScreen() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    return MOCK_PEERS.reduce(
      (acc, p) => {
        acc[p.status] += 1;
        return acc;
      },
      { safe: 0, help: 0, sos: 0 } as Record<MeshStatus, number>,
    );
  }, []);

  const filteredPeers = useMemo(() => {
    if (filter === 'all') return MOCK_PEERS;
    return MOCK_PEERS.filter((p) => p.status === filter);
  }, [filter]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <View>
            <ThemedText style={styles.title}>Devices</ThemedText>
            <ThemedText style={styles.subtitle}>{MOCK_PEERS.length} in your mesh</ThemedText>
          </View>
          <Pressable style={styles.mapButton}>
            <Ionicons name="map-outline" size={18} color={MeshBrand.forest} />
          </Pressable>
        </View>

        {/* Status summary strip */}
        <View style={styles.summaryRow}>
          <SummaryPill status="safe" count={counts.safe} />
          <SummaryPill status="help" count={counts.help} />
          <SummaryPill status="sos" count={counts.sos} />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <ThemedText style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Peer list */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filteredPeers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="radio-outline" size={28} color={MeshBrand.muted} />
              <ThemedText style={styles.emptyText}>No devices match this filter</ThemedText>
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
                <Pressable key={peer.id} style={styles.peerCard}>
                  <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
                    <Ionicons name={icon as any} size={20} color={colors.fg} />
                  </View>
                  <View style={styles.peerInfo}>
                    <ThemedText style={styles.peerName}>{peer.name}</ThemedText>
                    <ThemedText style={[styles.peerStatus, { color: colors.fg }]}>
                      {STATUS_LABEL[peer.status]}
                    </ThemedText>
                  </View>
                  <View style={styles.peerMeta}>
                    <ThemedText style={styles.peerDistance}>{peer.distanceMi} mi</ThemedText>
                    <ThemedText style={styles.peerTime}>{peer.lastUpdate}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={MeshBrand.muted} />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryPill({ status, count }: { status: MeshStatus; count: number }) {
  const colors = StatusColor[status];
  return (
    <View style={[styles.summaryPill, { backgroundColor: colors.bg }]}>
      <ThemedText style={[styles.summaryCount, { color: colors.fg }]}>{count}</ThemedText>
      <ThemedText style={[styles.summaryLabel, { color: colors.fg }]}>
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
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MeshBrand.forest,
  },
  subtitle: {
    fontSize: 12,
    color: MeshBrand.muted,
    marginTop: 2,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MeshBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryPill: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
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
  filterRow: {
    gap: Spacing.two,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 999,
    backgroundColor: MeshBrand.card,
  },
  filterChipActive: {
    backgroundColor: MeshBrand.forest,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: MeshBrand.forest,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: MeshBrand.card,
    borderRadius: Spacing.three,
    padding: Spacing.three,
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