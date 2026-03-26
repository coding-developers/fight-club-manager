import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, GraduationCap, Package, Building2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import useFetch from "@/hooks/useFetch/hook";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  users: { clients: number; personals: number; admins: number };
  companies: number;
  products: number;
  modalities: number;
}

interface FinancialSummary {
  income: { memberships: number; product_sales: number; total: number };
  expenses: { stock_purchases: number; total: number };
  balance: number;
}

const fmt = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Dashboard = () => {
  const { user } = useAuth();
  const [request, isLoading, data] = useFetch<DashboardData>();
  const [requestSummary, isLoadingSummary, summary] = useFetch<FinancialSummary>();

  useEffect(() => {
    if (!user) return;
    request("/dashboard/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
    requestSummary("/payments/summary/", {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access}` },
    });
  }, [user, request, requestSummary]);

  const stats = [
    { title: "Alunos (clientes)", value: data?.users.clients ?? 0, icon: Users, color: "text-primary" },
    { title: "Personais", value: data?.users.personals ?? 0, icon: GraduationCap, color: "text-green-500" },
    { title: "Modalidades", value: data?.modalities ?? 0, icon: Dumbbell, color: "text-accent-foreground" },
    { title: "Produtos", value: data?.products ?? 0, icon: Package, color: "text-yellow-500" },
    { title: "Academias", value: data?.companies ?? 0, icon: Building2, color: "text-muted-foreground" },
  ];

  const financialCards = [
    {
      title: "Receita total",
      value: summary?.income.total ?? 0,
      sub: `Mensalidades: ${fmt(summary?.income.memberships ?? 0)} · Vendas: ${fmt(summary?.income.product_sales ?? 0)}`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Despesas totais",
      value: summary?.expenses.total ?? 0,
      sub: `Compras de estoque: ${fmt(summary?.expenses.stock_purchases ?? 0)}`,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      title: "Saldo",
      value: summary?.balance ?? 0,
      sub: "Receitas − Despesas",
      icon: Wallet,
      color: (summary?.balance ?? 0) >= 0 ? "text-green-500" : "text-red-500",
      bg: (summary?.balance ?? 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua academia</p>
      </div>

      {/* Contadores gerais */}
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

      {/* Resumo financeiro */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resumo financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {financialCards.map((card) => (
            <Card key={card.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`p-1.5 rounded-md ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className={`text-2xl font-bold font-display ${card.color}`}>
                  {isLoadingSummary ? "—" : fmt(card.value)}
                </div>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
