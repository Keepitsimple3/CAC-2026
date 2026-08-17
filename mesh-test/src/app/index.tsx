import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  acceptConnection,
  BasePeer,
  onConnected,
  onDisconnected,
  onInvitationReceived,
  onPeerFound,
  onPeerLost,
  requestConnection,
  startAdvertise,
  startDiscovery,
  stopAdvertise,
  stopDiscovery,
  Strategy,
} from 'expo-nearby-connections';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const DEVICE_NAME = `${Platform.OS.toUpperCase()}_DEVICE_${Math.floor(Math.random() * 1000)}`;

async function requestAndroidPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const apiLevel = Number(Platform.Version);

    if (apiLevel >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
      ]);

      return Object.values(granted).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
  } catch (err) {
    console.warn('Permission request error:', err);
    return false;
  }
}

export default function HomeScreen() {
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredPeers, setDiscoveredPeers] = useState<BasePeer[]>([]);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);

  const isActionBusyRef = useRef(false);

  useEffect(() => {
    return () => {
      stopAdvertise().catch(() => {});
      stopDiscovery().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const unsubPeerFound = onPeerFound((peer) => {
      setDiscoveredPeers((prev) => {
        if (prev.some((p) => p.peerId === peer.peerId)) return prev;
        return [...prev, peer];
      });
    });

    const unsubPeerLost = onPeerLost(({ peerId }) => {
      setDiscoveredPeers((prev) => prev.filter((p) => p.peerId !== peerId));
    });

    const unsubInvitation = onInvitationReceived(({ peerId, name }) => {
      Alert.alert('Connection Request', `Accept connection from ${name}?`, [
        { text: 'Reject', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptConnection(peerId) },
      ]);
    });

    const unsubConnected = onConnected(({ peerId, name }) => {
      Alert.alert('Connected!', `Successfully connected to ${name}`);
      setConnectedPeers((prev) => [...prev, peerId]);
    });

    const unsubDisconnected = onDisconnected(({ peerId }) => {
      setConnectedPeers((prev) => prev.filter((id) => id !== peerId));
    });

    return () => {
      unsubPeerFound();
      unsubPeerLost();
      unsubInvitation();
      unsubConnected();
      unsubDisconnected();
    };
  }, []);

  const toggleAdvertise = async () => {
    if (isActionBusyRef.current) return;
    isActionBusyRef.current = true;

    try {
      if (isAdvertising) {
        await stopAdvertise();
        setIsAdvertising(false);
      } else {
        const hasPermissions = await requestAndroidPermissions();
        if (!hasPermissions) {
          Alert.alert('Permission Error', 'Location/Bluetooth permissions are required.');
          return;
        }

        await stopAdvertise().catch(() => {});
        await startAdvertise(DEVICE_NAME, Strategy.P2P_STAR);
        setIsAdvertising(true);
      }
    } catch (error: any) {
      if (error?.message?.includes('8001')) {
        setIsAdvertising(true);
      } else {
        Alert.alert('Error', 'Failed to start advertising. Check Bluetooth/Location.');
        console.error(error);
      }
    } finally {
      isActionBusyRef.current = false;
    }
  };

  const toggleDiscovery = async () => {
    if (isActionBusyRef.current) return;
    isActionBusyRef.current = true;

    try {
      if (isDiscovering) {
        await stopDiscovery();
        setIsDiscovering(false);
        setDiscoveredPeers([]);
      } else {
        const hasPermissions = await requestAndroidPermissions();
        if (!hasPermissions) {
          Alert.alert('Permission Error', 'Location/Bluetooth permissions are required.');
          return;
        }

        await stopDiscovery().catch(() => {});
        await startDiscovery(DEVICE_NAME, Strategy.P2P_STAR);
        setIsDiscovering(true);
      }
    } catch (error: any) {
      if (error?.message?.includes('8002')) {
        setIsDiscovering(true);
      } else {
        Alert.alert('Error', 'Failed to start discovery. Check Bluetooth/Location.');
        console.error(error);
      }
    } finally {
      isActionBusyRef.current = false;
    }
  };

  const handleConnect = async (peerId: string) => {
  // Guard against mock peers during testing
  if (peerId.startsWith('mock_')) {
    Alert.alert('Debug Info', 'Cannot connect natively to a simulated mock peer.');
    return;
  }

  try {
    await requestConnection(peerId);
  } catch (error: any) {
    if (error?.message?.includes('8011') || error?.code === 8011) {
      Alert.alert(
        'Device Unavailable',
        'This device is no longer advertising or went out of range.'
      );
      // Clean stale endpoint out of list
      setDiscoveredPeers((prev) => prev.filter((p) => p.peerId !== peerId));
    } else {
      Alert.alert('Error', 'Failed to send connection request.');
      console.error(error);
    }
  }
};

  // --- DEBUG TEST FUNCTIONS ---

  const debugResetAllNative = async () => {
    try {
      await stopAdvertise().catch(() => {});
      await stopDiscovery().catch(() => {});
      setIsAdvertising(false);
      setIsDiscovering(false);
      setDiscoveredPeers([]);
      setConnectedPeers([]);
      Alert.alert('Debug Reset', 'Stopped all native advertising/discovery and cleared state.');
    } catch (err) {
      console.error('Debug Reset Error:', err);
    }
  };

  const debugCheckPermissions = async () => {
    const apiLevel = Number(Platform.Version);
    if (Platform.OS !== 'android') {
      Alert.alert('Permissions', 'Not running on Android');
      return;
    }

    if (apiLevel >= 31) {
      const fineLoc = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const btScan = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      const btConnect = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      const btAdv = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE);

      Alert.alert(
        'Permissions (API 31+)',
        `Fine Loc: ${fineLoc}\nScan: ${btScan}\nConnect: ${btConnect}\nAdvertise: ${btAdv}`
      );
    } else {
      const fineLoc = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const coarseLoc = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

      Alert.alert(
        `Permissions (API ${apiLevel})`,
        `Fine Loc: ${fineLoc}\nCoarse Loc: ${coarseLoc}`
      );
    }
  };

  const debugAddMockPeer = () => {
    const mockId = `mock_${Math.floor(Math.random() * 10000)}`;
    const mockPeer: BasePeer = {
      peerId: mockId,
      name: `Mock Device ${mockId.slice(-4)}`,
    };
    setDiscoveredPeers((prev) => [...prev, mockPeer]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Device ID: {DEVICE_NAME}
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, isAdvertising && styles.buttonActive]}
            onPress={toggleAdvertise}
          >
            <ThemedText style={styles.buttonText}>
              {isAdvertising ? 'Stop Advertising' : 'Advertise'}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button, isDiscovering && styles.buttonActive]}
            onPress={toggleDiscovery}
          >
            <ThemedText style={styles.buttonText}>
              {isDiscovering ? 'Stop Discovery' : 'Discover'}
            </ThemedText>
          </Pressable>
        </View>

        {/* DEBUG BUTTONS PANEL */}
        <View style={styles.debugSection}>
          <ThemedText type="small" style={styles.debugHeader}>Debug Tools</ThemedText>
          <View style={styles.debugButtonRow}>
            <Pressable style={styles.debugButton} onPress={debugResetAllNative}>
              <ThemedText style={styles.debugButtonText}>Force Reset All</ThemedText>
            </Pressable>

            <Pressable style={styles.debugButton} onPress={debugCheckPermissions}>
              <ThemedText style={styles.debugButtonText}>Check Perms</ThemedText>
            </Pressable>

            <Pressable style={styles.debugButton} onPress={debugAddMockPeer}>
              <ThemedText style={styles.debugButtonText}>Add Mock Peer</ThemedText>
            </Pressable>
          </View>
        </View>

        <ThemedView style={styles.listSection}>
          <ThemedText type="subtitle">
            Discovered Devices ({discoveredPeers.length})
          </ThemedText>

          <FlatList
            data={discoveredPeers}
            keyExtractor={(item) => item.peerId}
            renderItem={({ item }) => {
              const isConnected = connectedPeers.includes(item.peerId);
              return (
                <View style={styles.peerCard}>
                  <View style={styles.peerInfo}>
                    <ThemedText style={styles.peerName}>{item.name}</ThemedText>
                    <ThemedText type="small">{item.peerId}</ThemedText>
                  </View>
                  <Pressable
                    style={[styles.connectButton, isConnected && styles.connectedButton]}
                    onPress={() => !isConnected && handleConnect(item.peerId)}
                    disabled={isConnected}
                  >
                    <ThemedText style={styles.connectButtonText}>
                      {isConnected ? 'Connected' : 'Connect'}
                    </ThemedText>
                  </Pressable>
                </View>
              );
            }}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                {isDiscovering ? 'Searching for nearby devices...' : 'Tap Discover to search.'}
              </ThemedText>
            }
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  debugSection: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    gap: 6,
  },
  debugHeader: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  debugButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  debugButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#FF9500',
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listSection: {
    flex: 1,
    gap: 8,
  },
  peerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  peerInfo: {
    flex: 1,
    marginRight: 8,
  },
  peerName: {
    fontWeight: 'bold',
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#34C759',
  },
  connectedButton: {
    backgroundColor: '#8E8E93',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.6,
  },
});