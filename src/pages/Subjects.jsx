import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, BookOpen, Search, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";

const COLORS = ["#4F46E5","#059669","#D97706","#DC2626","#7C3AED","#0891B2","#DB2777","#65A30D","#EA580C","#6366F1"];
const emptySubject = { name: "", code: "", weekly_classes: 2, type: "required", requires_lab: false, color: COLORS[0] };

export default function Subjects() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptySubject });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setSubjects(await base44.entities.Subject.list()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptySubject, color: COLORS[subjects.length % COLORS.length] });
    setDialogOpen(true);
  };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name) return toast({ title: "Nome é obrigatório", variant: "destructive" });
    try {
      if (editing) {
        await base44.entities.Subject.update(editing.id, form);
        toast({ title: "Disciplina atualizada" });
      } else {
        await base44.entities.Subject.create(form);
        toast({ title: "Disciplina cadastrada" });
      }
      setDialogOpen(false);
      loadData();
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir esta disciplina?")) return;
    await base44.entities.Subject.delete(id);
    toast({ title: "Disciplina excluída" });
    loadData();
  };

  const filtered = subjects.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

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
        title="Disciplinas"
        description={`${subjects.length} disciplina${subjects.length !== 1 ? "s" : ""} cadastrada${subjects.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Nova Disciplina
          </Button>
        }
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar disciplina..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 max-w-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/50">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhuma disciplina encontrada.</p>
          <Button variant="outline" className="mt-3" onClick={openCreate}>Cadastrar Disciplina</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-card rounded-xl p-5 border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "20", color: s.color }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    {s.code && <p className="text-xs text-muted-foreground">{s.code}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary">{s.weekly_classes} aulas/semana</Badge>
                <Badge variant={s.type === "required" ? "default" : "outline"}>
                  {s.type === "required" ? "Obrigatória" : "Eletiva"}
                </Badge>
                {s.requires_lab && (
                  <Badge variant="outline" className="gap-1">
                    <FlaskConical className="w-3 h-3" /> Lab
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Código</Label>
                <Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ex: MAT01" />
              </div>
              <div>
                <Label>Aulas/Semana</Label>
                <Input type="number" value={form.weekly_classes} onChange={(e) => setForm({ ...form, weekly_classes: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Obrigatória</SelectItem>
                  <SelectItem value="elective">Eletiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Necessita Laboratório</Label>
              <Switch checked={form.requires_lab} onCheckedChange={(v) => setForm({ ...form, requires_lab: v })} />
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