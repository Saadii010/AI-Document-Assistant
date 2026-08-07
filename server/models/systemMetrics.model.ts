import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemMetrics extends Document {
  cpuUsage: number;
  memoryUsage: {
    total: number;
    free: number;
    used: number;
  };
  diskUsage: {
    total: number;
    free: number;
    used: number;
  };
  services: {
    mongodb: 'healthy' | 'unhealthy';
    faiss: 'healthy' | 'unhealthy';
    geminiApi: 'healthy' | 'unhealthy';
    backend: 'healthy' | 'unhealthy';
    frontend: 'healthy' | 'unhealthy';
  };
  queueLength: number;
  timestamp: Date;
}

const SystemMetricsSchema = new Schema<ISystemMetrics>({
  cpuUsage: { type: Number, required: true },
  memoryUsage: {
    total: { type: Number, required: true },
    free: { type: Number, required: true },
    used: { type: Number, required: true },
  },
  diskUsage: {
    total: { type: Number, required: true },
    free: { type: Number, required: true },
    used: { type: Number, required: true },
  },
  services: {
    mongodb: { type: String, enum: ['healthy', 'unhealthy'], default: 'healthy' },
    faiss: { type: String, enum: ['healthy', 'unhealthy'], default: 'healthy' },
    geminiApi: { type: String, enum: ['healthy', 'unhealthy'], default: 'healthy' },
    backend: { type: String, enum: ['healthy', 'unhealthy'], default: 'healthy' },
    frontend: { type: String, enum: ['healthy', 'unhealthy'], default: 'healthy' },
  },
  queueLength: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

export const SystemMetricsModel = mongoose.models.SystemMetrics || mongoose.model<ISystemMetrics>('SystemMetrics', SystemMetricsSchema);
export default SystemMetricsModel;
