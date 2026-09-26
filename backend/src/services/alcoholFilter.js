/**
 * SafeDrive AI - Alcohol Sensor Filtering & Interlock Control Module
 * Implements 5-sample moving average filter, sensor warmup validation, noise rejection,
 * and safety interlock decision engine.
 */

export class AlcoholFilterService {
  constructor() {
    // Sensor buffer maps: sensorId -> array of raw float readings
    this.rawBuffer = new Map();
    // Warmup timers: sensorId -> start timestamp
    this.warmupStart = new Map();
    
    // Default safety thresholds (BAC equivalent in mg/L or % BAC)
    this.WARNING_THRESHOLD = 0.08;
    this.ALCOHOL_DETECTED_THRESHOLD = 0.20;
    this.WARMUP_TIME_MS = 15000; // 15 seconds stabilization requirement
    this.BUFFER_SIZE = 5; // 5-sample moving average
  }

  /**
   * Filter raw sensor sample and return processed reading + safety state
   * @param {string} sensorId 
   * @param {number} rawValue 
   * @param {number} sensorTemp 
   * @returns {Object} Filtered result
   */
  processSample(sensorId, rawValue, sensorTemp = 25.0) {
    const now = Date.now();

    // Check sensor hardware range errors
    if (rawValue < 0.0 || rawValue > 5.0 || sensorTemp < -10 || sensorTemp > 75) {
      return {
        status: 'SENSOR_ERROR',
        rawReading: rawValue,
        filteredReading: 0.0,
        message: 'Sensor hardware out-of-range or thermal fault.',
        interlockAction: 'BLOCK_START'
      };
    }

    // Check Warmup status
    if (!this.warmupStart.has(sensorId)) {
      this.warmupStart.set(sensorId, now);
    }
    const warmupElapsed = now - this.warmupStart.get(sensorId);
    if (warmupElapsed < this.WARMUP_TIME_MS) {
      const remainingSec = Math.ceil((this.WARMUP_TIME_MS - warmupElapsed) / 1000);
      return {
        status: 'WARMUP_IN_PROGRESS',
        rawReading: rawValue,
        filteredReading: 0.0,
        message: `Alcohol sensor stabilizing. Please wait ${remainingSec} seconds...`,
        interlockAction: 'START_BLOCKED'
      };
    }

    // Append to 5-sample buffer
    if (!this.rawBuffer.has(sensorId)) {
      this.rawBuffer.set(sensorId, []);
    }
    const buffer = this.rawBuffer.get(sensorId);
    buffer.push(rawValue);
    if (buffer.length > this.BUFFER_SIZE) {
      buffer.shift();
    }

    // Calculate moving average
    const sum = buffer.reduce((acc, val) => acc + val, 0);
    const filteredReading = parseFloat((sum / buffer.length).toFixed(3));

    // Determine status & vehicle safety action
    let status = 'SAFE';
    let interlockAction = 'START_ALLOWED';
    let message = 'Alcohol reading safe. Ignition start allowed.';

    if (filteredReading >= this.ALCOHOL_DETECTED_THRESHOLD) {
      status = 'ALCOHOL_DETECTED';
      interlockAction = 'START_BLOCKED';
      message = `🚨 ALCOHOL DETECTED! Reading: ${filteredReading}. Vehicle start BLOCKED.`;
    } else if (filteredReading >= this.WARNING_THRESHOLD) {
      status = 'WARNING';
      interlockAction = 'START_ALLOWED';
      message = `⚠️ WARNING: Low level alcohol detected (${filteredReading}). Drive safely.`;
    }

    return {
      status,
      rawReading: rawValue,
      filteredReading,
      samplesCollected: buffer.length,
      message,
      interlockAction
    };
  }

  resetWarmup(sensorId) {
    this.warmupStart.delete(sensorId);
    this.rawBuffer.delete(sensorId);
  }
}

export const alcoholFilter = new AlcoholFilterService();
