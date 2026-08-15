import {
    Strategy,
    acceptConnection,
    disconnect,
    onConnected,
    onDisconnected,
    onInvitationReceived,
    onPeerFound,
    onPeerLost,
    onTextReceived,
    rejectConnection,
    requestConnection,
    sendText,
    startAdvertise,
    startDiscovery,
    stopAdvertise,
    stopDiscovery,
} from "expo-nearby-connections";

export const NEARBY_STRATEGY = Strategy.P2P_CLUSTER;

export {
    acceptConnection, disconnect, onConnected,
    onDisconnected, onInvitationReceived, onPeerFound,
    onPeerLost,
    onTextReceived, rejectConnection, requestConnection, sendText, startAdvertise, startDiscovery, stopAdvertise, stopDiscovery
};
