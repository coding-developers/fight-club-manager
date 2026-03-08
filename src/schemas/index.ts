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
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  dateOfBirth: z.string().min(1, "Data obrigatória"),
  modalities: z.array(z.string()).min(1, "Selecione ao menos uma modalidade"),
  status: z.enum(["active", "inactive"]),
});

export const modalitySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().min(5, "Mínimo 5 caracteres"),
  status: z.enum(["active", "inactive"]),
});

export const teacherSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  modalities: z.array(z.string()).min(1, "Selecione ao menos uma modalidade"),
  status: z.enum(["active", "inactive"]),
});

export const productSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().min(5, "Mínimo 5 caracteres"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  status: z.enum(["active", "inactive"]),
});

export const companySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço obrigatório"),
  status: z.enum(["active", "inactive"]),
});
