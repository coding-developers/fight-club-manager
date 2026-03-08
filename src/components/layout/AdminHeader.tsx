import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const AdminHeader = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <SidebarTrigger />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Alternar tema">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user?.name}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
