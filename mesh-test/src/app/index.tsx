import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MeshBrand, StatusColor } from '@/constants/mesh-colors';
import { MOCK_PEERS, type MeshStatus } from '@/constants/mock-mesh-data';
import { Spacing } from '@/constants/theme';

const RESOURCES = [
  { id: 'weather', icon: 'rainy-outline' as const, title: 'Hurricane\nUpdates', hint: 'Live alerts' },
  { id: 'guides', icon: 'medkit-outline' as const, title: 'Emergency\nGuides', hint: 'Be prepared' },
  { id: 'channels', icon: 'radio-outline' as const, title: 'Local\nChannels', hint: 'Tune in' },
  { id: 'shelters', icon: 'location-outline' as const, title: 'Shelter\nFinder', hint: 'Find nearby' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [myStatus, setMyStatus] = useState<MeshStatus>('safe');

  const previewPeers = MOCK_PEERS.slice(0, 4);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Ionicons name="triangle-outline" size={22} color={MeshBrand.forest} />
              </View>
              <View>
                <ThemedText style={styles.brandTitle}>Mesh Aid</ThemedText>
                <ThemedText style={styles.brandTagline}>Local connection. Real support.</ThemedText>
              </View>
            </View>
            <Pressable style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={20} color={MeshBrand.forest} />
              <View style={styles.bellDot} />
            </Pressable>
          </View>

          <Pressable style={styles.connectionPill} onPress={() => router.push('/devices')}>
            <View style={styles.connectionDot} />
            <View style={styles.connectionTextWrap}>
              <ThemedText style={styles.connectionTitle}>Connected</ThemedText>
              <ThemedText style={styles.connectionSubtitle}>
                Mesh: {MOCK_PEERS.length} devices
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={MeshBrand.muted} />
          </Pressable>

          {/* Your status */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardEyebrow}>YOUR STATUS</ThemedText>
              <View style={styles.broadcastingRow}>
                <Ionicons name="radio-outline" size={14} color={MeshBrand.moss} />
                <ThemedText style={styles.broadcastingText}>Broadcasting</ThemedText>
              </View>
            </View>

            <View style={styles.statusGrid}>
              <StatusButton
                status="safe"
                icon="shield-checkmark"
                label="I'm Safe"
                sublabel="All good here"
                active={myStatus === 'safe'}
                onPress={() => setMyStatus('safe')}
              />
              <StatusButton
                status="help"
                icon="hand-left"
                label="Need Help"
                sublabel="I need assistance"
                active={myStatus === 'help'}
                onPress={() => setMyStatus('help')}
              />
              <StatusButton
                status="sos"
                icon="alert-circle"
                label="SOS"
                sublabel="Emergency"
                active={myStatus === 'sos'}
                onPress={() => setMyStatus('sos')}
              />
            </View>

            <View style={styles.updatedRow}>
              <Ionicons name="refresh-outline" size={14} color={MeshBrand.muted} />
              <ThemedText style={styles.updatedText}>Updated just now</ThemedText>
            </View>
          </View>

          {/* Nearby devices */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardEyebrow}>NEARBY DEVICES</ThemedText>
              <Pressable style={styles.viewMapRow} onPress={() => router.push('/devices')}>
                <ThemedText style={styles.viewMapText}>View map</ThemedText>
                <Ionicons name="map-outline" size={16} color={MeshBrand.forest} />
              </Pressable>
            </View>

            <View style={styles.peerList}>
              {previewPeers.map((peer, i) => (
                <View
                  key={peer.id}
                  style={[styles.peerRow, i < previewPeers.length - 1 && styles.peerRowDivider]}
                >
                  <StatusAvatar status={peer.status} />
                  <View style={styles.peerInfo}>
                    <ThemedText style={styles.peerName}>{peer.name}</ThemedText>
                    <ThemedText style={[styles.peerStatus, { color: StatusColor[peer.status].fg }]}>
                      {statusLabel(peer.status)}
                    </ThemedText>
                  </View>
                  <View style={styles.peerMeta}>
                    <ThemedText style={styles.peerDistance}>{peer.distanceMi} mi</ThemedText>
                    <ThemedText style={styles.peerTime}>{peer.lastUpdate}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={MeshBrand.muted} />
                </View>
              ))}
            </View>

            <Pressable style={styles.seeAllRow} onPress={() => router.push('/devices')}>
              <ThemedText style={styles.seeAllText}>See all nearby</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={MeshBrand.forest} />
            </Pressable>
          </View>

          {/* Resources */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardEyebrow}>RESOURCES</ThemedText>
              <ThemedText style={styles.seeAllInlineText}>See all</ThemedText>
            </View>
            <View style={styles.resourceGrid}>
              {RESOURCES.map((r) => (
                <Pressable key={r.id} style={styles.resourceTile}>
                  <View style={styles.resourceIconWrap}>
                    <Ionicons name={r.icon} size={22} color={MeshBrand.forest} />
                  </View>
                  <ThemedText style={styles.resourceTitle}>{r.title}</ThemedText>
                  <ThemedText style={styles.resourceHint}>{r.hint}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function statusLabel(status: MeshStatus) {
  if (status === 'safe') return "I'm Safe";
  if (status === 'help') return 'Need Help';
  return 'SOS';
}

function StatusAvatar({ status }: { status: MeshStatus }) {
  const icon = status === 'safe' ? 'shield-checkmark' : status === 'help' ? 'hand-left' : 'alert';
  const colors = StatusColor[status];
  return (
    <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
      <Ionicons name={icon as any} size={18} color={colors.fg} />
      <View style={[styles.avatarDot, { backgroundColor: colors.fg }]} />
    </View>
  );
}

function StatusButton({
  status,
  icon,
  label,
  sublabel,
  active,
  onPress,
}: {
  status: MeshStatus;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = StatusColor[status];
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.statusButton,
        { backgroundColor: colors.bg },
        active && { borderColor: colors.fg, borderWidth: 2 },
      ]}
    >
      <Ionicons name={icon} size={26} color={colors.fg} />
      <ThemedText style={[styles.statusLabel, { color: colors.fg }]}>{label}</ThemedText>
      <ThemedText style={styles.statusSublabel}>{sublabel}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MeshBrand.cream,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
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
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MeshBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: StatusColor.safe.fg,
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: MeshBrand.card,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: StatusColor.safe.fg,
  },
  connectionTextWrap: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MeshBrand.forest,
  },
  connectionSubtitle: {
    fontSize: 12,
    color: MeshBrand.muted,
  },
  card: {
    backgroundColor: MeshBrand.card,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: MeshBrand.forest,
  },
  broadcastingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  broadcastingText: {
    fontSize: 12,
    fontWeight: '600',
    color: MeshBrand.moss,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusButton: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  statusSublabel: {
    fontSize: 11,
    color: MeshBrand.muted,
    textAlign: 'center',
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: MeshBrand.cream,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
  },
  updatedText: {
    fontSize: 12,
    color: MeshBrand.muted,
  },
  viewMapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMapText: {
    fontSize: 13,
    fontWeight: '600',
    color: MeshBrand.forest,
  },
  peerList: {
    gap: 0,
  },
  peerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  peerRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MeshBrand.hairline,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: MeshBrand.card,
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
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: Spacing.two,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: MeshBrand.forest,
  },
  seeAllInlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: MeshBrand.forest,
  },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  resourceTile: {
    width: '47%',
    backgroundColor: MeshBrand.cream,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: 4,
  },
  resourceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Spacing.two,
    backgroundColor: MeshBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: MeshBrand.forest,
    lineHeight: 17,
  },
  resourceHint: {
    fontSize: 11,
    color: MeshBrand.moss,
    fontWeight: '600',
  },
});