# Solar Almanac

<!-- readme-axi type=card -->

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz)
[![CI](https://github.com/ngoviet/solar-almanac-card/actions/workflows/ci.yml/badge.svg)](https://github.com/ngoviet/solar-almanac-card/actions/workflows/ci.yml)

**English** · [Tiếng Việt](README.vi.md)

A Lovelace card for Home Assistant that shows a solar power system as **today's page of an almanac**: one look tells you how much the house is using, where the power comes from, how long the battery lasts in a blackout and which hours suit heavy loads.

It is not tied to any inverter brand: all it needs are the power sensors `pv`, `battery` and `grid`; a system without a battery or without the grid also declares `load`. Everything else is optional, and each part hides itself when its entities are missing. The card's labels are in Vietnamese; the quoted labels below are glossed in English.

![The Solar Almanac card on a Home Assistant dashboard](docs/solar-almanac-card.png)

Inspired by [sunsynk-power-flow-card](https://github.com/slipx06/sunsynk-power-flow-card) (MIT, © slipx06).

## Features

- **Three main figures at the same size**: Solar, battery SOC and the house load, each with a bar and a line of text.
- **Particle strip**: solar and battery flow down, the grid flows up from the bottom row, all running towards the House column in the direction of the current.
- **Backup**: "Nếu mất điện" (if the grid goes down; "Pin còn", battery left, on an off-grid system) is how many hours the battery lasts at the current load, and "Đầy sau" (full in) while charging.
- **"Giờ tốt dùng tải lớn" strip** (good hours for heavy loads) built from a forecast such as Solcast; once today's window has passed it moves to tomorrow, and without a forecast it shows the actual output per hour.
- **Header band**: title, grid status, and text warnings for cell imbalance, inverter temperature over a threshold or a stalled cooling fan.
- **Three layouts**: `columns` (default), `flow` (a diagram joined through the inverter, wires as thick as the power) and `inverter` (Sunsynk style, with a row of MPPT boxes).
- Optional **controls**: cooling fan, an Auto button and grid EOD levels; Home Assistant asks for confirmation before anything is written to the inverter.
- Light or dark following Home Assistant; tapping a figure opens the entity's details.

## Installation

Through HACS: **HACS → Custom repositories**, add `ngoviet/solar-almanac-card` with the type **Dashboard**, then install **Solar Almanac**. The build `dist/solar-almanac-card.js` is committed to the repository, so there is nothing to build.

By hand:

1. Copy `dist/solar-almanac-card.js` to `config/www/solar-almanac-card.js` in Home Assistant
2. Add the resource: **Settings → Dashboards → Resources** → `/local/solar-almanac-card.js` (JavaScript module)

## Usage

Minimal:

```yaml
type: custom:solar-almanac-card
entities:
  pv: sensor.pv_power
  battery: sensor.battery_power
  battery_soc: sensor.battery_soc
  grid: sensor.grid_power
```

Complete, for example with LuxPower and Solcast:

```yaml
type: custom:solar-almanac-card
title: Luxpower 6.5kW
battery_capacity: 17.15   # kWh, for the runtime left and the time to full
battery_reserve: 2        # %, where the inverter stops discharging when the grid is down
entities:
  pv: sensor.luxpower_inverter_pv_pv_power
  battery: sensor.luxpower_inverter_battery_battery_flow
  battery_soc: sensor.luxpower_inverter_battery_battery_soc
  grid: sensor.luxpower_inverter_grid_grid_flow
  pv_today: sensor.luxpower_inverter_pv_pv_energy_today
  load_today: sensor.luxpower_inverter_home_consumption_today_calculated
  grid_import_today: sensor.luxpower_inverter_grid_energy_from_grid_today
  grid_export_today: sensor.luxpower_inverter_grid_energy_to_grid_today
  battery_charge_today: sensor.luxpower_inverter_charge_energy_today
  battery_discharge_today: sensor.luxpower_inverter_discharge_energy_today
  forecast_today: sensor.technology_solcast_pv_forecast_forecast_today
  forecast_tomorrow: sensor.technology_solcast_pv_forecast_forecast_tomorrow
  grid_voltage: sensor.luxpower_inverter_grid_grid_voltage
  grid_frequency: sensor.luxpower_inverter_grid_grid_frequency
  grid_connected: binary_sensor.luxpower_inverter_grid_grid_connected
  # Controls; leave them out and the area is not shown
  fan: light.luxpower_fan_controller_luxpower_fan_both_speed
  fan_rpm:
    - sensor.luxpower_fan_controller_fan_1_rpm
    - sensor.luxpower_fan_controller_fan_2_rpm
  fan_auto: input_boolean.luxpower_dual_fan_auto_speed
  fan_stall: binary_sensor.luxpower_fan_controller_luxpower_fan_controller_fan_stall_alarm
  eod: number.luxpower_inverter_battery_on_grid_cut_off_soc
```

Each entity is a string, or an object when the sign has to be flipped:

```yaml
battery:
  entity: sensor.battery_power
  invert: true   # if the inverter reports positive = charging
```

Sign convention (after `invert`):

| Entity  | Positive      | Negative   |
|---------|---------------|------------|
| pv      | producing     | —          |
| battery | discharging   | charging   |
| grid    | buying        | selling    |
| load    | consuming     | —          |

The card converts by `unit_of_measurement`: power accepts `W`, `kW`; energy accepts `Wh`, `kWh`, `MWh`; `cell_delta` accepts `mV`, `V`.

A declared source that cannot be read shows `—` on its line, and the share bar and the status sentence are hidden; only while `grid_connected` reports the grid down is the grid counted as 0. Without `load`, a missing source among the three means the load cannot be worked out: the house figure shows `—`, and the share bar and the status sentence are hidden. A system without a battery or without the grid (no `grid` declared) always misses one of the three sources, so it must declare `load` to get the house figure, the runtime left and the "Pin còn" line in the backup column.

## Configuration

### Options

| Option             | Default  | Meaning                                                        |
|--------------------|----------|----------------------------------------------------------------|
| `title`            | —        | Name on the red band, hidden when the card is too narrow       |
| `theme`            | `auto`   | `auto` follows Home Assistant's light/dark mode, or `light`, `dark` |
| `compact`          | `false`  | Hides the hour strip and the small print; the controls stay    |
| `layout`           | `columns` | `flow`: replaces the three big figures and the particle strip with a diagram, Solar on top, grid left, house right, battery below, joined through the inverter; wires are as thick as the power and dots run in the direction of the flow. Without a grid the battery moves to the left. The rest of the card stays the same. `inverter`: a Sunsynk-style diagram, Solar and the PV boxes top left, battery bottom left, inverter in the middle, house top right, grid bottom right, with elbowed wires; each node's figures for the day sit right next to it (see below) |
| `flow_max_power`   | `5000`   | W, the power drawn as the thickest wire in `layout: flow` and `inverter` |
| `mppts`            | —        | MPPT list for `layout: flow` and `inverter`: each item has `name`, `power`, `voltage`, `current`, `energy_today`. In `flow` they are boxes on the Solar node's row, the first half on the left, the rest on the right; in `inverter` a row of boxes under the Solar node, with a wire from the bottom of each box gathering into the inverter (power, voltage · current, kWh today) |
| `threshold`        | `10`     | W, below this there is no flow                                 |
| `battery_capacity` | —        | kWh, needed for "Nếu mất điện" (runtime in a blackout) and "Đầy sau" (full in) |
| `battery_reserve`  | `0`      | %, the part of the battery left out of the runtime             |
| `forecast_attribute` | detected | Name of the forecast attribute; `detailedHourly`, `detailedForecast` and `watts` are detected |
| `cell_delta_warn`  | —        | mV, above this a text warning appears under the red band       |
| `inverter_temperature_warn` | — | Same, for the inverter temperature                          |
| `eod_levels`       | `[10, 20, 30]` | %, the quick buttons for `eod`                           |
| `savings_label`    | `Tiết kiệm tháng` | Label of the `savings_month` line (default "savings this month"), for example `Tiết kiệm kỳ này` (savings this billing period) |
| `battery_period_label` | `Sạc / xả tháng` | Label of the `battery_charge_period` and `battery_discharge_period` line (default "charge / discharge this month") |
| `band`             | `red`             | Colour of the header band: `red` or `neutral`; warnings stay red |
| `animation`        | `auto`            | Particles on the wires: `auto` stops when the operating system asks for reduced motion (Windows with animation effects turned off counts), `on` (or `true`) always runs, `off` (or `false`) never runs |

### Entities

| Entity                                                    | Used for                                       |
|-----------------------------------------------------------|------------------------------------------------|
| `pv`, `battery`, `grid`                                   | The three sources and the particle paths       |
| `load`                                                    | The "Nhà đang dùng" (house load) figure; left out, it is worked out as pv + battery + grid, only when all three are declared. A system without a battery or without `grid` (a 25.6V DC system) must declare `load`, otherwise the house figure, the runtime left and the "Pin còn" line are lost |
| `battery_soc`                                             | Battery percentage, the SOC bar                |
| `pv_today`, `load_today`, `grid_import_today`, `grid_export_today` | Daily totals; `grid_import_today` and `load_today` give the "Tự cấp" (self-sufficiency) figure |
| `battery_charge_today`, `battery_discharge_today` | kWh charged into and discharged from the battery today, the "Sạc / xả hôm nay" line |
| `battery_charge_period`, `battery_discharge_period` | Same, per month or billing period; the line's label is set with `battery_period_label` (default "Sạc / xả tháng") |
| `forecast_today`, `forecast_tomorrow`                     | kWh values; their hourly forecast attribute builds the hour strip |
| `grid_connected`, `grid_voltage`                          | Grid status on the red band and the blackout warning; tapping it opens the `grid_voltage` history |
| `savings_month`, `cell_delta`, `inverter_temperature`, `grid_frequency` | Small print at the bottom of the page |
| `fan`, `fan_rpm`, `fan_auto`                              | Cooling fan line: `fan` (light, fan or switch) tells on/off, `fan_rpm` is one speed sensor or a list of them, the highest is shown; `fan_auto` (input_boolean or switch) becomes the "Tự động" (Auto) button |
| `fan_stall`                                               | binary_sensor; `on` shows a stalled-fan warning under the red band |
| `eod`                                                     | Grid EOD line: a `number` (or `input_number`) entity holding the battery SOC where discharging stops while the grid is up; each level in `eod_levels` is a button |

### Controls

Declare `fan`, `fan_rpm` or `eod` and a control area appears at the bottom of the card; leave them out, or point them at entities Home Assistant does not have, and the area is skipped. The Auto button toggles `fan_auto`. An EOD level button calls `<domain>.set_value`, and Home Assistant asks for confirmation before writing, because the value goes straight to the inverter; tapping the level already selected does nothing. Tapping the label on the left opens the entity's details.

### `layout: inverter` diagram

The familiar layout of the Sunsynk card, redrawn with HTML text so no text is smaller than 12px on a phone. Each node gathers its own figures:

| Node | Shown next to it |
|------|------------------|
| Solar (top left) | power, a bar and "today / forecast", tomorrow's forecast; the row of PV boxes below |
| Battery (bottom left) | SOC (a battery icon filled to the SOC), charge/discharge now, charge / discharge today, runtime left, cell imbalance |
| Inverter (middle) | inverter temperature, red above `inverter_temperature_warn` |
| House (top right) | power, the source share bar and "% from …", load today, self-sufficiency |
| Grid (bottom right) | power, bought / exported today, voltage · frequency; the header band only keeps "Có lưới" / "Mất lưới" (grid up / grid down) |

Under the diagram stay the status sentence, the hour strip and the controls; the small print keeps only the lines that belong to no node (savings, charge / discharge per period). Without a grid the house moves to the bottom row, wired straight to the inverter. When the node that holds an item is missing (`battery_soc` without `battery`, or `forecast_tomorrow` without `pv`), "Nếu mất điện" / "Pin còn" and "Ngày mai" (tomorrow) appear in the backup row under the diagram.

### Hour strip

"Giờ tốt dùng tải lớn" (good hours for heavy loads) is the run of consecutive hours around the peak hour whose forecast is at least 70% of the peak. Once today's window has passed, the strip moves to tomorrow.

The forecast attribute can be an array of rows (`period_start`, `datetime` or `time` with `pv_estimate` in kW, or `watts`, `power` in W) or an object `{time: W}`. Without a forecast the strip only shows the actual output per hour, read from the history of `pv` and refreshed every 5 minutes.

## Development

```bash
npm install
npm run dev        # opens dev/index.html with fake data
npm run build      # typecheck + build into dist/
npm run watch      # rebuild on every change
```

- `src/solar-almanac-card.ts` — the card (Lit)
- `src/flows.ts` — power split, number formatting, status sentence, good-hours window
- `src/history.ts` — today's history and the hourly forecast
- `src/theme.ts` — light/dark colours generated with palette-axi
- `src/font.ts` — the number font, embedded as base64
- `src/types.ts` — config and `hass` types
- `dev/` — a test page with a fake `hass` and scenarios for charging, discharging, exporting, grid down, warnings, fan off and missing data. Parameters: `?flow`, `?inverter` (add `=1`, `=3` to change the number of MPPT boxes), `&dc` drops grid/fan/EOD like a DC system, `&kb=N` opens scenario N, `&auto` follows the browser's light/dark mode
- `PRODUCT.md`, `DESIGN.md` — product direction and design system

<!-- support:start -->
## Support the project

<p align="center">
  <img src="https://raw.githubusercontent.com/ngoviet/.github/main/assets/support/banner-v2.svg" width="560" alt="Built and maintained by one person in Việt Nam">
</p>

<p align="center">Free and open source. Your support pays for new device support, faster fixes and every release.</p>

<p align="center">
  <a href="https://buymeacoffee.com/ngoviet"><img src="https://raw.githubusercontent.com/ngoviet/.github/main/assets/support/btn-coffee.svg" height="56" alt="Buy me a coffee"></a>
  &nbsp;
  <a href="https://github.com/sponsors/ngoviet"><img src="https://raw.githubusercontent.com/ngoviet/.github/main/assets/support/btn-sponsors.svg" height="56" alt="GitHub Sponsors"></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ngoviet/.github/main/assets/support/vietqr-card.svg" width="300" alt="VietQR — MB Bank — NGO DUC VIET — 911051212">
  &nbsp;
  <img src="https://raw.githubusercontent.com/ngoviet/.github/main/assets/support/crypto-card.svg" width="300" alt="Crypto — BNB Smart Chain (BEP20) — 0xcbf0402b232cb24b4d998f09a4884f87b5f74750">
</p>

<p align="center"><b>Crypto wallet, BNB Smart Chain (BEP20) only:</b><br><code>0xcbf0402b232cb24b4d998f09a4884f87b5f74750</code></p>

<p align="center">🇻🇳 VietQR: scan with any Vietnamese banking app, transfer note <code>Ung ho solar-almanac-card</code>. Thank you for keeping this project alive!</p>
<!-- support:end -->

## License

[MIT](LICENSE) © Ngô Đức Việt. The number font Barlow Condensed © The Barlow Project Authors, embedded under the SIL Open Font License 1.1, see [licenses/Barlow-OFL.txt](licenses/Barlow-OFL.txt).
