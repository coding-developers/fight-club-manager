import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export const studentSchema = z.object({
  gym_id: z.coerce.number().min(1, "Academia obrigatória"),
  status: z.enum(["active", "inactive"]),
  full_name: z.string().min(2, "Mínimo 2 caracteres"),
  level: z.enum(["client", "admin", "personal"]),
  document: z.string().min(11, "Documento inválido"),
  date_of_birth: z.string().min(1, "Data obrigatória"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").or(z.literal("")).optional(),
  phone_number: z.string().min(10, "Telefone inválido"),
  gender: z.enum(["male", "female", "other"]),
  avatar_url: z.string().optional(),
  day_of_payment: z.coerce.number().min(1).max(31).optional().or(z.literal("")),
  status_payment: z.enum(["active", "inactive", "overdue"]).optional(),
  modality_ids: z.array(z.number()).optional(),
});

export const modalitySchema = z.object({
  status: z.string().min(1, "Status obrigatório"),
  name: z.string().min(2, "Mínimo 2 caracteres"),
  gym_id: z.coerce.number().min(1, "Academia obrigatória"),
  description: z.string().optional(),
  price: z.string().optional(),
  max_capacity: z.coerce.number().optional(),
});

export const staffSchema = z.object({
  gym_id: z.coerce.number().min(1, "Academia obrigatória"),
  user_id: z.coerce.number().min(1, "Usuário obrigatório"),
  status: z.enum(["active", "inactive"]),
  hired_at: z.string().min(1, "Data de contratação obrigatória"),
  fired_at: z.string().optional(),
  role: z.coerce.number().min(1, "Função obrigatória"),
});

export const productSchema = z.object({
  gym_id: z.coerce.number().min(1, "Academia obrigatória"),
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().min(5, "Mínimo 5 caracteres"),
  price: z.string().min(1, "Preço obrigatório"),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  status: z.enum(["active", "inactive"]),
  sku: z.string().min(1, "SKU obrigatório"),
  image_url: z.string().optional(),
  category: z.coerce.number().min(1, "Categoria obrigatória"),
});

export const paymentSchema = z.object({
  gym_id: z.coerce.number().min(1, "Academia obrigatória"),
  user_id: z.coerce.number().min(1, "Usuário obrigatório"),
  modality_id: z.coerce.number().optional(),
  amount: z.string().min(1, "Valor obrigatório"),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]),
  payment_method: z.enum(["cash", "card", "pix", "transfer"]).optional(),
  due_date: z.string().optional(),
  description: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  document: z.string().min(11, "Documento inválido"),
  status: z.string().min(1, "Status obrigatório"),
  email: z.string().email("E-mail inválido"),
  foundation_date: z.string().min(1, "Data de fundação obrigatória"),
  logo: z.string().optional(),
  phone_number: z.string().min(10, "Telefone inválido"),
  avatar_url: z.string().optional(),
});
