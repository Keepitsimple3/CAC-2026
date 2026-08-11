import {
  onPeerFound,
  onPeerLost,
  startDiscovery,
  stopDiscovery,
  type BasePeer,
} from "expo-nearby-connections";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { requestNearbyPermissions } from "../src/permissions";

export default function HomeScreen() {
  const [peers, setPeers] = useState<BasePeer[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    const unsubscribeFound = onPeerFound((peer) => {
      console.log("Peer found:", peer);

      setPeers((current) => {
        // Don't add the same device twice.
        if (current.some((p) => p.peerId === peer.peerId)) {
          return current;
        }

        return [...current, peer];
      });

      setStatus("Device found");
    });

    const unsubscribeLost = onPeerLost(({ peerId }) => {
      console.log("Peer lost:", peerId);

      setPeers((current) =>
        current.filter((peer) => peer.peerId !== peerId)
      );
    });

    return () => {
      unsubscribeFound();
      unsubscribeLost();

      stopDiscovery().catch((error) => {
        console.log("Failed to stop discovery:", error);
      });
    };
  }, []);

  const handleDiscovery = async () => {
    if (discovering) {
      await stopDeviceDiscovery();
    } else {
      await startDeviceDiscovery();
    }
  };

  const startDeviceDiscovery = async () => {
    try {
      setStatus("Requesting permissions...");

      const permissionsGranted = await requestNearbyPermissions();

      if (!permissionsGranted) {
        setStatus("Nearby permissions were not granted");
        return;
      }

      setPeers([]);
      setStatus("Starting discovery...");

      await startDiscovery("MeshAid");

      setDiscovering(true);
      setStatus("Searching for nearby MeshAid devices...");
    } catch (error) {
      console.error("Discovery error:", error);
      setStatus("Failed to start discovery");
    }
  };

  const stopDeviceDiscovery = async () => {
    try {
      await stopDiscovery();

      setDiscovering(false);
      setStatus("Discovery stopped");
    } catch (error) {
      console.error("Stop discovery error:", error);
      setStatus("Failed to stop discovery");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View>
          <Text style={styles.title}>MeshAid</Text>
          <Text style={styles.subtitle}>Nearby Devices</Text>
        </View>

        {/* Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>STATUS</Text>

          <View style={styles.statusRow}>
            {discovering && (
              <ActivityIndicator
                size="small"
                color="#208AEF"
              />
            )}

            <Text style={styles.statusText}>
              {status}
            </Text>
          </View>
        </View>

        {/* Discovery button */}
        <Pressable
          style={[
            styles.discoveryButton,
            discovering && styles.stopButton,
          ]}
          onPress={handleDiscovery}
        >
          <Text style={styles.buttonText}>
            {discovering
              ? "Stop Discovery"
              : "Start Discovery"}
          </Text>
        </Pressable>

        {/* Nearby devices */}
        <Text style={styles.sectionTitle}>
          Nearby
          {peers.length > 0 && ` (${peers.length})`}
        </Text>

        <FlatList
          data={peers}
          keyExtractor={(peer) => peer.peerId}
          contentContainerStyle={
            peers.length === 0
              ? styles.emptyList
              : styles.peerList
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No devices found
              </Text>

              <Text style={styles.emptyText}>
                Start discovery to look for nearby
                MeshAid devices.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.peerCard}>
              <View style={styles.peerIcon}>
                <Text style={styles.peerIconText}>
                  M
                </Text>
              </View>

              <View style={styles.peerInfo}>
                <Text style={styles.peerName}>
                  {item.name || "Unknown device"}
                </Text>

                <Text style={styles.peerId}>
                  {item.peerId}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 18,
    color: "#64748B",
  },

  statusCard: {
    marginTop: 32,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#94A3B8",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },

  statusText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },

  discoveryButton: {
    marginTop: 16,
    paddingVertical: 17,
    borderRadius: 16,
    backgroundColor: "#208AEF",
    alignItems: "center",
  },

  stopButton: {
    backgroundColor: "#475569",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 32,
    marginBottom: 12,
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
  },

  peerList: {
    paddingBottom: 24,
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyState: {
    padding: 22,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  peerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  peerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
  },

  peerIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0284C7",
  },

  peerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  peerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  peerId: {
    marginTop: 3,
    fontSize: 11,
    color: "#94A3B8",
  },
});