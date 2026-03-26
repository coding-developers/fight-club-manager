import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { companySchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { Company } from "@/types";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type CompanyForm = z.infer<typeof companySchema>;

const columns = [
  { key: "name", label: "Nome" },
  { key: "document", label: "Documento" },
  { key: "email", label: "E-mail" },
  { key: "phone_number", label: "Telefone" },
  { key: "status", label: "Status" },
];

const Companies = () => {
  const [request, , data] = useFetch<Company[]>();
  const [requestCreate] = useFetch<Company>();
  const [requestUpdate] = useFetch<Company>();
  const [requestDelete] = useFetch<Company>();
  const { user } = useAuth();
  const { editingItem, isFormOpen, openCreate, openEdit, closeForm } =
    useCrudState<Company>("companies");

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "", document: "", status: "", email: "",
      foundation_date: "", logo: "", phone_number: "", avatar_url: "",
    },
  });

  const refresh = () =>
    request("/companies/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  useEffect(() => {
    refresh();
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        document: editingItem.document,
        status: editingItem.status,
        email: editingItem.email,
        foundation_date: editingItem.foundation_date?.split("T")[0] ?? "",
        logo: editingItem.logo ?? "",
        phone_number: editingItem.phone_number,
        avatar_url: editingItem.avatar_url ?? "",
      });
    } else {
      form.reset({
        name: "", document: "", status: "", email: "",
        foundation_date: "", logo: "", phone_number: "", avatar_url: "",
      });
    }
  }, [editingItem, isFormOpen, form]);

  const onSubmit = (formData: CompanyForm) => {
    if (editingItem) {
      requestUpdate(`/companies/${editingItem.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Empresa atualizada com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao atualizar empresa."));
    } else {
      requestCreate("/companies/", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Empresa cadastrada com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao cadastrar empresa."));
    }
  };

  const handleDelete = (id: string) => {
    requestDelete(`/companies/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access}` },
    })
      .then(() => { toast.success("Empresa excluída com sucesso!"); refresh(); })
      .catch(() => toast.error("Erro ao excluir empresa."));
  };

  return (
    <DataTable
      title="Academias"
      description="Gerencie as academias parceiras"
      items={data || []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Academia" : "Nova Academia"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone_number" render={({ field }) => (
              <FormItem><FormLabel>Telefone</FormLabel><FormControl>
                <MaskedInput mask="(99) 99999-9999" placeholder="(00) 00000-0000" {...field} />
              </FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="document" render={({ field }) => (
              <FormItem><FormLabel>CNPJ / CPF</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="foundation_date" render={({ field }) => (
              <FormItem><FormLabel>Data de Fundação</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="logo" render={({ field }) => (
              <FormItem><FormLabel>URL do Logo</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="avatar_url" render={({ field }) => (
            <FormItem><FormLabel>URL do Avatar</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
            <Button type="submit">{editingItem ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </form>
      </Form>
    </DataTable>
  );
};

export default Companies;
