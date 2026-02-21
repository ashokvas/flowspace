"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ProjectsView } from "./ProjectsView";
import { ProjectView } from "./ProjectView";
import { AreaView } from "./AreaView";
import { AllTasksView } from "./AllTasksView";

export type View =
  | { type: "projects" }
  | { type: "project"; projectId: Id<"projects"> }
  | { type: "area"; projectId: Id<"projects">; areaId: Id<"areas"> }
  | { type: "alltasks" };

export function AppShell() {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const [view, setView] = useState<View>({ type: "projects" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const projects = useQuery(api.projects.list, userId ? { userId } : "skip");
  const allTasks = useQuery(api.tasks.listByUser, userId ? { userId } : "skip");
  const pendingCount = allTasks?.filter((t) => t.status !== "done").length ?? 0;

  const navTo = (v: View) => {
    setView(v);
    setSidebarOpen(false);
  };

  const topbarTitle = () => {
    if (view.type === "projects") return "Projects";
    if (view.type === "alltasks") return "All Tasks";
    if (view.type === "project" || view.type === "area") return "";
    return "FlowSpace";
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 99,
            background: "rgba(10,9,20,0.6)", backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        width: 240, minWidth: 240,
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        position: "relative",
        top: 0, left: 0, height: "100%",
        transform: sidebarOpen ? "translateX(0)" : "translateX(0)",
        transition: "transform 0.3s ease",
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>
            Flow<span style={{ color: "var(--accent2)" }}>Space</span>
          </span>
        </div>

        {/* Nav */}
        <div style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
          <NavLabel>Views</NavLabel>
          <NavItem active={view.type === "projects"} onClick={() => navTo({ type: "projects" })} icon="grid">
            Projects
          </NavItem>
          <NavItem active={view.type === "alltasks"} onClick={() => navTo({ type: "alltasks" })} icon="tasks">
            All Tasks
            {pendingCount > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 11, background: "var(--surface2)", padding: "1px 7px", borderRadius: 99, color: "var(--text3)" }}>
                {pendingCount}
              </span>
            )}
          </NavItem>

          {(projects?.length ?? 0) > 0 && (
            <>
              <NavLabel style={{ marginTop: 10 }}>Projects</NavLabel>
              {projects?.map((p) => (
                <NavItem
                  key={p._id}
                  active={view.type === "project" && view.projectId === p._id}
                  onClick={() => navTo({ type: "project", projectId: p._id })}
                  icon="folder"
                  indent
                >
                  {p.name}
                </NavItem>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <UserButton afterSignOutUrl="/sign-in" />
          <span style={{ fontSize: 13, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
          </span>
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{
          padding: "14px 24px", display: "flex", alignItems: "center", gap: 12,
          borderBottom: "1px solid var(--border)", background: "var(--bg)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: "none", background: "none", border: "none", color: "var(--text2)", padding: 4, cursor: "pointer" }}
            className="menu-toggle"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 style={{ fontWeight: 700, fontSize: 20, flex: 1 }}>{topbarTitle()}</h1>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {view.type === "projects" && (
            <ProjectsView userId={userId} onNavigate={navTo} />
          )}
          {view.type === "project" && (
            <ProjectView
              projectId={view.projectId}
              userId={userId}
              onNavigate={navTo}
            />
          )}
          {view.type === "area" && (
            <AreaView
              areaId={view.areaId}
              projectId={view.projectId}
              userId={userId}
              onNavigate={navTo}
            />
          )}
          {view.type === "alltasks" && (
            <AllTasksView userId={userId} onNavigate={navTo} />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .menu-toggle { display: flex !important; }
          .sidebar { position: fixed !important; transform: translateX(-100%) !important; }
          .sidebar.open { transform: translateX(0) !important; box-shadow: 4px 0 30px rgba(0,0,0,0.5) !important; }
        }
      `}</style>
    </div>
  );
}

function NavLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.2px", color: "var(--text3)", textTransform: "uppercase", padding: "4px 10px 8px", ...style }}>
      {children}
    </div>
  );
}

function NavItem({ children, active, onClick, icon, indent }: {
  children: React.ReactNode; active: boolean; onClick: () => void;
  icon: string; indent?: boolean;
}) {
  const icons: Record<string, React.ReactNode> = {
    grid: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    tasks: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    folder: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  };
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 9, padding: "8px 10px",
      borderRadius: 8, cursor: "pointer", fontSize: 13.5,
      color: active ? "var(--accent2)" : "var(--text2)",
      background: active ? "var(--accent-glow)" : "transparent",
      fontWeight: active ? 500 : 400,
      border: "none", width: "100%", textAlign: "left",
      borderLeft: indent ? `2px solid ${active ? "var(--accent)" : "transparent"}` : "none",
      marginLeft: indent ? 12 : 0,
      borderRadius: indent ? "0 8px 8px 0" : 8,
      paddingLeft: indent ? 12 : 10,
      transition: "all 0.15s",
    }}>
      <span style={{ opacity: 0.8, flexShrink: 0 }}>{icons[icon]}</span>
      {children}
    </button>
  );
}
