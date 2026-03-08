import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";
import { useEffect } from "react";

type ProductForm = z.infer<typeof productSchema>;

const columns = [
  { key: "name", label: "Nome" },
  { key: "price", label: "Preço" },
  { key: "stock", label: "Estoque" },
  { key: "status", label: "Status" },
];

const Products = () => {
  const { items, editingItem, isFormOpen, create, update, remove, openCreate, openEdit, closeForm } =
    useCrudState<Product>("products");

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, stock: 0, status: "active" },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name, description: editingItem.description,
        price: editingItem.price, stock: editingItem.stock, status: editingItem.status,
      });
    } else {
      form.reset({ name: "", description: "", price: 0, stock: 0, status: "active" });
    }
  }, [editingItem, isFormOpen]);

  const onSubmit = (data: ProductForm) => {
    if (editingItem) {
      update({ ...editingItem, ...data });
    } else {
      create({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as Product);
    }
    closeForm();
  };

  const renderCell = (item: Product, key: string) => {
    if (key === "price") return `R$ ${item.price.toFixed(2)}`;
    if (key === "status") return (
      <Badge variant={item.status === "active" ? "default" : "secondary"}>
        {item.status === "active" ? "Ativo" : "Inativo"}
      </Badge>
    );
    return String((item as any)[key] ?? "");
  };

  return (
    <DataTable
      title="Produtos"
      description="Gerencie os produtos da loja"
      items={items}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={remove}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Produto" : "Novo Produto"}
      renderCell={renderCell}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="stock" render={({ field }) => (
              <FormItem><FormLabel>Estoque</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
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

export default Products;
