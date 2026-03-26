import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categorySchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { Category } from "@/types";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type CategoryForm = z.infer<typeof categorySchema>;

const columns = [
  { key: "name", label: "Nome" },
  { key: "description", label: "Descrição" },
];

const Categories = () => {
  const [request, , data] = useFetch<Category[]>();
  const [requestCreate] = useFetch<Category>();
  const [requestUpdate] = useFetch<Category>();
  const [requestDelete] = useFetch<Category>();
  const { user } = useAuth();
  const { editingItem, isFormOpen, openCreate, openEdit, closeForm } =
    useCrudState<Category>("categories");

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  const refresh = () =>
    request("/categories/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (editingItem) {
      form.reset({ name: editingItem.name, description: editingItem.description ?? "" });
    } else {
      form.reset({ name: "", description: "" });
    }
  }, [editingItem]);

  const onSubmit = async (values: CategoryForm) => {
    try {
      if (editingItem) {
        await requestUpdate(`/categories/${editingItem.id}/`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${user.access}` },
          body: values,
        });
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await requestCreate("/categories/", {
          method: "POST",
          headers: { Authorization: `Bearer ${user.access}` },
          body: values,
        });
        toast.success("Categoria criada com sucesso!");
      }
      closeForm();
      refresh();
    } catch {
      toast.error("Erro ao salvar categoria.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestDelete(`/categories/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.access}` },
      });
      toast.success("Categoria removida com sucesso!");
      refresh();
    } catch {
      toast.error("Erro ao remover categoria.");
    }
  };

  return (
    <DataTable
      title="Categorias"
      description="Gerencie as categorias de produtos"
      items={data ?? []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Categoria" : "Nova Categoria"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              {editingItem ? "Salvar" : "Criar"}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </DataTable>
  );
};

export default Categories;
