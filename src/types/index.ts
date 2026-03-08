// ====== Auth ======
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

// ====== Student ======
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  dateOfBirth: string;
  modalities: string[];
  status: "active" | "inactive";
  createdAt: string;
}

export type StudentPayload = Omit<Student, "id" | "createdAt">;

// ====== Modality ======
export interface Modality {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export type ModalityPayload = Omit<Modality, "id" | "createdAt">;

// ====== Teacher ======
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  modalities: string[];
  status: "active" | "inactive";
  createdAt: string;
}

export type TeacherPayload = Omit<Teacher, "id" | "createdAt">;

// ====== Product ======
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  createdAt: string;
}

export type ProductPayload = Omit<Product, "id" | "createdAt">;

// ====== Company ======
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  createdAt: string;
}

export type CompanyPayload = Omit<Company, "id" | "createdAt">;

// ====== API ======
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
