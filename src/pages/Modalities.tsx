import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { modalitySchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { Modality } from "@/types";
import { useEffect } from "react";

type ModalityForm = z.infer<typeof modalitySchema>;

const columns = [
  { key: "name", label: "Nome" },
  { key: "description", label: "Descrição" },
  { key: "status", label: "Status" },
];

const Modalities = () => {
  const { items, editingItem, isFormOpen, create, update, remove, openCreate, openEdit, closeForm } =
    useCrudState<Modality>("modalities");

  const form = useForm<ModalityForm>({
    resolver: zodResolver(modalitySchema),
    defaultValues: { name: "", description: "", status: "active" },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({ name: editingItem.name, description: editingItem.description, status: editingItem.status });
    } else {
      form.reset({ name: "", description: "", status: "active" });
    }
  }, [editingItem, isFormOpen]);

  const onSubmit = (data: ModalityForm) => {
    if (editingItem) {
      update({ ...editingItem, ...data });
    } else {
      create({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as Modality);
    }
    closeForm();
  };

  return (
    <DataTable
      title="Modalidades"
      description="Gerencie as modalidades de luta"
      items={items}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={remove}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Modalidade" : "Nova Modalidade"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Muay Thai" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Descreva a modalidade..." {...field} /></FormControl><FormMessage /></FormItem>
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

export default Modalities;
