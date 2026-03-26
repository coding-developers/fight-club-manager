import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { staffSchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { Company, Role, Staff } from "@/types";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type StaffForm = z.infer<typeof staffSchema>;

const columns = [
  { key: "gym_id", label: "Academia" },
  { key: "user_id", label: "Aluno" },
  { key: "role", label: "Função" },
  { key: "hired_at", label: "Contratado em" },
  { key: "status", label: "Status" },
];

const Teachers = () => {
  const [request, , data] = useFetch<Staff[]>();
  const [requestCompanies, , dataCompanies] = useFetch<Company[]>();
  const [requestRoles, , dataRoles] = useFetch<Role[]>();
  const [requestCreate] = useFetch<Staff>();
  const [requestUpdate] = useFetch<Staff>();
  const [requestDelete] = useFetch<Staff>();
  const { user } = useAuth();
  const { editingItem, isFormOpen, openCreate, openEdit, closeForm } =
    useCrudState<Staff>("staff");

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      gym_id: 0, user_id: 0, status: "active",
      hired_at: "", fired_at: "", role: 0,
    },
  });

  const refresh = () =>
    request("/staff/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  useEffect(() => {
    refresh();
    requestCompanies("/companies/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    requestRoles("/roles/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    if (editingItem) {
      form.reset({
        gym_id: editingItem.gym_id,
        user_id: editingItem.user_id,
        status: editingItem.status,
        hired_at: editingItem.hired_at?.split("T")[0] ?? "",
        fired_at: editingItem.fired_at?.split("T")[0] ?? "",
        role: editingItem.role,
      });
    } else {
      form.reset({
        gym_id: 0, user_id: 0, status: "active",
        hired_at: "", fired_at: "", role: 0,
      });
    }
  }, [editingItem, isFormOpen, form]);

  const onSubmit = (formData: StaffForm) => {
    if (editingItem) {
      requestUpdate(`/staff/${editingItem.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Staff atualizado com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao atualizar staff."));
    } else {
      requestCreate("/staff/", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Staff cadastrado com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao cadastrar staff."));
    }
  };

  const handleDelete = (id: string) => {
    requestDelete(`/staff/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access}` },
    })
      .then(() => { toast.success("Staff excluído com sucesso!"); refresh(); })
      .catch(() => toast.error("Erro ao excluir staff."));
  };

  return (
    <DataTable
      title="Staff"
      description="Gerencie a equipe da academia"
      items={data || []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Staff" : "Novo Staff"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="gym_id" render={({ field }) => (
              <FormItem><FormLabel>Academia</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {dataCompanies?.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="user_id" render={({ field }) => (
              <FormItem><FormLabel>ID do Aluno</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="hired_at" render={({ field }) => (
              <FormItem><FormLabel>Data de Contratação</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fired_at" render={({ field }) => (
              <FormItem><FormLabel>Data de Demissão</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem><FormLabel>Função</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {dataRoles?.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
            <Button type="submit">{editingItem ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </form>
      </Form>
    </DataTable>
  );
};

export default Teachers;
