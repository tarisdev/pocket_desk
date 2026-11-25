import { z } from 'zod';

export const PROTOCOL_VERSION = 1;

export const MessageSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.string(),
  requestId: z.string().optional(),
  timestamp: z.number().int().optional(),
  payload: z.unknown().optional(),
});

export type DeskMessage = z.infer<typeof MessageSchema>;

export const PairingRequestSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('pairing.request'),
  requestId: z.string(),
  timestamp: z.number().int(),
  payload: z.object({
    deviceName: z.string(),
    pairingToken: z.string(),
  }),
});

export const PairingResultSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('pairing.result'),
  requestId: z.string(),
  timestamp: z.number().int(),
  payload: z.object({
    success: z.boolean(),
    sessionToken: z.string().optional(),
    computerName: z.string().optional(),
    message: z.string().optional(),
  }),
});

export const HelloSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('hello'),
  requestId: z.string().optional(),
  timestamp: z.number().int().optional(),
  payload: z.object({ client: z.string() }).optional(),
});

export const EchoSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('echo'),
  requestId: z.string().optional(),
  timestamp: z.number().int().optional(),
  payload: z.unknown().optional(),
});

export const QrPairingPayloadSchema = z.object({
  type: z.literal('pocket-desk-pairing'),
  version: z.literal(1),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  token: z.string().min(1),
  protocol: z.literal('ws'),
});

export type PairingRequest = z.infer<typeof PairingRequestSchema>;
export type PairingResult = z.infer<typeof PairingResultSchema>;
export type QrPairingPayload = z.infer<typeof QrPairingPayloadSchema>;

// Dashboard Config schemas
export const DashboardConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  grid: z
    .object({
      columns: z.number().int().positive().default(4),
      rows: z.number().int().positive().default(4),
      gap: z.number().min(0).default(8),
    })
    .optional(),
  widgets: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().min(1),
      height: z.number().int().min(1),
      settings: z.record(z.string(), z.unknown()).optional().default({}),
    })
  ),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  version: z.number().int().default(1),
});

export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;

export const DashboardConfigGetSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('dashboard.config.get'),
  requestId: z.string(),
  timestamp: z.number().int(),
  payload: z
    .object({
      dashboardId: z.string().optional(),
    })
    .optional(),
});

export const DashboardConfigResponseSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('dashboard.config.response'),
  requestId: z.string(),
  timestamp: z.number().int(),
  payload: z.object({
    success: z.boolean(),
    dashboard: DashboardConfigSchema,
    message: z.string().optional(),
  }),
});

export const DashboardConfigUpdateSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('dashboard.config.update'),
  requestId: z.string(),
  timestamp: z.number().int(),
  payload: z.object({
    dashboardId: z.string(),
    dashboard: DashboardConfigSchema,
    expectedVersion: z.number().int().optional(),
  }),
});

export const DashboardConfigUpdatedSchema = z.object({
  version: z.number().int().default(PROTOCOL_VERSION),
  type: z.literal('dashboard.config.updated'),
  requestId: z.string().optional(),
  timestamp: z.number().int(),
  payload: z.object({
    success: z.boolean(),
    dashboard: DashboardConfigSchema,
    version: z.number().int(),
    message: z.string().optional(),
  }),
});

export type DashboardConfigGet = z.infer<typeof DashboardConfigGetSchema>;
export type DashboardConfigResponse = z.infer<
  typeof DashboardConfigResponseSchema
>;
export type DashboardConfigUpdate = z.infer<typeof DashboardConfigUpdateSchema>;
export type DashboardConfigUpdated = z.infer<
  typeof DashboardConfigUpdatedSchema
>;

export function validateMessage(raw: unknown): DeskMessage | null {
  const res = MessageSchema.safeParse(raw);
  return res.success ? res.data : null;
}
