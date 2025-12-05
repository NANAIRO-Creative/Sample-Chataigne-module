# LTC Time Converter Module for Chataigne

A Chataigne custom module that converts Time to LTC (Linear Timecode) string format (HH:MM:SS:FF).

More info about Chataigne: https://benjamin.kuperberg.fr/chataigne

## Features

- Converts time values to standard SMPTE/LTC timecode format
- Supports multiple frame rates: 24fps, 25fps, 30fps, 29.97fps (Drop Frame), 60fps
- Drop frame notation support for 29.97fps
- Real-time time tracking from Chataigne's Time module
- Manual time setting via commands

## Installation

1. Download or clone this repository
2. Place the folder inside your `<Documents>/Chataigne/modules` folder
3. Restart Chataigne
4. The module will appear in the Custom category when adding a new module

## Output Values

| Value | Type | Description |
|-------|------|-------------|
| LTC String | String | Current time in LTC format (e.g., "01:23:45:12") |
| Hours | Integer | Hours component (0-23) |
| Minutes | Integer | Minutes component (0-59) |
| Seconds | Integer | Seconds component (0-59) |
| Frames | Integer | Frames component (0-59 depending on frame rate) |

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| Frame Rate | Enum | Select frame rate: 24fps, 25fps, 30fps, 29.97fps (Drop Frame), 60fps |
| Use Drop Frame | Boolean | Enable drop frame notation (;) for 29.97fps |

## Commands

### Set Time
Manually set the timecode with individual components:
- Hours (0-23)
- Minutes (0-59)
- Seconds (0-59)
- Frames (0-59)

### Set Time From Seconds
Set the timecode from a total seconds value (Float).

## LTC Format

The LTC (Linear Timecode) format follows the SMPTE standard:

```
HH:MM:SS:FF
```

- **HH**: Hours (00-23)
- **MM**: Minutes (00-59)
- **SS**: Seconds (00-59)
- **FF**: Frames (00-23/24/29/59 depending on frame rate)

### Drop Frame Notation

For 29.97fps with drop frame enabled, the format uses a semicolon before frames:

```
HH:MM:SS;FF
```

Drop frame timecode skips frame numbers 0 and 1 at the start of each minute, except every 10th minute, to keep the timecode synchronized with real-time.

## Usage Example

1. Add the "LTC Time Converter" module from the Custom category
2. Select your desired frame rate
3. The module will automatically convert Chataigne's time to LTC format
4. Use the LTC String value in mappings to send timecode to other modules/software

## Documentation

- Custom module documentation: https://bkuperberg.gitbook.io/chataigne-docs/modules/custom-modules/making-your-own-module
- SMPTE Timecode: https://en.wikipedia.org/wiki/SMPTE_timecode
- Linear Timecode: https://en.wikipedia.org/wiki/Linear_timecode
