import {
    PERMISSIONS,
    requestMultiple,
    RESULTS,
} from "react-native-permissions";

export async function requestNearbyPermissions(): Promise<boolean> {
  const permissions = [
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    PERMISSIONS.ANDROID.NEARBY_WIFI_DEVICES,
  ];

  const results = await requestMultiple(permissions);

  return Object.values(results).every(
    (result) => result === RESULTS.GRANTED
  );
}