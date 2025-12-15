/**
 * CARBON CREDIT WALKING ALGORITHM (#6)
 * 
 * Core Logic:
 * Distinguishes WALK/RUN from VEHICLE transport using FFT (Fast Fourier Transform) 
 * on accelerometer data to validat ecological impact.
 */

interface MotionSample {
    x: number;
    y: number;
    z: number;
    timestamp: number;
}

export class CarbonTrafficVerifier {

    // Thresholds (Human gait is typically 1.5Hz - 3Hz)
    private readonly MIN_HUMAN_FREQ = 1.0;
    private readonly MAX_HUMAN_FREQ = 4.0;
    private readonly VEHICLE_VIBRATION_FREQ = 10.0; // Vehicles have high freq engine vibration

    /**
     * Validates if a movement segment corresponds to genuine ecological walking
     * @param samples Array of accelerometer data
     * @returns CO2 grams saved (approx)
     */
    public verifyEcoTransport(samples: MotionSample[], distanceKm: number): number {
        if (samples.length < 50) return 0; // Need more data

        const dominantFrequency = this.calculateDominantFrequency(samples);
        const avgSpeed = this.calculateSpeed(distanceKm, samples);

        // 1. Speed Check: Humans don't run sustained > 25km/h
        if (avgSpeed > 25) {
            console.log("Speed too high - Vehicle detected");
            return 0;
        }

        // 2. Frequency Check: Humans bounce at 2Hz. Cars vibrate >10Hz or are smooth.
        if (dominantFrequency >= this.MIN_HUMAN_FREQ && dominantFrequency <= this.MAX_HUMAN_FREQ) {
            // Valid Human Walk/Run
            // Avg car emits ~120g CO2 per km. 
            // Walking saves this emission.
            return distanceKm * 120;
        }

        console.log("Invalid gait frequency - Vehicle/Passive movement detected");
        return 0;
    }

    /**
     * Simplified Mock of FFT (Fast Fourier Transform)
     * In prod this would use a proper DSP library
     */
    private calculateDominantFrequency(samples: MotionSample[]): number {
        // Mock logic: Count zero-crossings on Z-axis (up/down)
        // to estimate step cadence
        let crossings = 0;
        let avgZ = 0;
        samples.forEach(s => avgZ += s.z);
        avgZ /= samples.length;

        for (let i = 1; i < samples.length; i++) {
            if ((samples[i].z > avgZ && samples[i - 1].z <= avgZ) ||
                (samples[i].z < avgZ && samples[i - 1].z >= avgZ)) {
                crossings++;
            }
        }

        const durationSec = (samples[samples.length - 1].timestamp - samples[0].timestamp) / 1000;
        const cycles = crossings / 2;
        return cycles / durationSec; // Hz
    }

    private calculateSpeed(distKm: number, samples: MotionSample[]): number {
        const durationHr = ((samples[samples.length - 1].timestamp - samples[0].timestamp) / 1000) / 3600;
        return distKm / durationHr;
    }
}
