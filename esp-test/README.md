# ESP32 BLE: Quick Debug

Expo app (`src/app/index.tsx`) talking to an ESP32-DevKitC-VE (`esp32_ble_pairing/esp32_ble_pairing.ino`) over BLE. Needs a dev build on a real phone (not Expo Go).

## ESP32 button (BOOT)

| Action      | Result                                 |
| ----------- | -------------------------------------- |
| Short press | Opens 60 s pairing window (LED blinks) |
| Hold 3 s    | Erases all bonds (LED blinks fast)     |
| LED solid   | Connected and encrypted                |

Unbonded phones are rejected outside the pairing window. Bonded phones reconnect anytime.

## Pair and test

1. App: **Scan & connect**
2. ESP32: short-press BOOT (first time or after clearing bonds)
3. Accept the phone pairing prompt
4. Send a message. Expect `> hello` then `< ack: hello`

## UUIDs (must match in `index.tsx` and the `.ino`)

|                  | UUID                                   | Direction   |
| ---------------- | -------------------------------------- | ----------- |
| Service          | `6e400001-b5a3-f393-e0a9-e50e24dcca9e` |             |
| RX (write)       | `6e400002-b5a3-f393-e0a9-e50e24dcca9e` | App → ESP32 |
| TX (read/notify) | `6e400003-b5a3-f393-e0a9-e50e24dcca9e` | ESP32 → App |

Values are UTF-8 text, sent as base64 by ble-plx.

## Troubleshooting

| Problem                                | Fix                                                                |
| -------------------------------------- | ------------------------------------------------------------------ |
| No device found                        | ESP32 not advertising. Short-press BOOT, scan again                |
| Pairing failed / odd connect errors    | Hold BOOT 3 s **and** forget `MyESP32` in phone Bluetooth settings |
| Permission denied (Android)            | Grant Nearby devices (12+) or Location (11 and below)              |
| Scan finds nothing (Android)           | Turn Bluetooth on (and Location on older Android)                  |
| Works in nRF Connect, not in app       | Bug is in app code. Check log and permissions                      |
| Permission/plugin change has no effect | Rebuild the native app                                             |

Tip: test the ESP32 with **nRF Connect** first to isolate whether it's the board or the app.

## Gotchas

- Pairing is "Just Works" (encrypted, not MITM-protected).
- GPIO0 is a boot pin: holding it during reset enters flash mode. If stuck, tap EN.
- Serial monitor: 115200 baud. Expect `Ready. Bonds: N. Press button to pair.`
  lllll
