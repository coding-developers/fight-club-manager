export interface User {
  user_id?: number;
  nome?: string;
  email?: string;
  birthDate?: string;
  document?: string;
  phone?: string;
  cpf?: string;
  role: string;
  updated_at: string;
  access_token: string;
  refresh_token: string;
  perms: Array<string>;
  tenant_id?: number | null;
  vendor_id?: number | null;
  requires_2fa?: boolean;
  status?: boolean;
}
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  grupo_permissao_id?: number;
  group_name?: string;
  status: boolean;
  last_login: string;
  cpf: string;
  google_access: boolean;
  user_type: string;
  company_id: number;
}
