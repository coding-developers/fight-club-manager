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
import { FileUpload } from "@/components/ui/file-upload";
import type { Company, Student } from "@/types";
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
  { key: "status", label: "Status" },
];

const Students = () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [request, isLoading, data] = useFetch<Student[]>();
  const [requestCompanies, isLoadingCompanies, dataCompanies] =
    useFetch<Company[]>();
  const [requestCreate, isLoadingCreate, dataCreate] = useFetch<Student>();
  const [requestUpdate, isLoadingUpdate, dataUpdate] = useFetch<Student>();
  const [requestDelete, isLoadingDelete, dataDelete] = useFetch<Student>();
  const { user } = useAuth();
  const {
    editingItem,
    isFormOpen,
    openCreate,
    openEdit,
    closeForm,
  } = useCrudState<Student>("students");

  const form = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      company_id: 0,
      status: "active",
      full_name: "",
      level: "",
      document: "",
      date_of_birth: "",
      email: "",
      password: "",
      phone_number: "",
      gender: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    request("/students/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    requestCompanies("/companies/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    if (editingItem) {
      form.reset({
        company_id: editingItem.company_id,
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
      });
    } else {
      form.reset({
        company_id: 0,
        status: "active",
        full_name: "",
        level: "client",
        document: "",
        date_of_birth: "",
        email: "",
        password: "",
        phone_number: "",
        gender: "",
        avatar_url: "",
      });
    }
  }, [editingItem, isFormOpen, form]);

  const refresh = () =>
    request("/students/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });

  const onSubmit = (data: StudentForm) => {
    const formData = new FormData();
    Object.entries({ ...data, level: "client" }).forEach(([key, value]) => {
      if (value !== undefined && value !== "")
        formData.append(key, String(value));
    });
    if (avatarFile) formData.append("avatar", avatarFile);

    if (editingItem) {
      requestUpdate(`/students/${editingItem.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
      })
        .then(() => {
          toast.success("Aluno atualizado com sucesso!");
          closeForm();
          refresh();
        })
        .catch(() => toast.error("Erro ao atualizar aluno."));
    } else {
      requestCreate("/students/", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access}` },
        body: formData,
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
    requestDelete(`/students/${id}/`, {
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
          <div className="grid grid-cols-2 gap-4">
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
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
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
          </div>
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
