// Real-Time Synthetic Telemetry Streaming Engine for ARIA
// Generates live Android/iOS client exceptions, HTTP failure rate fluctuations, and memory telemetry

export interface TelemetryDataPoint {
  timestamp: string;
  httpErrorRate: number;
  crashRate: number;
  activeUsers: number;
  p95LatencyMs: number;
  memoryPressurePercent: number;
  logLine?: string;
  isAnomaly: boolean;
}

export type TelemetryListener = (point: TelemetryDataPoint) => void;

class TelemetryStreamer {
  private listeners: Set<TelemetryListener> = new Set();
  private intervalId: any = null;
  private isStreaming: boolean = false;
  private anomalyMode: boolean = true; // Simulating INC-7402 spike

  private sampleLogs: string[] = [
    '[INFO]  [checkout-cart] Cart session 0x9f81a initiated by user 41092',
    '[WARN]  [payment-gateway] Downstream card verification latency: 312ms (p95 target: 200ms)',
    '[FATAL] [checkout-cart] DeserializationError: missing field couponMetadata in CartItemState',
    '[ERROR] [checkout-cart] CartPersistenceWorker: corrupted parcel schema detected (expected v14, got v13)',
    '[INFO]  [user-auth] JWT token refreshed via biometrics token pool',
    '[WARN]  [analytics-sdk] Flush queue buffer reached 82% threshold (re-scheduling worker)',
    '[CRITICAL] [checkout-cart] NullPointerException in CartRecalculationEngine.applyDiscounts()',
    '[INFO]  [security-vault] Keystore hardware backed session active',
    '[FATAL] [checkout-cart] FatalException: ClassNotFoundException: com.retailgo.cart.v14.DiscountParcel'
  ];

  public start(intervalMs: number = 3000): void {
    if (this.isStreaming) return;
    this.isStreaming = true;

    this.intervalId = setInterval(() => {
      const point = this.generatePoint();
      this.listeners.forEach((listener) => listener(point));
    }, intervalMs);
  }

  public stop(): void {
    if (!this.isStreaming) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isStreaming = false;
  }

  public toggleAnomalyMode(enable: boolean): void {
    this.anomalyMode = enable;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getIsStreaming(): boolean {
    return this.isStreaming;
  }

  private generatePoint(): TelemetryDataPoint {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // If anomaly mode: spike error rates around 7.8% (paper canonical)
    let httpErrorRate: number;
    let crashRate: number;
    let memoryPressure: number;
    let p95Latency: number;
    let logLine: string;

    if (this.anomalyMode) {
      httpErrorRate = Number((7.0 + Math.random() * 1.8).toFixed(2));
      crashRate = Number((0.35 + Math.random() * 0.25).toFixed(2));
      memoryPressure = Number((78 + Math.random() * 14).toFixed(1));
      p95Latency = Math.floor(480 + Math.random() * 220);
      // Bias toward error logs
      const errorLogs = this.sampleLogs.filter((l) => l.includes('FATAL') || l.includes('ERROR') || l.includes('CRITICAL'));
      logLine = `${now.toISOString()} ${errorLogs[Math.floor(Math.random() * errorLogs.length)]}`;
    } else {
      httpErrorRate = Number((0.8 + Math.random() * 0.6).toFixed(2));
      crashRate = Number((0.02 + Math.random() * 0.04).toFixed(2));
      memoryPressure = Number((42 + Math.random() * 8).toFixed(1));
      p95Latency = Math.floor(140 + Math.random() * 40);
      logLine = `${now.toISOString()} ${this.sampleLogs[Math.floor(Math.random() * this.sampleLogs.length)]}`;
    }

    return {
      timestamp: timeStr,
      httpErrorRate,
      crashRate,
      activeUsers: 1100000 + Math.floor(Math.random() * 20000),
      p95LatencyMs: p95Latency,
      memoryPressurePercent: memoryPressure,
      logLine,
      isAnomaly: this.anomalyMode,
    };
  }
}

export const telemetryStreamer = new TelemetryStreamer();
