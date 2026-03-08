import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Swords,
  LayoutDashboard,
  Users,
  Dumbbell,
  GraduationCap,
  Package,
  Building2,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Alunos", url: "/admin/students", icon: Users },
  { title: "Modalidades", url: "/admin/modalities", icon: Dumbbell },
  { title: "Professores", url: "/admin/teachers", icon: GraduationCap },
  { title: "Produtos", url: "/admin/products", icon: Package },
  { title: "Empresas", url: "/admin/companies", icon: Building2 },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Swords className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-sidebar-foreground">Fight Academy</h1>
            <p className="text-xs text-sidebar-foreground/60">Painel Admin</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
