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
    } else if (frameRateParam == "29.97fps (Drop Frame)") {
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
    return useDropFrame && (frameRateParam == "29.97fps (Drop Frame)");
}

/**
 * Pad a number with leading zeros
 */
function padZero(num, length) {
    var str = Math.floor(num).toString();
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
 * Called when the module's time value changes (from Chataigne sequence/time)
 */
function update(deltaTime) {
    // This function is called every frame by Chataigne
    // Get the current time from the Time module
    var currentTime = local.getTime();
    if (currentTime != undefined && currentTime != null) {
        secondsToTimeComponents(currentTime);
        updateLTCString();
    }
}

/**
 * Called when module parameter changes
 */
function moduleParameterChanged(param) {
    script.log(param.name + " changed to: " + param.get());
    updateLTCString();
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
