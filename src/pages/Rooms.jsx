import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, DoorOpen, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";

const TYPES = { classroom: "Sala de Aula", lab: "Laboratório", auditorium: "Auditório", sports: "Quadra/Esportes" };
const TYPE_ICONS = { classroom: "🏫", lab: "🔬", auditorium: "🎭", sports: "⚽" };
const emptyRoom = { name: "", type: "classroom", capacity: 40, available: true };

export default function Rooms() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyRoom });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setRooms(await base44.entities.Room.list()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ ...emptyRoom }); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...r }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name) return toast({ title: "Nome é obrigatório", variant: "destructive" });
    try {
      if (editing) {
        await base44.entities.Room.update(editing.id, form);
        toast({ title: "Sala atualizada" });
      } else {
        await base44.entities.Room.create(form);
        toast({ title: "Sala cadastrada" });
      }
      setDialogOpen(false);
      loadData();
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir esta sala?")) return;
    await base44.entities.Room.delete(id);
    toast({ title: "Sala excluída" });
    loadData();
  };

  const filtered = rooms.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Salas"
        description={`${rooms.length} sala${rooms.length !== 1 ? "s" : ""} cadastrada${rooms.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Nova Sala
          </Button>
        }
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar sala..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 max-w-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/50">
          <DoorOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhuma sala encontrada.</p>
          <Button variant="outline" className="mt-3" onClick={openCreate}>Cadastrar Sala</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className={`bg-card rounded-xl p-5 border border-border/50 hover:shadow-md transition-shadow ${!r.available ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="text-3xl mb-2">{TYPE_ICONS[r.type] || "🏫"}</div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{TYPES[r.type]}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" /> {r.capacity} lugares
                </div>
                <Badge variant={r.available ? "default" : "secondary"} className="text-xs">
                  {r.available ? "Disponível" : "Indisponível"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Sala" : "Nova Sala"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nome/Número *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Sala 101" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Sala de Aula</SelectItem>
                    <SelectItem value="lab">Laboratório</SelectItem>
                    <SelectItem value="auditorium">Auditório</SelectItem>
                    <SelectItem value="sports">Quadra/Esportes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacidade</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Disponível</Label>
              <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editing ? "Salvar" : "Cadastrar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}