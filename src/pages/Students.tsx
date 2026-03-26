import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { studentSchema } from "@/schemas";
import { useCrudState } from "@/hooks/useCrudState";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import type { Company, Modality, Student } from "@/types";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type StudentForm = z.infer<typeof studentSchema>;

const columns = [
  { key: "full_name", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "phone_number", label: "Telefone" },
  { key: "document", label: "Documento" },
  { key: "level", label: "Nível" },
  { key: "status", label: "Status" },
];

const Students = () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [request, isLoading, data] = useFetch<Student[]>();
  const [requestCompanies, , dataCompanies] = useFetch<Company[]>();
  const [requestModalities, , dataModalities] = useFetch<Modality[]>();
  const [requestCreate] = useFetch<Student>();
  const [requestUpdate] = useFetch<Student>();
  const [requestDelete] = useFetch<Student>();
  const { user } = useAuth();
  const { editingItem, isFormOpen, openCreate, openEdit, closeForm } =
    useCrudState<Student>("students");

  const form = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gym_id: 0,
      status: "active",
      full_name: "",
      level: "client",
      document: "",
      date_of_birth: "",
      email: "",
      password: "",
      phone_number: "",
      gender: "male",
      avatar_url: "",
      day_of_payment: undefined,
      status_payment: undefined,
      modality_ids: [],
    },
  });

  useEffect(() => {
    request("/users/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    requestCompanies("/companies/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    requestModalities("/modalities/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        gym_id: editingItem.gym_id,
        status: editingItem.status,
        full_name: editingItem.full_name,
        level: editingItem.level,
        document: editingItem.document,
        date_of_birth: editingItem.date_of_birth?.split("T")[0] ?? "",
        email: editingItem.email,
        password: "",
        phone_number: editingItem.phone_number,
        gender: editingItem.gender,
        avatar_url: editingItem.avatar_url ?? "",
        day_of_payment: editingItem.day_of_payment ?? undefined,
        status_payment: editingItem.status_payment ?? undefined,
        modality_ids: editingItem.modalities ?? [],
      });
    } else {
      form.reset({
        gym_id: 0,
        status: "active",
        full_name: "",
        level: "client",
        document: "",
        date_of_birth: "",
        email: "",
        password: "",
        phone_number: "",
        gender: "male",
        avatar_url: "",
        day_of_payment: undefined,
        status_payment: undefined,
        modality_ids: [],
      });
    }
  }, [editingItem, isFormOpen, form]);

  const refresh = () =>
    request("/users/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  const onSubmit = (formData: StudentForm) => {
    const body = new FormData();
    const { modality_ids, day_of_payment, ...rest } = formData;

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== "") body.append(key, String(value));
    });

    if (day_of_payment) body.append("day_of_payment", String(day_of_payment));

    modality_ids?.forEach((id) => body.append("modality_ids", String(id)));

    if (avatarFile) body.append("avatar", avatarFile);

    if (editingItem) {
      requestUpdate(`/users/${editingItem.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access}` },
        body,
      })
        .then(() => {
          toast.success("Aluno atualizado com sucesso!");
          closeForm();
          refresh();
        })
        .catch(() => toast.error("Erro ao atualizar aluno."));
    } else {
      requestCreate("/users/", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access}` },
        body,
      })
        .then(() => {
          toast.success("Aluno cadastrado com sucesso!");
          closeForm();
          refresh();
        })
        .catch(() => toast.error("Erro ao cadastrar aluno."));
    }
  };

  const handleDelete = (id: string) => {
    requestDelete(`/users/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access}` },
    })
      .then(() => {
        toast.success("Aluno excluído com sucesso!");
        refresh();
      })
      .catch(() => toast.error("Erro ao excluir aluno."));
  };

  return (
    <DataTable
      title="Alunos"
      description="Gerencie os alunos da academia"
      items={data || []}
      columns={columns}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDelete}
      isFormOpen={isFormOpen}
      onCloseForm={closeForm}
      formTitle={editingItem ? "Editar Aluno" : "Novo Aluno"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email + Senha */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Senha{" "}
                    {editingItem && (
                      <span className="text-muted-foreground text-xs">
                        (deixe em branco para manter)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Telefone + CPF */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask="(99) 99999-9999"
                      placeholder="(00) 00000-0000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask="999.999.999-99"
                      placeholder="000.000.000-00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nascimento + Gênero */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nível + Status */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="client">Aluno</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
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

          {/* Academia */}
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

          {/* Dia de Vencimento + Status de Pagamento */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="day_of_payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia de Vencimento</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="Ex: 10"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status_payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status de Pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Em dia</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="overdue">Inadimplente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Modalidades */}
          {dataModalities && dataModalities.length > 0 && (
            <FormField
              control={form.control}
              name="modality_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modalidades</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-3 max-h-40 overflow-y-auto">
                    {dataModalities.map((modality) => {
                      const checked =
                        field.value?.includes(Number(modality.id)) ?? false;
                      return (
                        <div
                          key={modality.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`modality-${modality.id}`}
                            checked={checked}
                            onCheckedChange={(isChecked) => {
                              const id = Number(modality.id);
                              if (isChecked) {
                                field.onChange([...(field.value ?? []), id]);
                              } else {
                                field.onChange(
                                  (field.value ?? []).filter((v) => v !== id),
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`modality-${modality.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {modality.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Foto de perfil */}
          <FormItem className="flex flex-col items-center">
            <FormLabel>Foto de perfil</FormLabel>
            <FileUpload
              value={editingItem?.avatar_url}
              onChange={setAvatarFile}
            />
          </FormItem>

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

export default Students;
