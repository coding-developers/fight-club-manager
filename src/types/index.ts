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
  access: string;
  refresh: string;
}

// ====== Student ======
export interface Student {
  id: string;
  gym_id: number;
  status: "active" | "inactive";
  full_name: string;
  level: "client" | "admin" | "personal";
  document: string;
  date_of_birth: string;
  email: string;
  password?: string;
  phone_number: string;
  gender: "male" | "female" | "other";
  avatar_url?: string;
  day_of_payment?: number;
  status_payment?: "active" | "inactive" | "overdue";
  next_date_payment?: string;
  last_date_payment?: string;
  modalities?: number[];
  createdAt: string;
}

export type StudentPayload = Omit<Student, "id" | "createdAt" | "next_date_payment" | "last_date_payment" | "modalities">;

// ====== Modality ======
export interface Modality {
  id: string;
  status: string;
  name: string;
  gym_id: number;
  description?: string;
  price?: string;
  max_capacity?: number;
  createdAt: string;
}

export type ModalityPayload = Omit<Modality, "id" | "createdAt">;

// ====== Staff ======
export interface Staff {
  id: string;
  gym_id: number;
  user_id: number;
  status: "active" | "inactive";
  hired_at: string;
  fired_at?: string;
  role: number;
  createdAt: string;
}

export type StaffPayload = Omit<Staff, "id" | "createdAt">;

// ====== Product ======
export interface Product {
  id: string;
  gym_id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  status: "active" | "inactive";
  sku: string;
  image_url?: string;
  category: number;
  createdAt: string;
}

export type ProductPayload = Omit<Product, "id" | "createdAt">;

// ====== Payment ======
export interface Payment {
  id: string;
  gym_id: number;
  user_id: number;
  user?: Student;
  modality_id?: number;
  amount: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method?: "cash" | "card" | "pix" | "transfer";
  due_date?: string;
  paid_at?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ====== Category ======
export interface Category {
  id: string;
  name: string;
  description?: string;
}

// ====== Role ======
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, unknown>;
}

// ====== Company ======
export interface Company {
  id: string;
  name: string;
  document: string;
  status: string;
  email: string;
  foundation_date: string;
  logo?: string;
  phone_number: string;
  avatar_url?: string;
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
