# Representative One-Room Pin Mapping

This is a concept-only wiring guide for a single room with 2 fans and 3 lights. The software simulator does not require physical hardware.

## Assumptions

- Controller: ESP32 DevKit.
- Loads: represented in Wokwi/Tinkercad by LEDs or motors.
- Real-world loads: must use isolated relay modules or motor/LED driver circuits, never direct GPIO-to-load wiring.
- Current sensing: ACS712 module is optional and demonstrates power estimation.

## Pin Table

| Device / Module | ESP32 Pin | Direction | Purpose | Electrical Reasoning |
|---|---:|---|---|---|
| Fan 1 relay input | GPIO 18 | Output | Turn Fan 1 ON/OFF | GPIO drives relay input only; relay switches load supply. |
| Fan 2 relay input | GPIO 19 | Output | Turn Fan 2 ON/OFF | Separates low-voltage logic from fan power path. |
| Light 1 relay input | GPIO 21 | Output | Turn Light 1 ON/OFF | Relay contact handles external load current. |
| Light 2 relay input | GPIO 22 | Output | Turn Light 2 ON/OFF | Independent control channel. |
| Light 3 relay input | GPIO 23 | Output | Turn Light 3 ON/OFF | Independent control channel. |
| ACS712 OUT | GPIO 34 / ADC1 | Input | Read analog current signal | ADC pin reads sensor output; no direct load connection to ESP32. |
| Relay VCC | 5V | Power | Relay module power | Many relay boards need 5V coil/module power. |
| Relay GND | GND | Ground | Common logic reference | Shared ground required for signal reference on low-voltage side. |
| ESP32 VIN/USB | 5V/USB | Power | Controller power | Use stable USB/5V supply. |

## Connection List

1. ESP32 GPIO 18 → Relay IN1 → Fan 1 load path.
2. ESP32 GPIO 19 → Relay IN2 → Fan 2 load path.
3. ESP32 GPIO 21 → Relay IN3 → Light 1 load path.
4. ESP32 GPIO 22 → Relay IN4 → Light 2 load path.
5. ESP32 GPIO 23 → Relay IN5 → Light 3 load path.
6. ESP32 GPIO 34 → ACS712 OUT.
7. ESP32 GND → relay module GND → ACS712 GND.
8. 5V supply → relay VCC and ACS712 VCC.
9. External load supply passes through relay contacts and ACS712 current path.

## Why This Makes Physical Sense

The ESP32 only produces low-current logic signals. Fans and lights draw more current than GPIO pins can safely supply, so relay modules or driver stages isolate and switch the load. The ACS712 senses current by being placed in series with the load supply path and sends a safe analog signal to the ESP32 ADC pin.
