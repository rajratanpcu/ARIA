// AFP Mathematical Hazard & Monte Carlo Simulation Engine
// Simulates hazard rates, non-stationary incident arrival processes, and confidence intervals

export interface HazardPoint {
  day: number;
  expectedRisk: number;
  lowerConfidence95: number;
  upperConfidence95: number;
  testSuiteSize: number;
  hazardRate: number; // probability of regression escape per 10k releases
}

export interface SimulationParameters {
  initialWeight: number;      // w0 (e.g. 0.648)
  baselineWeight: number;     // w_base (e.g. 0.300)
  decayLambda: number;        // lambda (e.g. 0.100/day)
  alpha: number;              // update coefficient (0.400)
  confidenceThreshold: number;// c_min (0.750)
  numIterations: number;      // Monte Carlo runs (e.g. 500)
  forecastHorizonDays: number;// e.g. 30 days
}

export class AfpSimulationEngine {
  /**
   * Projects daily risk decay curve with Monte Carlo confidence intervals and regression hazard
   */
  public generateDecayForecast(params: SimulationParameters): HazardPoint[] {
    const points: HazardPoint[] = [];
    const {
      initialWeight,
      baselineWeight,
      decayLambda,
      forecastHorizonDays,
      numIterations,
    } = params;

    for (let day = 0; day <= forecastHorizonDays; day++) {
      // Deterministic theoretical decay: w(t) = w_baseline + (w0 - w_baseline) * exp(-lambda * t)
      const deterministicRisk = baselineWeight + (initialWeight - baselineWeight) * Math.exp(-decayLambda * day);

      // Monte Carlo stochastic perturbation simulating commit variance across developer teams
      const simulatedRisks: number[] = [];
      for (let i = 0; i < numIterations; i++) {
        // Gaussian noise with std dev proportional to remaining excess risk
        const noise = (Math.random() - 0.5) * 0.04 * Math.exp(-decayLambda * 0.5 * day);
        const r = Math.max(baselineWeight, Math.min(1.0, deterministicRisk + noise));
        simulatedRisks.push(r);
      }

      simulatedRisks.sort((a, b) => a - b);
      const lower95 = simulatedRisks[Math.floor(numIterations * 0.025)];
      const upper95 = simulatedRisks[Math.floor(numIterations * 0.975)];

      // Test suite size projection: scales from 847 tests up to 1334 based on current risk relative to initial peak
      const excessRatio = Math.max(0, (deterministicRisk - baselineWeight) / (initialWeight - baselineWeight || 1.0));
      const testSuiteSize = Math.round(847 + excessRatio * 487);

      // Regression escape hazard rate: elevated testing sharply suppresses escape risk
      // e.g. at w=0.648 hazard is 0.08%, at w=0.300 hazard is 0.72%
      const hazardRate = Number((0.08 + (1 - excessRatio) * 0.64).toFixed(3));

      points.push({
        day,
        expectedRisk: Number(deterministicRisk.toFixed(3)),
        lowerConfidence95: Number(lower95.toFixed(3)),
        upperConfidence95: Number(upper95.toFixed(3)),
        testSuiteSize,
        hazardRate,
      });
    }

    return points;
  }
}

export const afpSimulationEngine = new AfpSimulationEngine();
