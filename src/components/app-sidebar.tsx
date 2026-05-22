import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useStore } from "@/hooks/use-store";
import {
  createDeck,
  createFolder,
  deleteDeck,
  deleteFolder,
  renameDeck,
  renameFolder,
} from "@/lib/storage";
import type { Folder } from "@/lib/types";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Layers,
  Plus,
  Sparkles,
  Home,
} from "lucide-react";

export function AppSidebar() {
  const store = useStore();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const rootFolders = store.folders.filter((f) => f.parentId === null);
  const rootDecks = store.decks.filter((d) => d.folderId === null);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg">Inkwell</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans-ui">
              Quiet study
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link to="/" className="font-sans-ui">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/import"}>
                  <Link to="/import" className="font-sans-ui">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Import</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>My Decks</span>
            <div className="flex gap-1">
              <NewFolderDialog />
              <NewDeckDialog />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rootFolders.map((f) => (
                <FolderNode key={f.id} folder={f} depth={0} />
              ))}
              {rootDecks.map((d) => (
                <DeckRow key={d.id} id={d.id} name={d.name} active={pathname === `/deck/${d.id}`} />
              ))}
              {rootFolders.length === 0 && rootDecks.length === 0 && (
                <p className="px-2 py-3 text-xs text-muted-foreground font-sans-ui">
                  No decks yet. Create one or import with AI.
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <p className="text-[10px] text-muted-foreground font-sans-ui leading-relaxed">
          All decks live in your browser. Nothing leaves your device except text you choose to send for AI generation.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

function FolderNode({ folder, depth }: { folder: Folder; depth: number }) {
  const store = useStore();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(true);
  const children = store.folders.filter((f) => f.parentId === folder.id);
  const decks = store.decks.filter((d) => d.folderId === folder.id);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpen((o) => !o)}
              className="font-sans-ui"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span className="truncate">{folder.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => {
              const name = prompt("Subfolder name");
              if (name?.trim()) createFolder(name.trim(), folder.id);
            }}
          >
            New subfolder
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              const name = prompt("New deck name");
              if (name?.trim()) createDeck(name.trim(), folder.id);
            }}
          >
            New deck here
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              const name = prompt("Rename folder", folder.name);
              if (name?.trim()) renameFolder(folder.id, name.trim());
            }}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            className="text-destructive"
            onClick={() => {
              if (confirm(`Delete folder "${folder.name}" and all its decks?`)) deleteFolder(folder.id);
            }}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {open && (
        <>
          {children.map((c) => (
            <FolderNode key={c.id} folder={c} depth={depth + 1} />
          ))}
          {decks.map((d) => (
            <DeckRow
              key={d.id}
              id={d.id}
              name={d.name}
              depth={depth + 1}
              active={pathname === `/deck/${d.id}`}
            />
          ))}
        </>
      )}
    </>
  );
}

function DeckRow({
  id,
  name,
  depth = 0,
  active,
}: {
  id: string;
  name: string;
  depth?: number;
  active: boolean;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={active}>
            <Link
              to="/deck/$deckId"
              params={{ deckId: id }}
              className="font-sans-ui"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="truncate">{name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            const n = prompt("Rename deck", name);
            if (n?.trim()) renameDeck(id, n.trim());
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive"
          onClick={() => {
            if (confirm(`Delete deck "${name}"?`)) deleteDeck(id);
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function NewFolderDialog() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<string>("root");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-6 w-6" title="New folder">
          <FolderPlus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="font-sans-ui text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Anatomy, Civils, Chapter 4…" />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans-ui text-xs">Parent</Label>
            <Select value={parent} onValueChange={setParent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">— Top level —</SelectItem>
                {store.folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!name.trim()) return;
              createFolder(name.trim(), parent === "root" ? null : parent);
              setName("");
              setOpen(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewDeckDialog() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [folder, setFolder] = useState<string>("root");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-6 w-6" title="New deck">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="font-sans-ui text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Krebs cycle, Constitutional law…" />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans-ui text-xs">Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">— Top level —</SelectItem>
                {store.folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!name.trim()) return;
              createDeck(name.trim(), folder === "root" ? null : folder);
              setName("");
              setOpen(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}