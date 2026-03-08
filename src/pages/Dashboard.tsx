import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, GraduationCap, Package, Building2, TrendingUp } from "lucide-react";

const stats = [
  { title: "Alunos", value: "0", icon: Users, color: "text-primary" },
  { title: "Modalidades", value: "0", icon: Dumbbell, color: "text-accent-foreground" },
  { title: "Professores", value: "0", icon: GraduationCap, color: "text-success" },
  { title: "Produtos", value: "0", icon: Package, color: "text-warning" },
  { title: "Empresas", value: "0", icon: Building2, color: "text-muted-foreground" },
];

const Dashboard = () => {
  // TODO: Fetch real stats from API
  const storedStudents = JSON.parse(localStorage.getItem("students") || "[]");
  const storedModalities = JSON.parse(localStorage.getItem("modalities") || "[]");
  const storedTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
  const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
  const storedCompanies = JSON.parse(localStorage.getItem("companies") || "[]");

  const realStats = [
    { ...stats[0], value: String(storedStudents.length) },
    { ...stats[1], value: String(storedModalities.length) },
    { ...stats[2], value: String(storedTeachers.length) },
    { ...stats[3], value: String(storedProducts.length) },
    { ...stats[4], value: String(storedCompanies.length) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua academia</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {realStats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Início rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use o menu lateral para cadastrar alunos, modalidades, professores, produtos e empresas.
            O sistema está pronto para integração com o backend — basta configurar a URL da API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
