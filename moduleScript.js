// Timecode Converter Module Script
// Converts between float seconds and HH:MM:SS:FF timecode format

var frameRate = 30.0;

function init() {
    script.log("Timecode Converter module initialized");
}

// Helper function to convert float to integer (truncate decimal part)
function toInt(num) {
    if (num >= 0) {
        return num - (num % 1);
    } else {
        return num + (-num % 1);
    }
}

// Called when any module parameter changes
function moduleParameterChanged(param) {
    script.log("Parameter changed: " + param.name);

    if (param.name == "frameRate") {
        frameRate = param.get();
    }
    else if (param.name == "inputTimecode") {
        var timecodeStr = param.get();
        var seconds = timecodeToSeconds(timecodeStr);
        local.values.outputSeconds.set(seconds);
        script.log("Timecode to Seconds: " + timecodeStr + " -> " + seconds);
    }
}

// Command callback: Set seconds and convert to timecode
function setSeconds(seconds) {
    script.log("setSeconds command called with: " + seconds);
    var timecode = secondsToTimecode(seconds);
    local.values.outputTimecode.set(timecode);
    script.log("Seconds to Timecode: " + seconds + " -> " + timecode);
}

// Command callback: Set timecode and convert to seconds
function setTimecode(timecode) {
    script.log("setTimecode command called with: " + timecode);
    var seconds = timecodeToSeconds(timecode);
    local.values.outputSeconds.set(seconds);
    script.log("Timecode to Seconds: " + timecode + " -> " + seconds);
}

// Convert float seconds to HH:MM:SS:FF timecode
function secondsToTimecode(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;

    // Calculate hours, minutes, seconds
    var totalSecondsInt = toInt(totalSeconds);
    var hours = toInt(totalSecondsInt / 3600);
    var remainder = totalSecondsInt - (hours * 3600);
    var minutes = toInt(remainder / 60);
    var seconds = toInt(remainder - (minutes * 60));

    // Calculate frames from the fractional part
    var fractionalSeconds = totalSeconds - totalSecondsInt;
    var frames = toInt(fractionalSeconds * frameRate);

    // Ensure frames don't exceed frameRate - 1
    var maxFrames = toInt(frameRate) - 1;
    if (frames > maxFrames) {
        frames = maxFrames;
    }

    // Format as HH:MM:SS:FF
    var timecode = padZero(hours, 2) + ":" +
                   padZero(minutes, 2) + ":" +
                   padZero(seconds, 2) + ":" +
                   padZero(frames, 2);

    return timecode;
}

// Convert HH:MM:SS:FF timecode to float seconds
function timecodeToSeconds(timecodeStr) {
    // Parse the timecode string
    var parts = timecodeStr.split(":");

    if (parts.length != 4) {
        script.logWarning("Invalid timecode format. Expected HH:MM:SS:FF, got: " + timecodeStr);
        return 0.0;
    }

    // Use parseFloat to convert string to number
    var hours = parseFloat(parts[0]);
    var minutes = parseFloat(parts[1]);
    var seconds = parseFloat(parts[2]);
    var frames = parseFloat(parts[3]);

    // Calculate total seconds
    var totalSeconds = hours * 3600 + minutes * 60 + seconds + (frames / frameRate);

    return totalSeconds;
}

// Helper function to pad numbers with leading zeros
function padZero(num, length) {
    var str = "" + num;
    // Remove decimal part from string (e.g., "6.0" -> "6")
    var dotIndex = str.indexOf(".");
    if (dotIndex >= 0) {
        str = str.substring(0, dotIndex);
    }
    while (str.length < length) {
        str = "0" + str;
    }
    return str;
}
