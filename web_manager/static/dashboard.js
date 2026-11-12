const REFRESH_INTERVAL = 2000;

const $ = (id) => document.getElementById(id);

async function fetchJSON(url, options = {}) {
    const csrfToken = document.querySelector(
        'meta[name="csrf-token"]'
    )?.content;

    const headers = {
        ...options.headers
    };

    if (options.method === "POST" && csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(url, {
        credentials: "same-origin",
        ...options,
        headers
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
    }

    return result;
}

function updateServiceStatus(data) {
    const running = data.running === true;

    $("service-status").textContent =
        running ? "RUNNING" : "STOPPED";

    $("service-status").className =
        "status-value " +
        (running ? "status-running" : "status-stopped");

    $("service-mode").textContent = data.mode || "--";

    const collector = data.collector || {};

    $("collector-status").textContent =
        collector.running ? "RUNNING" : "STOPPED";

    $("collection-count").textContent =
        collector.collection_count ?? 0;

    $("start-btn").disabled = running;
    $("stop-btn").disabled = !running;
}

function updateSensorData(data) {
    const sensors = data?.sensors || [];

    const getSensor = (type) =>
        sensors.find(item => item.sensor_type === type);

    const setStatus = (id, sensor) => {
        setText(id, sensor?.success ? "Online" : "No data");
    };

    const fmt = (value, digits = 2) =>
        value === null || value === undefined
            ? "--"
            : Number(value).toFixed(digits);

    // Radar
    const radar = getSensor("radar");

    setStatus("radar-status", radar);

    ["front", "back", "left", "right"].forEach(direction => {
        setText(
            `radar-${direction}`,
            radar?.success ? radar.distances?.[direction] : "--"
        );
    });

    // Temperature
    const temperature = getSensor("temperature");

    setStatus("temperature-status", temperature);
    setText(
        "temperature-value",
        temperature?.success ? fmt(temperature.value) : "--"
    );

    // GPS
    const gps = getSensor("gps");

    setStatus("gps-status", gps);
    setText("gps-latitude", gps?.success ? fmt(gps.latitude, 6) : "--");
    setText("gps-longitude", gps?.success ? fmt(gps.longitude, 6) : "--");
    setText("gps-altitude", gps?.success ? fmt(gps.altitude) : "--");
    setText("gps-satellites", gps?.success ? gps.satellites : "--");

    // IMU
    const imu = getSensor("imu");

    setStatus("imu-status", imu);
    setText("imu-roll", imu?.success ? fmt(imu.orientation?.roll) : "--");
    setText("imu-pitch", imu?.success ? fmt(imu.orientation?.pitch) : "--");
    setText("imu-yaw", imu?.success ? fmt(imu.orientation?.yaw) : "--");
    setText(
        "imu-temperature",
        imu?.success ? fmt(imu.temperature) : "--"
    );

    // Battery
    const battery = getSensor("battery");

    setStatus("battery-status", battery);
    setText("battery-voltage", battery?.success ? fmt(battery.voltage) : "--");
    setText("battery-current", battery?.success ? fmt(battery.current) : "--");
    setText("battery-power", battery?.success ? fmt(battery.power) : "--");
    setText("battery-level", battery?.success ? battery.battery_level : "--");

    // Camera
    const camera = getSensor("camera");

    setStatus("camera-status", camera);
    setText(
        "camera-resolution",
        camera?.success
            ? `${camera.resolution?.width ?? "--"} x ${camera.resolution?.height ?? "--"}`
            : "--"
    );
    setText("camera-fps", camera?.success ? camera.fps : "--");
    setText("camera-format", camera?.success ? camera.format : "--");

    // Depth Camera
    const depthCamera = getSensor("depth_camera");

    setStatus("depth-camera-status", depthCamera);
    setText(
        "depth-camera-resolution",
        depthCamera?.success
            ? `${depthCamera.resolution?.width ?? "--"} x ${depthCamera.resolution?.height ?? "--"}`
            : "--"
    );
    setText(
        "depth-camera-depth",
        depthCamera?.success ? fmt(depthCamera.depth) : "--"
    );
    setText("depth-camera-fps", depthCamera?.success ? depthCamera.fps : "--");

    $("last-update").textContent =
        data?.timestamp
            ? new Date(data.timestamp).toLocaleString()
            : "--";
}

function setText(id, value) {
    const element = $(id);
    if (element) {
        element.textContent = value ?? "--";
    }
}

function formatMetric(value, unit = "") {
    return value === null || value === undefined
        ? "--"
        : `${value}${unit}`;
}

function updateSystemMetrics(data) {
    const cpu = data?.cpu || {};
    const memory = data?.memory || {};
    const storage = data?.storage || {};
    const uptime = data?.uptime || {};
    const temperatures = data?.temperatures || {};
    const accelerators = data?.accelerators || {};
    const gpu = accelerators.gpu || {};
    const npu = accelerators.npu || {};

    setText("system-cpu-usage",
        formatMetric(cpu.usage_percent, "%"));
    setText("system-cpu-frequency",
        formatMetric(cpu.frequency_mhz, " MHz"));
    setText("system-cpu-temperature",
        formatMetric(cpu.temperature_c, " °C"));

    setText("system-memory",
        memory.used_mb !== undefined
            ? `${memory.used_mb} / ${memory.total_mb} MB (${memory.usage_percent}%)`
            : "--");

    setText("system-storage",
        storage.used_gb !== undefined
            ? `${storage.used_gb} / ${storage.total_gb} GB (${storage.usage_percent}%)`
            : "--");

    setText("system-uptime", uptime.text || "--");

    setText("system-gpu-usage",
        formatMetric(gpu.usage_percent, "%"));
    setText("system-gpu-frequency",
        formatMetric(gpu.current_freq_mhz, " MHz"));
    setText("system-gpu-temperature",
        formatMetric(temperatures["gpu-thermal"], " °C"));

    setText("system-npu-usage",
        formatMetric(npu.usage_percent, "%"));
    setText("system-npu-frequency",
        formatMetric(npu.current_freq_mhz, " MHz"));
    setText("system-npu-temperature",
        formatMetric(temperatures["npu-thermal"], " °C"));
}

async function refreshSystemMetrics() {
    try {
        const result = await fetchJSON("/api/system");
        updateSystemMetrics(result.data);
    } catch (error) {
        console.error("System metrics refresh failed:", error);

        [
            "system-cpu-usage",
            "system-cpu-frequency",
            "system-cpu-temperature",
            "system-memory",
            "system-storage",
            "system-uptime",
            "system-gpu-usage",
            "system-gpu-frequency",
            "system-gpu-temperature",
            "system-npu-usage",
            "system-npu-frequency",
            "system-npu-temperature"
        ].forEach(id => setText(id, "--"));
    }
}

async function refreshDashboard() {
    try {
        const [statusResult, dataResult] = await Promise.all([
            fetchJSON("/api/status"),
            fetchJSON("/api/data")
        ]);

        updateServiceStatus(statusResult.data);
        updateSensorData(dataResult.data);

    } catch (error) {
        console.error("Dashboard refresh failed:", error);

        $("operation-message").textContent =
            "Connection error: " + error.message;
    }
}

async function controlService(action) {
    const button = $(action + "-btn");
    const message = $("operation-message");

    button.disabled = true;
    message.textContent = action.toUpperCase() + " in progress...";

    try {
        const result = await fetchJSON(
            `/api/service/${action}`,
            { method: "POST" }
        );

        message.textContent =
            result.message || "Operation completed.";

    } catch (error) {
        message.textContent =
            "Operation failed: " + error.message;

    } finally {
        await refreshDashboard();
    }
}

$("start-btn").addEventListener("click", () => {
    controlService("start");
});

$("stop-btn").addEventListener("click", () => {
    controlService("stop");
});

const hardwareDetailsButton = $("hardware-details-btn");
const hardwareDetails = $("hardware-details");

hardwareDetailsButton.addEventListener("click", () => {
    const expanded = hardwareDetails.hidden;
    hardwareDetails.hidden = !expanded;
    hardwareDetailsButton.setAttribute("aria-expanded", String(expanded));
    hardwareDetailsButton.textContent =
        expanded ? "Hide Hardware Details" : "Hardware Details";
});

refreshDashboard();
refreshSystemMetrics();

setInterval(refreshDashboard, REFRESH_INTERVAL);
setInterval(refreshSystemMetrics, REFRESH_INTERVAL);
