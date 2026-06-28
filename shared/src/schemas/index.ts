import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const DemoLoginSchema = z.object({
  demoAccountId: z.string().min(1, 'Demo account is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type DemoLoginInput = z.infer<typeof DemoLoginSchema>;

// ---------------------------------------------------------------------------
// Chat / Messaging
// ---------------------------------------------------------------------------
export const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  sessionId: z.string().uuid().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ---------------------------------------------------------------------------
// EMI Calculator
// ---------------------------------------------------------------------------
export const emiCalculatorSchema = z.object({
  amount: z.number().min(50000).max(10000000),
  rate: z.number().min(1).max(30),
  tenure: z.number().int().min(1).max(360),
});

export const EMICalculatorSchema = emiCalculatorSchema;

export type EMICalculatorInput = z.infer<typeof emiCalculatorSchema>;
