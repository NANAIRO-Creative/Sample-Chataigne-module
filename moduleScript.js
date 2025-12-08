/**
 * LTC Time Converter Module for Chataigne
 * Converts Time to LTC (Linear Timecode) string format (HH:MM:SS:FF)
 */

// Current time components
var currentHours = 0;
var currentMinutes = 0;
var currentSeconds = 0;
var currentFrames = 0;

function init() {
    script.log("LTC Time Converter module initialized");
    updateLTCString();
    updateTotalSeconds();
}

/**
 * Get the frame rate value from the parameter
 */
function getFrameRate() {
    var frameRateParam = local.parameters.frameRate.get();
    if (frameRateParam == "24fps") {
        return 24;
    } else if (frameRateParam == "25fps") {
        return 25;
    } else if (frameRateParam == "30fps") {
        return 30;
    } else if (frameRateParam == "29.97fps") {
        return 29.97;
    } else if (frameRateParam == "60fps") {
        return 60;
    } else {
        return 30;
    }
}

/**
 * Get the max frames based on frame rate
 */
function getMaxFrames() {
    var fps = getFrameRate();
    if (fps == 29.97) return 30;
    if (fps == 60) return 60;
    return Math.floor(fps);
}

/**
 * Check if drop frame mode should be used
 */
function isDropFrame() {
    var frameRateParam = local.parameters.frameRate.get();
    var useDropFrame = local.parameters.useDropFrame.get();
    return useDropFrame && (frameRateParam == "29.97fps");
}

/**
 * Remove decimal part from string
 */
function removeDecimal(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        if (c == ".") {
            break;
        }
        result = result + c;
    }
    return result;
}

/**
 * Pad a number with leading zeros
 */
function padZero(num, length) {
    var str = "" + Math.floor(num);
    str = removeDecimal(str);
    while (str.length < length) {
        str = "0" + str;
    }
    return str;
}

/**
 * Update the LTC string value based on current time components
 */
function updateLTCString() {
    var separator = isDropFrame() ? ";" : ":";
    var ltcString = padZero(currentHours, 2) + ":" +
                    padZero(currentMinutes, 2) + ":" +
                    padZero(currentSeconds, 2) + separator +
                    padZero(currentFrames, 2);

    local.values.ltcString.set(ltcString);
    local.values.hours.set(currentHours);
    local.values.minutes.set(currentMinutes);
    local.values.seconds.set(currentSeconds);
    local.values.frames.set(currentFrames);

    // Sync input parameters with current timecode
    local.parameters.inputHours.set(currentHours);
    local.parameters.inputMinutes.set(currentMinutes);
    local.parameters.inputSeconds.set(currentSeconds);
    local.parameters.inputFrames.set(currentFrames);
}

/**
 * Convert LTC input to total seconds (reverse conversion)
 */
function updateTotalSeconds() {
    var fps = getFrameRate();
    var h = local.parameters.inputHours.get();
    var m = local.parameters.inputMinutes.get();
    var s = local.parameters.inputSeconds.get();
    var f = local.parameters.inputFrames.get();

    var totalSeconds = h * 3600 + m * 60 + s + f / fps;
    local.values.totalSeconds.set(totalSeconds);
}

/**
 * Convert total seconds to time components
 */
function secondsToTimeComponents(totalSeconds) {
    var fps = getFrameRate();
    var maxFrames = getMaxFrames();

    // Calculate total frames
    var totalFrames = Math.floor(totalSeconds * fps);

    // Handle drop frame if enabled
    if (isDropFrame()) {
        // Drop frame compensation for 29.97fps
        // Skip frame numbers 0 and 1 at the start of each minute, except every 10th minute
        var dropFrames = 2;
        var framesPerMin = Math.round(fps * 60);
        var framesPer10Min = Math.round(fps * 60 * 10);

        var d = Math.floor(totalFrames / framesPer10Min);
        var m = totalFrames % framesPer10Min;

        if (m > dropFrames) {
            totalFrames = totalFrames + dropFrames * 9 * d + dropFrames * Math.floor((m - dropFrames) / (framesPerMin - dropFrames));
        } else {
            totalFrames = totalFrames + dropFrames * 9 * d;
        }
    }

    // Calculate time components
    var framesPerSecond = maxFrames;
    var framesPerMinute = framesPerSecond * 60;
    var framesPerHour = framesPerMinute * 60;

    currentHours = Math.floor(totalFrames / framesPerHour) % 24;
    totalFrames = totalFrames % framesPerHour;

    currentMinutes = Math.floor(totalFrames / framesPerMinute);
    totalFrames = totalFrames % framesPerMinute;

    currentSeconds = Math.floor(totalFrames / framesPerSecond);
    currentFrames = totalFrames % framesPerSecond;
}

/**
 * Called when module parameter changes
 */
function moduleParameterChanged(param) {
    var paramName = param.name;

    if (paramName == "Input Time") {
        // Forward conversion: seconds to LTC
        var inputTime = param.get();
        secondsToTimeComponents(inputTime);
        updateLTCString();
        updateTotalSeconds();
    } else if (paramName == "Input Hours" || paramName == "Input Minutes" || paramName == "Input Seconds" || paramName == "Input Frames") {
        // Reverse conversion: LTC to seconds
        updateTotalSeconds();
    } else if (paramName == "Frame Rate" || paramName == "Use Drop Frame") {
        // Frame Rate or Use Drop Frame changed, recalculate both
        var inputTime = local.parameters.inputTime.get();
        secondsToTimeComponents(inputTime);
        updateLTCString();
        updateTotalSeconds();
    }
}

/**
 * Command: Set time directly with HH:MM:SS:FF
 */
function setTime(hours, minutes, seconds, frames) {
    var maxFrames = getMaxFrames();

    currentHours = Math.max(0, Math.min(23, hours));
    currentMinutes = Math.max(0, Math.min(59, minutes));
    currentSeconds = Math.max(0, Math.min(59, seconds));
    currentFrames = Math.max(0, Math.min(maxFrames - 1, frames));

    updateLTCString();
    script.log("Time set to: " + local.values.ltcString.get());
}

/**
 * Command: Set time from total seconds
 */
function setTimeFromSeconds(totalSeconds) {
    secondsToTimeComponents(totalSeconds);
    updateLTCString();
    script.log("Time set from " + totalSeconds + " seconds to: " + local.values.ltcString.get());
}

/**
 * Convert current LTC time to total seconds
 */
function ltcToSeconds() {
    var fps = getFrameRate();
    var totalSeconds = currentHours * 3600 +
                       currentMinutes * 60 +
                       currentSeconds +
                       currentFrames / fps;
    return totalSeconds;
}

/**
 * Get current LTC string
 */
function getLTCString() {
    return local.values.ltcString.get();
}
