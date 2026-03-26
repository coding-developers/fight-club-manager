import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { modalitySchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { Company, Modality } from "@/types";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ModalityForm = z.infer<typeof modalitySchema>;

const columns = [
  { key: "name", label: "Nome" },
  { key: "gym_id", label: "Academia" },
  { key: "status", label: "Status" },
];

const Modalities = () => {
  const [request, , data] = useFetch<Modality[]>();
  const [requestCompanies, , dataCompanies] = useFetch<Company[]>();
  const [requestCreate] = useFetch<Modality>();
  const [requestUpdate] = useFetch<Modality>();
  const [requestDelete] = useFetch<Modality>();
  const { user } = useAuth();
  const { editingItem, isFormOpen, openCreate, openEdit, closeForm } =
    useCrudState<Modality>("modalities");

  const form = useForm<ModalityForm>({
    resolver: zodResolver(modalitySchema),
    defaultValues: {
      status: "active",
      name: "",
      gym_id: 0,
      description: "",
      price: "",
      max_capacity: undefined,
    },
  });

  const refresh = () =>
    request("/modalities/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  useEffect(() => {
    refresh();
    requestCompanies("/companies/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    if (editingItem) {
      form.reset({
        status: editingItem.status,
        name: editingItem.name,
        gym_id: editingItem.gym_id,
        description: editingItem.description ?? "",
        price: editingItem.price ?? "",
        max_capacity: editingItem.max_capacity,
      });
    } else {
      form.reset({
        status: "active",
        name: "",
        gym_id: 0,
        description: "",
        price: "",
        max_capacity: undefined,
      });
    }
  }, [editingItem, isFormOpen, form]);

  const onSubmit = (data: ModalityForm) => {
    if (editingItem) {
      requestUpdate(`/modalities/${editingItem.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access}` },
        body: data,
      })
        .then(() => {
          toast.success("Modalidade atualizada com sucesso!");
          closeForm();
          refresh();
        })
        .catch(() => toast.error("Erro ao atualizar modalidade."));
    } else {
      requestCreate("/modalities/", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access}` },
        body: data,
      })
        .then(() => {
          toast.success("Modalidade cadastrada com sucesso!");
          closeForm();
          refresh();
        })
        .catch(() => toast.error("Erro ao cadastrar modalidade."));
    }
  };

  const handleDelete = (id: string) => {
    requestDelete(`/modalities/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access}` },
    })
      .then(() => {
        toast.success("Modalidade excluída com sucesso!");
        refresh();
      })
      .catch(() => toast.error("Erro ao excluir modalidade."));
  };

  return (
    <DataTable
      title="Modalidades"
      description="Gerencie as modalidades de luta"
      items={data || []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Modalidade" : "Nova Modalidade"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Muay Thai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva a modalidade..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0,00"
                      value={
                        field.value ? String(field.value).replace(".", ",") : ""
                      }
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        const amount = (parseInt(digits || "0") / 100).toFixed(
                          2,
                        );
                        field.onChange(amount);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade máxima</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gym_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academia</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dataCompanies?.map((company) => (
                        <SelectItem key={company.id} value={String(company.id)}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingItem ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </Form>
    </DataTable>
  );
};

export default Modalities;
