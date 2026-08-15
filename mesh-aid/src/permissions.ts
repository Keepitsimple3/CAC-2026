import { PermissionsAndroid, Platform } from "react-native";

export async function requestNearbyPermissions() {
  if (Platform.OS !== "android") {
    return true;
  }

  const permissions = [
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
  ];

  const result = await PermissionsAndroid.requestMultiple(permissions);

  return permissions.every(
    (permission) =>
      result[permission] === PermissionsAndroid.RESULTS.GRANTED
  );
}