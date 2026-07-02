import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Edit2, Trash2, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";

const SHIFTS = { morning: "Manhã", afternoon: "Tarde", both: "Ambos" };
const STATUSES = { active: "Ativo", inactive: "Inativo", on_leave: "Licença" };
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_LABELS = { monday: "Seg", tuesday: "Ter", wednesday: "Qua", thursday: "Qui", friday: "Sex" };

const emptyTeacher = { name: "", email: "", phone: "", subjects: [], weekly_hours: 20, max_daily_classes: 5, shift_preference: "both", status: "active", availability: {} };

export default function Teachers() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyTeacher });
  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [t, s] = await Promise.all([
        base44.entities.Teacher.list(),
        base44.entities.Subject.list()
      ]);
      setTeachers(t);
      setSubjects(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ ...emptyTeacher }); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...t }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name) return toast({ title: "Nome é obrigatório", variant: "destructive" });
    try {
      if (editing) {
        await base44.entities.Teacher.update(editing.id, form);
        toast({ title: "Professor atualizado" });
      } else {
        await base44.entities.Teacher.create(form);
        toast({ title: "Professor cadastrado" });
      }
      setDialogOpen(false);
      loadData();
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir este professor?")) return;
    await base44.entities.Teacher.delete(id);
    toast({ title: "Professor excluído" });
    loadData();
  };

  const addSubject = () => {
    if (subjectInput && !form.subjects.includes(subjectInput)) {
      setForm({ ...form, subjects: [...form.subjects, subjectInput] });
      setSubjectInput("");
    }
  };

  const removeSubject = (s) => {
    setForm({ ...form, subjects: form.subjects.filter(x => x !== s) });
  };

  const filtered = teachers.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subjects?.some(s => s.toLowerCase().includes(search.toLowerCase()))
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
        title="Professores"
        description={`${teachers.length} professor${teachers.length !== 1 ? "es" : ""} cadastrado${teachers.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Professor
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou disciplina..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/50">
          <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhum professor encontrado.</p>
          <Button variant="outline" className="mt-3" onClick={openCreate}>Cadastrar Professor</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Disciplinas</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Carga Horária</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Turno</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{t.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{t.name}</p>
                          {t.email && <p className="text-xs text-muted-foreground">{t.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(t.subjects || []).map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{t.weekly_hours}h</td>
                    <td className="p-4">{SHIFTS[t.shift_preference] || "Ambos"}</td>
                    <td className="p-4">
                      <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-xs">
                        {STATUSES[t.status] || "Ativo"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Professor" : "Novo Professor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Disciplinas</Label>
              <div className="flex gap-2">
                <Select value={subjectInput} onValueChange={setSubjectInput}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSubject} variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(form.subjects || []).map(s => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s} <X className="w-3 h-3 cursor-pointer" onClick={() => removeSubject(s)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Carga Horária Semanal</Label>
                <Input type="number" value={form.weekly_hours} onChange={(e) => setForm({ ...form, weekly_hours: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Máx. Aulas/Dia</Label>
                <Input type="number" value={form.max_daily_classes} onChange={(e) => setForm({ ...form, max_daily_classes: parseInt(e.target.value) || 5 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preferência de Turno</Label>
                <Select value={form.shift_preference} onValueChange={(v) => setForm({ ...form, shift_preference: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="on_leave">Licença</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
