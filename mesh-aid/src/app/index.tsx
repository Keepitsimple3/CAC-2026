import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { requestNearbyPermissions } from "../permissions";
import {
  acceptConnection,
  onConnected,
  onInvitationReceived,
  onPeerFound,
  onTextReceived,
  requestConnection,
  startAdvertise,
  startDiscovery,
  stopAdvertise,
  stopDiscovery,
} from "../services/nearby";

import { Strategy } from "expo-nearby-connections";

type UserStatus = "safe" | "help" | "sos";

export default function HomeScreen() {
  const [networkStatus, setNetworkStatus] = useState("Starting");
  const [connected, setConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [message, setMessage] = useState("");
  const [userStatus, setUserStatus] = useState<UserStatus>("safe");
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    let unsubscribePeerFound: (() => void) | undefined;
    let unsubscribeInvitation: (() => void) | undefined;
    let unsubscribeConnected: (() => void) | undefined;
    let unsubscribeText: (() => void) | undefined;

    async function setup() {
      const permissionsGranted = await requestNearbyPermissions();

      if (!permissionsGranted) {
        setNetworkStatus("Permissions needed");
        return;
      }

      setNetworkStatus("Ready");

      unsubscribePeerFound = onPeerFound(async (peer) => {
        setPeerCount((count) => count + 1);

        try {
          await requestConnection(peer.peerId);
        } catch (error) {
          console.error("Connection request failed:", error);
        }
      });

      unsubscribeInvitation = onInvitationReceived(async (peer) => {
        try {
          await acceptConnection(peer.peerId);
        } catch (error) {
          console.error("Accept connection failed:", error);
        }
      });

      unsubscribeConnected = onConnected((peer) => {
        setConnected(true);
        setNetworkStatus("Connected");
      });

      unsubscribeText = onTextReceived((data) => {
        setMessage(data.text);
      });
    }

    setup();

    return () => {
      unsubscribePeerFound?.();
      unsubscribeInvitation?.();
      unsubscribeConnected?.();
      unsubscribeText?.();

      stopAdvertise();
      stopDiscovery();
    };
  }, []);

  async function startMesh() {
    try {
      await startAdvertise("Mesh Aid", Strategy.P2P_CLUSTER);
      await startDiscovery("Mesh Aid", Strategy.P2P_CLUSTER);

      setConnected(true);
      setNetworkStatus("Active");
    } catch (error) {
      console.error("Unable to start mesh:", error);
      setNetworkStatus("Unavailable");
    }
  }

  function chooseStatus(status: UserStatus) {
    setUserStatus(status);
    setShowStatusPicker(false);
  }

  const statusData = {
    safe: {
      title: "You are safe",
      description: "Your status is being shared with nearby peers.",
      color: "#5D8768",
      symbol: "✓",
    },
    help: {
      title: "You need help",
      description: "Nearby peers will be notified that you need assistance.",
      color: "#B18A45",
      symbol: "!",
    },
    sos: {
      title: "SOS active",
      description: "Your emergency signal is being relayed through the mesh.",
      color: "#B65C55",
      symbol: "SOS",
    },
  }[userStatus];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ───────────── Top status ───────────── */}

        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View
              style={[
                styles.statusDot,
                connected && styles.statusDotActive,
              ]}
            />

            <Text style={styles.brandText}>MESH AID</Text>
          </View>

          <Text style={styles.topStatus}>
            {connected ? `${peerCount} PEERS` : "OFFLINE"}
          </Text>
        </View>

        {/* ───────────── Hero ───────────── */}

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR STATUS</Text>

          <View style={styles.statusSymbol}>
            <Text
              style={[
                styles.statusSymbolText,
                { color: statusData.color },
              ]}
            >
              {statusData.symbol}
            </Text>
          </View>

          <Text style={styles.heroTitle}>{statusData.title}</Text>

          <Text style={styles.heroDescription}>
            {statusData.description}
          </Text>

          <Pressable
            onPress={() => setShowStatusPicker(true)}
            style={styles.changeStatus}
          >
            <Text style={styles.changeStatusText}>
              Change status
            </Text>

            <Text style={styles.changeStatusArrow}>↗</Text>
          </Pressable>
        </View>

        {/* ───────────── Status picker ───────────── */}

        {showStatusPicker && (
          <View style={styles.statusPicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                Change status
              </Text>

              <Pressable
                onPress={() => setShowStatusPicker(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => chooseStatus("safe")}
              style={[
                styles.statusOption,
                userStatus === "safe" && styles.statusOptionSelected,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: "#E5EEE6" },
                ]}
              >
                <Text style={{ color: "#5D8768" }}>✓</Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>I'm safe</Text>
                <Text style={styles.optionDescription}>
                  Everything is okay.
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => chooseStatus("help")}
              style={[
                styles.statusOption,
                userStatus === "help" && styles.statusOptionSelected,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: "#F3EBD9" },
                ]}
              >
                <Text style={{ color: "#B18A45" }}>!</Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Need help</Text>
                <Text style={styles.optionDescription}>
                  Request assistance nearby.
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => chooseStatus("sos")}
              style={[
                styles.statusOption,
                userStatus === "sos" && styles.statusOptionSelected,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: "#F3E2E0" },
                ]}
              >
                <Text style={{ color: "#B65C55", fontSize: 9 }}>
                  SOS
                </Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>SOS</Text>
                <Text style={styles.optionDescription}>
                  Broadcast an emergency signal.
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* ───────────── Space ───────────── */}

        <View style={styles.largeSpace} />

        {/* ───────────── Mesh map ───────────── */}

        <View style={styles.meshSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>LOCAL NETWORK</Text>

              <Text style={styles.sectionTitle}>
                Mesh
              </Text>
            </View>

            <View style={styles.meshMeta}>
              <Text style={styles.meshMetaNumber}>
                {peerCount}
              </Text>

              <Text style={styles.meshMetaLabel}>
                peers
              </Text>
            </View>
          </View>

          <View style={styles.meshMap}>
            {/* Connection lines */}

            <View style={[styles.line, styles.lineOne]} />
            <View style={[styles.line, styles.lineTwo]} />
            <View style={[styles.line, styles.lineThree]} />
            <View style={[styles.line, styles.lineFour]} />

            {/* Nodes */}

            <View
              style={[
                styles.node,
                styles.nodeTop,
                styles.peerNode,
              ]}
            />

            <View
              style={[
                styles.node,
                styles.nodeLeft,
                styles.peerNode,
              ]}
            />

            <View
              style={[
                styles.node,
                styles.nodeRight,
                styles.peerNode,
              ]}
            />

            <View
              style={[
                styles.node,
                styles.nodeBottom,
                styles.peerNode,
              ]}
            />

            <View
              style={[
                styles.node,
                styles.nodeCenter,
                {
                  borderColor: statusData.color,
                },
              ]}
            >
              <View
                style={[
                  styles.centerNode,
                  {
                    backgroundColor: statusData.color,
                  },
                ]}
              />
            </View>

            <Text style={styles.youLabel}>YOU</Text>
          </View>

          <View style={styles.meshSummary}>
            <View>
              <Text style={styles.summaryNumber}>
                {peerCount}
              </Text>

              <Text style={styles.summaryLabel}>
                nearby
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View>
              <Text style={styles.summaryNumber}>
                {peerCount > 0 ? "2" : "—"}
              </Text>

              <Text style={styles.summaryLabel}>
                max hops
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View>
              <Text
                style={[
                  styles.summaryNumber,
                  connected && styles.connectedText,
                ]}
              >
                {connected ? "Good" : "—"}
              </Text>

              <Text style={styles.summaryLabel}>
                connection
              </Text>
            </View>
          </View>
        </View>

        {/* ───────────── Nearby ───────────── */}

        <View style={styles.nearbySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>NEARBY</Text>

              <Text style={styles.sectionTitle}>
                People around you
              </Text>
            </View>

            <Text style={styles.viewText}>View all</Text>
          </View>

          <View style={styles.nearbyRow}>
            <View style={styles.personIndicator}>
              <View style={styles.personDot} />
            </View>

            <View style={styles.personContent}>
              <Text style={styles.personTitle}>
                {peerCount === 0
                  ? "Looking for people"
                  : `${peerCount} people reachable`}
              </Text>

              <Text style={styles.personDescription}>
                {peerCount === 0
                  ? "Mesh Aid will automatically search nearby."
                  : "Statuses are being exchanged nearby."}
              </Text>
            </View>

            <Text style={styles.personArrow}>→</Text>
          </View>
        </View>

        {/* ───────────── Message ───────────── */}

        {message !== "" && (
          <View style={styles.messageSection}>
            <Text style={styles.eyebrow}>RECEIVED</Text>

            <Text style={styles.messageText}>
              {message}
            </Text>
          </View>
        )}

        {/* ───────────── Tools ───────────── */}

        <View style={styles.toolsSection}>
          <Text style={styles.eyebrow}>TOOLS</Text>

          <View style={styles.toolsRow}>
            <Pressable style={styles.tool}>
              <Text style={styles.toolIcon}>◎</Text>
              <Text style={styles.toolText}>Activity</Text>
            </Pressable>

            <Pressable style={styles.tool}>
              <Text style={styles.toolIcon}>↗</Text>
              <Text style={styles.toolText}>Messages</Text>
            </Pressable>

            <Pressable
              onPress={startMesh}
              style={styles.tool}
            >
              <Text style={styles.toolIcon}>⌁</Text>
              <Text style={styles.toolText}>Reconnect</Text>
            </Pressable>
          </View>
        </View>

        {/* ───────────── Footer ───────────── */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Mesh Aid works directly between nearby devices.
          </Text>

          <Text style={styles.footerStatus}>
            {networkStatus}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },

  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 70,
  },

  /* Top */

  topBar: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B4B8B2",
  },

  statusDotActive: {
    backgroundColor: "#5D8768",
  },

  brandText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#687069",
  },

  topStatus: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#9A9F9A",
  },

  /* Hero */

  hero: {
    alignItems: "center",
    paddingTop: 82,
    paddingBottom: 20,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#A0A49F",
  },

  statusSymbol: {
    width: 62,
    height: 62,
    marginTop: 26,
    marginBottom: 20,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECEDE8",
  },

  statusSymbolText: {
    fontSize: 24,
    fontWeight: "700",
  },

  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: "#202722",
    textAlign: "center",
  },

  heroDescription: {
    maxWidth: 260,
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#8A908A",
    textAlign: "center",
  },

  changeStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 22,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  changeStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#687069",
  },

  changeStatusArrow: {
    fontSize: 13,
    color: "#9A9F9A",
  },

  /* Status picker */

  statusPicker: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E9EBE6",
  },

  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#252C27",
  },

  closeText: {
    fontSize: 11,
    color: "#8C928C",
  },

  statusOption: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginTop: 4,
  },

  statusOptionSelected: {
    backgroundColor: "#F7F8F5",
  },

  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B322D",
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 10,
    color: "#969B96",
  },

  /* Space */

  largeSpace: {
    height: 58,
  },

  /* Mesh */

  meshSection: {
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  sectionTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: "#252C27",
  },

  meshMeta: {
    alignItems: "flex-end",
  },

  meshMetaNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#252C27",
  },

  meshMetaLabel: {
    fontSize: 9,
    color: "#9A9F9A",
  },

  meshMap: {
    height: 270,
    position: "relative",
    overflow: "hidden",
  },

  line: {
    position: "absolute",
    height: 1,
    backgroundColor: "#DDE1DB",
    transformOrigin: "left center",
  },

  lineOne: {
    width: 125,
    left: "50%",
    top: 90,
    transform: [{ rotate: "-36deg" }],
  },

  lineTwo: {
    width: 125,
    left: "50%",
    top: 90,
    transform: [{ rotate: "36deg" }],
  },

  lineThree: {
    width: 115,
    left: "50%",
    top: 110,
    transform: [{ rotate: "145deg" }],
  },

  lineFour: {
    width: 105,
    left: "50%",
    top: 110,
    transform: [{ rotate: "35deg" }],
  },

  node: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 6,
  },

  peerNode: {
    backgroundColor: "#D0D6D0",
    borderWidth: 3,
    borderColor: "#F4F5F1",
  },

  nodeTop: {
    left: "48%",
    top: 30,
  },

  nodeLeft: {
    left: "22%",
    top: 116,
  },

  nodeRight: {
    right: "21%",
    top: 110,
  },

  nodeBottom: {
    left: "49%",
    bottom: 31,
  },

  nodeCenter: {
    left: "50%",
    top: 96,
    width: 31,
    height: 31,
    marginLeft: -15,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  centerNode: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },

  youLabel: {
    position: "absolute",
    left: "50%",
    top: 132,
    marginLeft: -13,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#7F877F",
  },

  meshSummary: {
    height: 72,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E9EBE6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  summaryNumber: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    color: "#303831",
  },

  summaryLabel: {
    marginTop: 4,
    fontSize: 9,
    color: "#999F99",
    textAlign: "center",
  },

  summaryDivider: {
    height: 25,
    width: 1,
    backgroundColor: "#E6E9E4",
  },

  connectedText: {
    color: "#5D8768",
  },

  /* Nearby */

  nearbySection: {
    marginTop: 58,
  },

  viewText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8C928C",
  },

  nearbyRow: {
    minHeight: 74,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E9EBE6",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  personIndicator: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF1EC",
    alignItems: "center",
    justifyContent: "center",
  },

  personDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#6C9275",
  },

  personContent: {
    flex: 1,
    marginLeft: 13,
  },

  personTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#303831",
  },

  personDescription: {
    marginTop: 3,
    fontSize: 10,
    color: "#969B96",
  },

  personArrow: {
    fontSize: 18,
    color: "#A1A6A1",
    marginLeft: 10,
  },

  /* Message */

  messageSection: {
    marginTop: 42,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#F0F3EE",
  },

  messageText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#3D5C43",
  },

  /* Tools */

  toolsSection: {
    marginTop: 58,
  },

  toolsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  tool: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEBE7",
    padding: 14,
    justifyContent: "space-between",
  },

  toolIcon: {
    fontSize: 20,
    color: "#6C746D",
  },

  toolText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6F766F",
  },

  /* Footer */

  footer: {
    marginTop: 54,
    alignItems: "center",
  },

  footerText: {
    fontSize: 9,
    color: "#A3A8A3",
    textAlign: "center",
  },

  footerStatus: {
    marginTop: 7,
    fontSize: 8,
    letterSpacing: 1,
    color: "#B0B5B0",
    textTransform: "uppercase",
  },
});

