import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { paymentSchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import type { Company, Modality, Payment, Student } from "@/types";
import { useEffect, useRef, useState } from "react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type PaymentForm = z.infer<typeof paymentSchema>;

const STATUS_LABELS: Record<Payment["status"], string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<Payment["status"], "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
  cancelled: "outline",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  card: "Cartão",
  pix: "Pix",
  transfer: "Transferência",
};

const columns = [
  { key: "user", label: "Usuário" },
  { key: "amount", label: "Valor" },
  { key: "status", label: "Status" },
  { key: "payment_method", label: "Método" },
  { key: "due_date", label: "Vencimento" },
  { key: "description", label: "Descrição" },
];

const fmt = (value: string | number) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Payments = () => {
  const [request, , data] = useFetch<Payment[]>();
  const [requestCreate] = useFetch<Payment>();
  const [requestUpdate] = useFetch<Payment>();
  const [requestDelete] = useFetch<Payment>();
  const [requestCompanies, , dataCompanies] = useFetch<Company[]>();
  const [requestModalities, , dataModalities] = useFetch<Modality[]>();
  const [requestUsers, isLoadingUsers, dataUsers] = useFetch<Student[]>();
  const { user } = useAuth();
  const { editingItem, isFormOpen, openCreate, openEdit, closeForm } =
    useCrudState<Payment>("payments");

  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");
  const userSearchRef = useRef<HTMLDivElement>(null);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      gym_id: 0,
      user_id: 0,
      modality_id: undefined,
      amount: "",
      status: "pending",
      payment_method: undefined,
      due_date: "",
      description: "",
    },
  });

  const refresh = () =>
    request("/payments/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  useEffect(() => {
    refresh();
    requestCompanies("/companies/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    requestModalities("/modalities/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
  }, []);

  // Busca usuários ao digitar
  useEffect(() => {
    if (userSearch.length < 2) return;
    const timeout = setTimeout(() => {
      requestUsers("/users/", {
        method: "GET",
        headers: { Authorization: `Bearer ${user.access}` },
        params: { search: userSearch },
      });
      setShowUserDropdown(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        gym_id: editingItem.gym_id,
        user_id: editingItem.id,
        modality_id: editingItem.modality_id,
        amount: editingItem.amount,
        status: editingItem.status,
        payment_method: editingItem.payment_method,
        due_date: editingItem.due_date?.split("T")[0] ?? "",
        description: editingItem.description ?? "",
      });
      setSelectedUserName(
        editingItem.user
          ? `${editingItem.user.full_name} (${editingItem.user.email})`
          : `ID: ${editingItem.user_id}`
      );
    } else {
      form.reset({
        gym_id: 0, user_id: 0, modality_id: undefined,
        amount: "", status: "pending", payment_method: undefined,
        due_date: "", description: "",
      });
      setSelectedUserName("");
      setUserSearch("");
    }
  }, [editingItem, isFormOpen]);

  const onSubmit = (formData: PaymentForm) => {
    if (editingItem) {
      requestUpdate(`/payments/${editingItem.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Pagamento atualizado com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao atualizar pagamento."));
    } else {
      requestCreate("/payments/", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Pagamento registrado com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao registrar pagamento."));
    }
  };

  const handleDelete = (id: string) => {
    requestDelete(`/payments/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access}` },
    })
      .then(() => { toast.success("Pagamento removido com sucesso!"); refresh(); })
      .catch(() => toast.error("Erro ao remover pagamento."));
  };

  return (
    <DataTable
      title="Pagamentos"
      description="Gerencie os pagamentos da academia"
      items={data ?? []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Pagamento" : "Novo Pagamento"}
      renderCell={(item, key) => {
        if (key === "status")
          return <Badge variant={STATUS_VARIANTS[item.status]}>{STATUS_LABELS[item.status]}</Badge>;
        if (key === "user") return item.user?.full_name ?? `ID: ${item.user_id}`;
        if (key === "amount") return fmt(item.amount);
        if (key === "payment_method") return METHOD_LABELS[item.payment_method ?? ""] ?? "—";
        if (key === "due_date") return item.due_date ?? "—";
        return String((item as any)[key] ?? "—");
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Busca de usuário */}
          <FormField control={form.control} name="user_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário</FormLabel>
              <div ref={userSearchRef} className="relative">
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={selectedUserName || userSearch}
                  onChange={(e) => {
                    setSelectedUserName("");
                    setUserSearch(e.target.value);
                    if (e.target.value.length < 2) setShowUserDropdown(false);
                  }}
                  onFocus={() => {
                    if (userSearch.length >= 2) setShowUserDropdown(true);
                  }}
                />
                {showUserDropdown && (
                  <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                    {isLoadingUsers ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Buscando...</div>
                    ) : dataUsers && dataUsers.length > 0 ? (
                      dataUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                          onMouseDown={() => {
                            field.onChange(Number(u.id));
                            setSelectedUserName(`${u.full_name} (${u.email})`);
                            setUserSearch("");
                            setShowUserDropdown(false);
                          }}
                        >
                          <span className="font-medium">{u.full_name}</span>
                          <span className="text-muted-foreground ml-2">{u.email}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum usuário encontrado</div>
                    )}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )} />

          {/* Academia */}
          <FormField control={form.control} name="gym_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Academia</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value ? String(field.value) : ""}
              >
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dataCompanies?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          {/* Valor */}
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input
                  placeholder="0,00"
                  value={field.value ? String(field.value).replace(".", ",") : ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const amount = (parseInt(digits || "0") / 100).toFixed(2);
                    field.onChange(amount);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Modalidade */}
          <FormField control={form.control} name="modality_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidade</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value ? String(field.value) : ""}
              >
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dataModalities?.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          {/* Status + Método */}
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="payment_method" render={({ field }) => (
              <FormItem>
                <FormLabel>Método</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Vencimento + Descrição */}
          <FormField control={form.control} name="due_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Vencimento</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
            <Button type="submit">{editingItem ? "Salvar" : "Registrar"}</Button>
          </div>
        </form>
      </Form>
    </DataTable>
  );
};

export default Payments;
