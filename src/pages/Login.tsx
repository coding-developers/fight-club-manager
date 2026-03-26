import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate } from "react-router-dom";
import { loginSchema } from "@/schemas";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isLoadingPages, isAuthenticated, isLoadingLogin } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await login({ email: data.email, password: data.password });
      toast.success("Login realizado com sucesso!");
    } catch {
      toast.error("E-mail ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-lg bg-black flex items-center justify-center">
            <img src="/img/logo-chess-white.png" alt="Logo" className="h-9 w-9" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">
              Chess Hall
            </CardTitle>
            <CardDescription className="mt-1">
              Entre na sua conta de administrador
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@academia.com" {...field} />
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
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoadingLogin}>
                {isLoadingLogin ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
          {/* <p className="text-center text-sm text-muted-foreground mt-4">
            Não tem conta?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Registre-se
            </Link>
          </p> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
