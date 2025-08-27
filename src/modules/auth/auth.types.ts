import { z } from "zod";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Função auxiliar para determinar se o identifier é email ou username
export const isEmail = (identifier: string): boolean => {
  return z.email().safeParse(identifier).success;
};

export const isUsername = (identifier: string): boolean => {
  return z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .regex(/^[a-zA-Z0-9]/)
    .regex(/[a-zA-Z0-9]$/)
    .safeParse(identifier).success;
};

// =============================================================================
// SCHEMAS
// =============================================================================
export const authSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .regex(/^[a-zA-Z0-9]/, "Username must start with a letter or number")
    .regex(/[a-zA-Z0-9]$/, "Username must end with a letter or number"),
  password_hash: z.string().nullable(),
  password_salt: z.string().nullable(),

  // OAuth fields
  github_id: z.string().nullable(),
  google_id: z.string().nullable(),
  discord_id: z.string().nullable(),

  // Security & status
  email_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),

  // Metadata
  last_login: z.date().nullable(),
  password_changed_at: z.date().nullable(),

  // Timestamps
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

// Schema para tabela separada de 2FA
export const twoFactorAuthSchema = z.object({
  id: z.uuid(),
  auth_id: z.uuid(),
  secret: z.string(),
  backup_codes: z.array(z.string()).nullable(),
  enabled_at: z.date(),
  last_used: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

// =============================================================================
// TWO-FACTOR AUTH SCHEMAS (tabela separada - mais limpo)
// =============================================================================

// Schema para criação de 2FA
export const createTwoFactorSchema = twoFactorAuthSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  })
  .partial({
    backup_codes: true,
    last_used: true,
  });

// Schema para setup de 2FA
export const setup2FASchema = z.object({
  password: z.string(), // Confirma senha atual
});

// Schema para confirmação de setup 2FA
export const confirm2FASetupSchema = z.object({
  secret: z.string(),
  totp_code: z.string().length(6),
});

// Schema para criação de auth (INSERT)
// Explicação do formato:
// - omit(): Remove campos que NUNCA devem vir do cliente (auto-gerados)
// - partial(): Torna campos OPCIONAIS (podem ou não ser enviados)
export const createAuthSchema = authSchema
  .omit({
    // Campos auto-gerados pelo sistema - cliente não deve enviar
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  })
  .partial({
    // Campos opcionais - dependem do tipo de registro
    password_hash: true, // Só para registro tradicional
    password_salt: true, // Só para registro tradicional
    github_id: true, // Só para OAuth GitHub
    google_id: true, // Só para OAuth Google
    discord_id: true, // Só para OAuth Discord
    email_verified: true, // Tem default no banco
    is_active: true, // Tem default no banco
    last_login: true, // Preenchido no primeiro login
    password_changed_at: true, // Preenchido quando senha é alterada
  });

// Schema para atualização de auth (UPDATE)
export const updateAuthSchema = createAuthSchema.partial();

// Schema para login com email/senha OU username/senha
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (val) => {
        // Valida se é email válido OU username válido
        const isEmail = z.string().email().safeParse(val).success;
        const isUsername = z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_-]+$/)
          .regex(/^[a-zA-Z0-9]/)
          .regex(/[a-zA-Z0-9]$/)
          .safeParse(val).success;

        return isEmail || isUsername;
      },
      {
        message: "Must be a valid email or username",
      }
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Schema para registro com email/senha
export const registerSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .regex(/^[a-zA-Z0-9]/, "Username must start with a letter or number")
    .regex(/[a-zA-Z0-9]$/, "Username must end with a letter or number"),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

// Schema para OAuth registration/login
export const oauthSchema = z.object({
  provider: z.enum(["github", "google", "discord"]),
  provider_id: z.string(),
  email: z.email(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .regex(/^[a-zA-Z0-9]/, "Username must start with a letter or number")
    .regex(/[a-zA-Z0-9]$/, "Username must end with a letter or number"),
});

// =============================================================================
// PASSWORD RESET SCHEMAS
// =============================================================================

// Schema completo da tabela password_resets
export const passwordResetSchema = z.object({
  id: z.uuid(),
  auth_id: z.string().uuid(),
  token: z.string(),
  expires_at: z.date(),
  used: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

// Schema para criação de password reset
export const createPasswordResetSchema = passwordResetSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  })
  .partial({
    used: true,
  });

// Schema para solicitar reset de senha
export const requestPasswordResetSchema = z.object({
  email: z.email(),
});

// Schema para confirmar reset de senha
export const confirmPasswordResetSchema = z.object({
  token: z.string(),
  new_password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

// =============================================================================
// UTILITY SCHEMAS
// =============================================================================

// Schema para mudança de senha
export const changePasswordSchema = z.object({
  current_password: z.string(),
  new_password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

// Schema para ativação de 2FA (versão antiga - removida)
// export const enable2FASchema = z.object({
//   password: z.string(),
//   totp_code: z.string().length(6),
// });

// Schema para verificação de 2FA (mantém)
export const verify2FASchema = z.object({
  totp_code: z.string().length(6),
});

// Schema para verificação de email
export const verifyEmailSchema = z.object({
  token: z.string(),
});

// =============================================================================
// RESPONSE SCHEMAS (para tipagem de respostas da API)
// =============================================================================

// Auth sem dados sensíveis para resposta da API
export const authResponseSchema = authSchema.omit({
  password_hash: true,
  password_salt: true,
});

// Auth com informações de 2FA
export const authWithTwoFactorSchema = z.object({
  auth: authResponseSchema,
  two_factor: twoFactorAuthSchema
    .pick({
      enabled_at: true,
      last_used: true,
    })
    .nullable(),
});

// Login response
export const loginResponseSchema = z.object({
  user: authResponseSchema,
  token: z.string(),
  refresh_token: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Tipos TypeScript derivados dos schemas
export type Auth = z.infer<typeof authSchema>;
export type CreateAuth = z.infer<typeof createAuthSchema>;
export type UpdateAuth = z.infer<typeof updateAuthSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthWithTwoFactor = z.infer<typeof authWithTwoFactorSchema>;

export type TwoFactorAuth = z.infer<typeof twoFactorAuthSchema>;
export type CreateTwoFactor = z.infer<typeof createTwoFactorSchema>;

export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type CreatePasswordReset = z.infer<typeof createPasswordResetSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OAuthInput = z.infer<typeof oauthSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ConfirmPasswordReset = z.infer<typeof confirmPasswordResetSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;

export type Setup2FA = z.infer<typeof setup2FASchema>;
export type Confirm2FASetup = z.infer<typeof confirm2FASetupSchema>;
export type Verify2FA = z.infer<typeof verify2FASchema>;
export type VerifyEmail = z.infer<typeof verifyEmailSchema>;
