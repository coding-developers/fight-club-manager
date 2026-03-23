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
      name: "", next_date_payment: "", last_date_payment: "", type_document: "",
      document: "", status: "", email: "", foundation_date: "", logo: "",
      phone_number: "", avatar_url: "", day_of_payment: 1, status_payment: "", founder: 0,
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
        next_date_payment: editingItem.next_date_payment?.split("T")[0] ?? "",
        last_date_payment: editingItem.last_date_payment?.split("T")[0] ?? "",
        type_document: editingItem.type_document,
        document: editingItem.document,
        status: editingItem.status,
        email: editingItem.email,
        foundation_date: editingItem.foundation_date?.split("T")[0] ?? "",
        logo: editingItem.logo ?? "",
        phone_number: editingItem.phone_number,
        avatar_url: editingItem.avatar_url ?? "",
        day_of_payment: editingItem.day_of_payment,
        status_payment: editingItem.status_payment,
        founder: editingItem.founder,
      });
    } else {
      form.reset({
        name: "", next_date_payment: "", last_date_payment: "", type_document: "",
        document: "", status: "", email: "", foundation_date: "", logo: "",
        phone_number: "", avatar_url: "", day_of_payment: 1, status_payment: "", founder: 0,
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
      title="Empresas"
      description="Gerencie as empresas parceiras"
      items={data || []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Empresa" : "Nova Empresa"}
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
            <FormField control={form.control} name="type_document" render={({ field }) => (
              <FormItem><FormLabel>Tipo de Documento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                    <SelectItem value="CPF">CPF</SelectItem>
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="document" render={({ field }) => (
              <FormItem><FormLabel>Documento</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="foundation_date" render={({ field }) => (
              <FormItem><FormLabel>Data de Fundação</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="founder" render={({ field }) => (
              <FormItem><FormLabel>ID do Fundador</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="next_date_payment" render={({ field }) => (
              <FormItem><FormLabel>Próximo Pagamento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="last_date_payment" render={({ field }) => (
              <FormItem><FormLabel>Último Pagamento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="day_of_payment" render={({ field }) => (
              <FormItem><FormLabel>Dia de Vencimento</FormLabel><FormControl><Input type="number" min={1} max={31} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status_payment" render={({ field }) => (
              <FormItem><FormLabel>Status de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
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
