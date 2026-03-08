import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { teacherSchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { Teacher } from "@/types";
import { useEffect } from "react";

type TeacherForm = z.infer<typeof teacherSchema>;

const columns = [
  { key: "name", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefone" },
  { key: "status", label: "Status" },
];

const Teachers = () => {
  const { items, editingItem, isFormOpen, create, update, remove, openCreate, openEdit, closeForm } =
    useCrudState<Teacher>("teachers");

  const form = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: "", email: "", phone: "", cpf: "", modalities: [], status: "active" },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name, email: editingItem.email, phone: editingItem.phone,
        cpf: editingItem.cpf, modalities: editingItem.modalities, status: editingItem.status,
      });
    } else {
      form.reset({ name: "", email: "", phone: "", cpf: "", modalities: [], status: "active" });
    }
  }, [editingItem, isFormOpen]);

  const onSubmit = (data: TeacherForm) => {
    if (editingItem) {
      update({ ...editingItem, ...data });
    } else {
      create({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as Teacher);
    }
    closeForm();
  };

  return (
    <DataTable
      title="Professores"
      description="Gerencie os professores da academia"
      items={items}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={remove}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Professor" : "Novo Professor"}
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
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Telefone</FormLabel><FormControl><MaskedInput mask="(99) 99999-9999" placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="cpf" render={({ field }) => (
            <FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
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

export default Teachers;
