import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, GraduationCap, Package, Building2 } from "lucide-react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  users: {
    clients: number;
    personals: number;
    admins: number;
  };
  companies: number;
  products: number;
  modalities: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [request, isLoading, data] = useFetch<DashboardData>();

  useEffect(() => {
    if (!user) return;
    request("/dashboard/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
  }, [user, request]);

  const stats = [
    { title: "Alunos (clientes)", value: data?.users.clients ?? 0, icon: Users, color: "text-primary" },
    { title: "Personais", value: data?.users.personals ?? 0, icon: GraduationCap, color: "text-success" },
    { title: "Modalidades", value: data?.modalities ?? 0, icon: Dumbbell, color: "text-accent-foreground" },
    { title: "Produtos", value: data?.products ?? 0, icon: Package, color: "text-warning" },
    { title: "Academias", value: data?.companies ?? 0, icon: Building2, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua academia</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">
                {isLoading ? "—" : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
