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
import type { Category, Company, Product } from "@/types";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ProductForm = z.infer<typeof productSchema>;

const columns = [
  { key: "name", label: "Nome" },
  { key: "price", label: "Preço" },
  { key: "stock", label: "Estoque" },
  { key: "sku", label: "SKU" },
  { key: "status", label: "Status" },
];

const Products = () => {
  const [request, , data] = useFetch<Product[]>();
  const [requestCompanies, , dataCompanies] = useFetch<Company[]>();
  const [requestCategories, , dataCategories] = useFetch<Category[]>();
  const [requestCreate] = useFetch<Product>();
  const [requestUpdate] = useFetch<Product>();
  const [requestDelete] = useFetch<Product>();
  const { user } = useAuth();
  const { editingItem, isFormOpen, openCreate, openEdit, closeForm } =
    useCrudState<Product>("products");

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      gym_id: 0, name: "", description: "", price: "", stock: 0,
      status: "active", sku: "", image_url: "", category: 0,
    },
  });

  const refresh = () =>
    request("/products/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  useEffect(() => {
    refresh();
    requestCompanies("/companies/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    requestCategories("/categories/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    if (editingItem) {
      form.reset({
        gym_id: editingItem.gym_id,
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        stock: editingItem.stock,
        status: editingItem.status,
        sku: editingItem.sku,
        image_url: editingItem.image_url ?? "",
        category: editingItem.category,
      });
    } else {
      form.reset({
        gym_id: 0, name: "", description: "", price: "", stock: 0,
        status: "active", sku: "", image_url: "", category: 0,
      });
    }
  }, [editingItem, isFormOpen, form]);

  const onSubmit = (formData: ProductForm) => {
    if (editingItem) {
      requestUpdate(`/products/${editingItem.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Produto atualizado com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao atualizar produto."));
    } else {
      requestCreate("/products/", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => { toast.success("Produto cadastrado com sucesso!"); closeForm(); refresh(); })
        .catch(() => toast.error("Erro ao cadastrar produto."));
    }
  };

  const handleDelete = (id: string) => {
    requestDelete(`/products/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access}` },
    })
      .then(() => { toast.success("Produto excluído com sucesso!"); refresh(); })
      .catch(() => toast.error("Erro ao excluir produto."));
  };

  return (
    <DataTable
      title="Produtos"
      description="Gerencie os produtos da loja"
      items={data || []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Produto" : "Novo Produto"}
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
              <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl>
                <Input
                  placeholder="0,00"
                  value={field.value ? String(field.value).replace(".", ",") : ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const amount = (parseInt(digits || "0") / 100).toFixed(2);
                    field.onChange(amount);
                  }}
                />
              </FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="stock" render={({ field }) => (
              <FormItem><FormLabel>Estoque</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="sku" render={({ field }) => (
              <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {dataCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
          </div>
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
          <FormField control={form.control} name="image_url" render={({ field }) => (
            <FormItem><FormLabel>URL da Imagem</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
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
