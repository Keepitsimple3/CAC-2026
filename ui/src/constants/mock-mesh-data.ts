// Shared mock data so Home and Devices screens stay in sync.
// Swap this for real onPeerFound/onConnected state once native mesh logic is wired back in.

export type MeshStatus = 'safe' | 'help' | 'sos';

export type MeshPeer = {
  id: string;
  name: string;
  status: MeshStatus;
  distanceMi: number;
  lastUpdate: string;
};

export const MOCK_PEERS: MeshPeer[] = [
  { id: '1', name: 'Ava', status: 'safe', distanceMi: 0.2, lastUpdate: 'Just now' },
  { id: '2', name: 'Noah', status: 'help', distanceMi: 0.4, lastUpdate: '2m ago' },
  { id: '3', name: 'Riley', status: 'safe', distanceMi: 0.6, lastUpdate: '4m ago' },
  { id: '4', name: 'Jordan', status: 'sos', distanceMi: 0.8, lastUpdate: '5m ago' },
  { id: '5', name: 'Priya', status: 'safe', distanceMi: 1.1, lastUpdate: '6m ago' },
  { id: '6', name: 'Malik', status: 'help', distanceMi: 1.3, lastUpdate: '9m ago' },
];

export const STATUS_LABEL: Record<MeshStatus, string> = {
  safe: "I'm Safe",
  help: 'Need Help',
  sos: 'SOS',
};