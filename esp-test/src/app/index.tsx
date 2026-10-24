import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ---------- Theme ----------
const C = {
  bg: "#F6F2EA",
  surface: "#FFFFFF",
  line: "#E7E1D5",
  ink: "#14342C",
  dim: "#7C8B84",
  green: "#174238",
  greenSoft: "#1F5246",
  mint: "#CFE9DD",
  mintSoft: "#E1EEE8",
  sos: "#EE6A45",
  tan: "#D7A86E",
  sage: "#A9C5B8",
  rose: "#C9908A",
  steel: "#9FBBCB",
  online: "#3FA37B",
  away: "#D9A441",
};

// ---------- Mock data (replace with real mesh data from the ESP32 later) ----------
const USER = { name: "Atharva", initials: "AR" };

const MESH = { nodes: 8, nearby: 12, signal: "Strong", stable: true };

// Node positions are fractions of the graph box (x, y); size is in px
const GRAPH_NODES = [
  { id: "me", x: 0.5, y: 0.6, size: 40, bg: C.mint, label: "", center: true },
  { id: "nb", x: 0.08, y: 0.72, size: 24, bg: C.tan, label: "NB" },
  { id: "sm", x: 0.3, y: 0.28, size: 24, bg: C.sage, label: "SM" },
  { id: "ys", x: 0.74, y: 0.16, size: 24, bg: C.rose, label: "YS" },
  { id: "rx", x: 0.93, y: 0.6, size: 20, bg: C.mint, label: "", dot: true },
];
const GRAPH_EDGES: [string, string][] = [
  ["nb", "sm"],
  ["nb", "me"],
  ["sm", "me"],
  ["sm", "ys"],
  ["me", "ys"],
  ["me", "rx"],
];

const PEOPLE = [
  {
    id: "nb",
    name: "Nirvaan",
    initials: "NB",
    dist: "120 m",
    bg: C.tan,
    ink: "#5B3E12",
    status: "online",
  },
  {
    id: "sm",
    name: "Suraj",
    initials: "SM",
    dist: "380 m",
    bg: C.sage,
    ink: "#1F4A3C",
    status: "online",
  },
  {
    id: "ys",
    name: "Yafet",
    initials: "YS",
    dist: "720 m",
    bg: C.rose,
    ink: "#5E2A25",
    status: "away",
  },
  {
    id: "pc",
    name: "Patrick",
    initials: "PC",
    dist: "1.2 km",
    bg: C.steel,
    ink: "#23465A",
    status: "online",
  },
];

const MESSAGES = [
  {
    id: "m1",
    title: "Neighborhood Updates",
    preview: "Water station is open until 6 PM.",
    time: "2m",
    unread: 2,
    icon: "people-outline",
    tint: C.mintSoft,
    tintInk: "#2F6B58",
  },
  {
    id: "m2",
    title: "Nirvaan Bansal",
    preview: "We're safe at the community center.",
    time: "12m",
    unread: 0,
    initials: "NB",
    bg: C.tan,
    ink: "#5B3E12",
    online: true,
  },
  {
    id: "m3",
    title: "Help & Resources",
    preview: "First aid supplies available nearby.",
    time: "28m",
    unread: 0,
    icon: "radio-outline",
    tint: "#F3E9D6",
    tintInk: "#B98A3E",
  },
] as const;

const NAV = [
  { id: "home", label: "Home", icon: "home-outline", iconOn: "home" },
  {
    id: "messages",
    label: "Messages",
    icon: "chatbubble-outline",
    iconOn: "chatbubble",
    dot: true,
  },
  { id: "nearby", label: "Nearby", icon: "person-outline", iconOn: "person" },
  { id: "network", label: "Network", icon: "radio-outline", iconOn: "radio" },
] as const;

// ---------- Screen ----------
export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [graphW, setGraphW] = useState(0);
  const [selected, setSelected] = useState("nb");
  const [sosSent, setSosSent] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  const GRAPH_H = 132;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD EVENING";

  // Soft pulse on the center node
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.1],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  const onSos = () => {
    Alert.alert(
      "Send SOS?",
      "This alerts every device on the mesh that you need help.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: () => {
            setSosSent(true);
            setTimeout(() => setSosSent(false), 6000);
          },
        },
      ],
    );
  };

  // Graph geometry (px) from the fractional positions
  const pos = (id: string) => {
    const n = GRAPH_NODES.find((g) => g.id === id)!;
    return { x: n.x * graphW, y: n.y * GRAPH_H };
  };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={[s.row, s.pad, { justifyContent: "space-between" }]}>
          <View style={s.row}>
            <View style={s.logo}>
              <Ionicons name="radio-outline" size={20} color={C.mint} />
            </View>
            <Text style={s.brand}>MeshAid</Text>
          </View>
          <View style={s.row}>
            <View style={s.nodePill}>
              <View style={[s.dotSm, { backgroundColor: C.online }]} />
              <Text style={s.nodePillText}>{MESH.nodes} nodes</Text>
            </View>
            <View style={s.avatarTop}>
              <Text style={s.avatarTopText}>{USER.initials}</Text>
            </View>
          </View>
        </View>

        {/* Hero + SOS */}
        <View style={[s.pad, s.hero]}>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>
              {greeting}, {USER.name.toUpperCase()}
            </Text>
            <Text style={s.headline}>Stay connected, whatever happens.</Text>
          </View>
          <Pressable
            onPress={onSos}
            style={({ pressed }) => [
              s.sos,
              pressed && { transform: [{ scale: 0.95 }] },
              sosSent && { backgroundColor: C.green },
            ]}
          >
            <Ionicons
              name={sosSent ? "checkmark" : "warning-outline"}
              size={22}
              color="#fff"
            />
            <Text style={s.sosText}>{sosSent ? "SENT" : "SOS"}</Text>
          </Pressable>
        </View>

        {/* Mesh status card */}
        <View style={[s.pad, { marginTop: 18 }]}>
          <View style={s.meshCard}>
            <View
              style={[
                s.row,
                {
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: 16,
                  paddingBottom: 0,
                },
              ]}
            >
              <View style={s.row}>
                <View
                  style={[
                    s.dotSm,
                    { backgroundColor: C.online, marginRight: 8, marginTop: 2 },
                  ]}
                />
                <View>
                  <Text style={s.meshEyebrow}>MESH STATUS</Text>
                  <Text style={s.meshTitle}>
                    {MESH.stable ? "Network is stable" : "Network is degraded"}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push("/debug" as any)}
                style={s.row}
                hitSlop={10}
              >
                <Text style={s.meshDetails}>Details</Text>
                <Ionicons name="chevron-forward" size={14} color={C.mint} />
              </Pressable>
            </View>

            {/* Mesh graph */}
            <View
              style={{ height: GRAPH_H, marginHorizontal: 16 }}
              onLayout={(e) => setGraphW(e.nativeEvent.layout.width)}
            >
              {graphW > 0 && (
                <>
                  {/* Big faint ring */}
                  <View
                    style={{
                      position: "absolute",
                      width: 170,
                      height: 170,
                      borderRadius: 85,
                      borderWidth: 1,
                      borderColor: "rgba(207,233,221,0.14)",
                      left: graphW * 0.5 - 85,
                      top: GRAPH_H * 0.6 - 85,
                    }}
                  />

                  {/* Dashed edges */}
                  {GRAPH_EDGES.map(([a, b]) => {
                    const p1 = pos(a);
                    const p2 = pos(b);
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    const dashes = Math.max(2, Math.floor(dist / 9));
                    return (
                      <View
                        key={a + b}
                        style={{
                          position: "absolute",
                          width: dist,
                          height: 1,
                          left: (p1.x + p2.x) / 2 - dist / 2,
                          top: (p1.y + p2.y) / 2 - 0.5,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          transform: [{ rotate: `${angle}rad` }],
                        }}
                      >
                        {Array.from({ length: dashes }).map((_, i) => (
                          <View
                            key={i}
                            style={{
                              width: 4,
                              height: 1,
                              backgroundColor: "rgba(207,233,221,0.45)",
                            }}
                          />
                        ))}
                      </View>
                    );
                  })}

                  {/* Nodes */}
                  {GRAPH_NODES.map((n) => {
                    const p = pos(n.id);
                    return (
                      <View
                        key={n.id}
                        style={{
                          position: "absolute",
                          left: p.x - n.size / 2,
                          top: p.y - n.size / 2,
                          width: n.size,
                          height: n.size,
                        }}
                      >
                        {n.center && (
                          <Animated.View
                            style={{
                              position: "absolute",
                              width: n.size,
                              height: n.size,
                              borderRadius: n.size / 2,
                              backgroundColor: C.mint,
                              opacity: pulseOpacity,
                              transform: [{ scale: pulseScale }],
                            }}
                          />
                        )}
                        <View
                          style={[
                            s.graphNode,
                            {
                              width: n.size,
                              height: n.size,
                              borderRadius: n.size / 2,
                              backgroundColor: n.bg,
                            },
                          ]}
                        >
                          {n.label ? (
                            <Text style={s.graphNodeText}>{n.label}</Text>
                          ) : null}
                          {n.center || n.dot ? (
                            <View
                              style={{
                                width: n.center ? 8 : 6,
                                height: n.center ? 8 : 6,
                                borderRadius: 4,
                                borderWidth: 1.5,
                                borderColor: C.green,
                              }}
                            />
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.stat}>
                <Ionicons name="person-outline" size={18} color={C.mint} />
                <View>
                  <Text style={s.statValue}>{MESH.nearby}</Text>
                  <Text style={s.statLabel}>Nearby</Text>
                </View>
              </View>
              <View style={[s.stat, s.statMid]}>
                <Ionicons name="radio-outline" size={18} color={C.mint} />
                <View>
                  <Text style={s.statValue}>{MESH.nodes}</Text>
                  <Text style={s.statLabel}>Nodes</Text>
                </View>
              </View>
              <View style={s.stat}>
                <Ionicons name="cellular" size={18} color={C.mint} />
                <View>
                  <Text style={s.statValue}>{MESH.signal}</Text>
                  <Text style={s.statLabel}>Signal</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* People nearby */}
        <View style={[s.pad, { marginTop: 26 }]}>
          <Text style={s.eyebrowDim}>YOUR COMMUNITY</Text>
          <View
            style={[
              s.row,
              { justifyContent: "space-between", alignItems: "flex-end" },
            ]}
          >
            <Text style={s.h2}>People nearby</Text>
            <Text style={s.link}>See all</Text>
          </View>

          <View
            style={[s.row, { justifyContent: "space-between", marginTop: 14 }]}
          >
            {PEOPLE.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setSelected(p.id)}
                style={{ alignItems: "center", width: 76 }}
              >
                <View
                  style={[
                    s.person,
                    { backgroundColor: p.bg },
                    selected === p.id && s.personSelected,
                  ]}
                >
                  <Text style={[s.personText, { color: p.ink }]}>
                    {p.initials}
                  </Text>
                  <View
                    style={[
                      s.statusDot,
                      {
                        backgroundColor:
                          p.status === "online" ? C.online : C.away,
                      },
                    ]}
                  />
                </View>
                <Text style={s.personName}>{p.name}</Text>
                <Text style={s.personDist}>{p.dist}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Messages */}
        <View style={[s.pad, { marginTop: 26 }]}>
          <Text style={s.eyebrowDim}>RECENT ACTIVITY</Text>
          <View
            style={[
              s.row,
              { justifyContent: "space-between", alignItems: "flex-end" },
            ]}
          >
            <Text style={s.h2}>Messages</Text>
            <Text style={s.link}>View all</Text>
          </View>

          <View style={s.msgCard}>
            {MESSAGES.map((m, i) => (
              <Pressable
                key={m.id}
                style={({ pressed }) => [
                  s.msgRow,
                  i > 0 && s.msgDivider,
                  pressed && { backgroundColor: "#FAF7F0" },
                ]}
              >
                {"initials" in m ? (
                  <View
                    style={[
                      s.msgIcon,
                      { backgroundColor: m.bg },
                      s.personSelected,
                    ]}
                  >
                    <Text
                      style={[s.personText, { color: m.ink, fontSize: 14 }]}
                    >
                      {m.initials}
                    </Text>
                    {m.online && (
                      <View
                        style={[
                          s.statusDot,
                          { backgroundColor: C.online, right: -3, bottom: -3 },
                        ]}
                      />
                    )}
                  </View>
                ) : (
                  <View style={[s.msgIcon, { backgroundColor: m.tint }]}>
                    <Ionicons
                      name={m.icon as any}
                      size={20}
                      color={m.tintInk}
                    />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.msgTitle} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={s.msgPreview} numberOfLines={1}>
                    {m.preview}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Text style={s.msgTime}>{m.time}</Text>
                  {m.unread > 0 && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>{m.unread}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [s.newMsg, pressed && { opacity: 0.85 }]}
          >
            <View style={s.row}>
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={s.newMsgText}>New message</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom nav (only Home exists so far, the other tabs are visual placeholders) */}
      <View style={[s.nav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {NAV.map((n) => {
          const active = n.id === "home";
          return (
            <Pressable key={n.id} style={s.navItem}>
              <View style={[s.navPill, active && { backgroundColor: C.mint }]}>
                <Ionicons
                  name={(active ? n.iconOn : n.icon) as any}
                  size={20}
                  color={active ? C.green : C.dim}
                />
                {"dot" in n && n.dot && <View style={s.navDot} />}
              </View>
              <Text
                style={[
                  s.navLabel,
                  active && { color: C.ink, fontWeight: "700" },
                ]}
              >
                {n.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------- Styles ----------
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  pad: { paddingHorizontal: 18 },
  row: { flexDirection: "row", alignItems: "center" },

  // top bar
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brand: { fontSize: 20, fontWeight: "700", color: C.ink, letterSpacing: -0.3 },
  nodePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.mintSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  nodePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2F6B58",
    marginLeft: 6,
  },
  dotSm: { width: 8, height: 8, borderRadius: 4 },
  avatarTop: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.tan,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTopText: { fontSize: 13, fontWeight: "800", color: "#fff" },

  // hero
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 26,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: C.dim,
    marginBottom: 8,
  },
  headline: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "500",
    letterSpacing: -1,
    color: C.ink,
  },
  sos: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: C.sos,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    shadowColor: C.sos,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sosText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  // mesh card
  meshCard: {
    backgroundColor: C.green,
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: C.green,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  meshEyebrow: {
    color: "rgba(207,233,221,0.6)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  meshTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginTop: 2 },
  meshDetails: {
    color: C.mint,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 2,
  },
  graphNode: { alignItems: "center", justifyContent: "center" },
  graphNodeText: { fontSize: 8, fontWeight: "800", color: C.green },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(207,233,221,0.14)",
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
  },
  statMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(207,233,221,0.14)",
  },
  statValue: { color: "#fff", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "rgba(207,233,221,0.6)", fontSize: 11 },

  // sections
  eyebrowDim: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: C.dim,
    marginBottom: 6,
  },
  h2: { fontSize: 24, fontWeight: "500", letterSpacing: -0.6, color: C.ink },
  link: { fontSize: 13, fontWeight: "700", color: C.dim, marginBottom: 4 },

  // people
  person: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  personSelected: { borderWidth: 2, borderColor: "#111" },
  personText: { fontSize: 16, fontWeight: "800" },
  statusDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: C.bg,
  },
  personName: { marginTop: 8, fontSize: 13, fontWeight: "700", color: C.ink },
  personDist: { marginTop: 2, fontSize: 11, color: C.dim },

  // messages
  msgCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 12,
    overflow: "hidden",
  },
  msgRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  msgDivider: { borderTopWidth: 1, borderTopColor: C.line },
  msgIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  msgTitle: { fontSize: 15, fontWeight: "700", color: C.ink },
  msgPreview: { fontSize: 12.5, color: C.dim, marginTop: 3 },
  msgTime: { fontSize: 11, color: C.dim },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.sos,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  newMsg: {
    backgroundColor: C.green,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 17,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newMsgText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },

  // bottom nav
  nav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#FBF9F4",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navPill: {
    width: 62,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: { fontSize: 11, color: C.dim, fontWeight: "600" },
  navDot: {
    position: "absolute",
    top: 5,
    right: 17,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.sos,
  },
});
