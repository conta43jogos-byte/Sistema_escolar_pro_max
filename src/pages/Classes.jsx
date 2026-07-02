import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, School, Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";

const emptyClass = { name: "", grade: "", shift: "morning", student_count: 30, subjects: [], schedule_status: "pending" };

export default function Classes() {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyClass });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, s, t] = await Promise.all([
        base44.entities.ClassGroup.list(),
        base44.entities.Subject.list(),
        base44.entities.Teacher.list()
      ]);
      setClasses(c);
      setSubjects(s);
      setTeachers(t);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ ...emptyClass }); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.grade) return toast({ title: "Nome e série são obrigatórios", variant: "destructive" });
    try {
      if (editing) {
        await base44.entities.ClassGroup.update(editing.id, form);
        toast({ title: "Turma atualizada" });
      } else {
        await base44.entities.ClassGroup.create(form);
        toast({ title: "Turma cadastrada" });
      }
      setDialogOpen(false);
      loadData();
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir esta turma?")) return;
    await base44.entities.ClassGroup.delete(id);
    toast({ title: "Turma excluída" });
    loadData();
  };

  const addSubjectToForm = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject || form.subjects?.some(s => s.subject_id === subjectId)) return;
    setForm({
      ...form,
      subjects: [...(form.subjects || []), {
        subject_id: subject.id,
        subject_name: subject.name,
        teacher_id: "",
        teacher_name: "",
        weekly_classes: subject.weekly_classes
      }]
    });
  };

  const updateSubjectTeacher = (idx, teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    const updated = [...form.subjects];
    updated[idx] = { ...updated[idx], teacher_id: teacherId, teacher_name: teacher?.name || "" };
    setForm({ ...form, subjects: updated });
  };

  const removeSubjectFromForm = (idx) => {
    setForm({ ...form, subjects: form.subjects.filter((_, i) => i !== idx) });
  };

  const filtered = classes.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.grade?.toLowerCase().includes(search.toLowerCase())
  );

  const statusMap = {
    pending: { label: "Pendente", style: "bg-gray-100 text-gray-600" },
    generated: { label: "Gerada", style: "bg-blue-100 text-blue-700" },
    conflict: { label: "Conflito", style: "bg-red-100 text-red-700" },
    optimized: { label: "Otimizada", style: "bg-emerald-100 text-emerald-700" }
  };

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
        title="Turmas"
        description={`${classes.length} turma${classes.length !== 1 ? "s" : ""} cadastrada${classes.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Nova Turma
          </Button>
        }
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar turma..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 max-w-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/50">
          <School className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhuma turma encontrada.</p>
          <Button variant="outline" className="mt-3" onClick={openCreate}>Cadastrar Turma</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const st = statusMap[c.schedule_status] || statusMap.pending;
            return (
              <div key={c.id} className="bg-card rounded-xl p-5 border border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.grade} • {c.shift === "morning" ? "Manhã" : "Tarde"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" /> {c.student_count || 0} alunos
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {(c.subjects || []).length} disciplinas
                  </Badge>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nome da Turma *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: 6º A" />
              </div>
              <div>
                <Label>Série/Ano *</Label>
                <Input value={form.grade || ""} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="Ex: 6º Ano" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Turno</Label>
                <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nº de Alunos</Label>
                <Input type="number" value={form.student_count || ""} onChange={(e) => setForm({ ...form, student_count: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            {/* Subject assignments */}
            <div>
              <Label>Disciplinas e Professores</Label>
              <div className="mt-2">
                <Select onValueChange={addSubjectToForm}>
                  <SelectTrigger><SelectValue placeholder="Adicionar disciplina..." /></SelectTrigger>
                  <SelectContent>
                    {subjects.filter(s => !(form.subjects || []).some(fs => fs.subject_id === s.id)).map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 mt-3">
                {(form.subjects || []).map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium flex-shrink-0 w-24 truncate">{s.subject_name}</span>
                    <Select value={s.teacher_id || ""} onValueChange={(v) => updateSubjectTeacher(idx, v)}>
                      <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue placeholder="Professor" /></SelectTrigger>
                      <SelectContent>
                        {teachers.filter(t => (t.subjects || []).includes(s.subject_name)).map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                        {teachers.filter(t => !(t.subjects || []).includes(s.subject_name)).length > 0 && teachers.filter(t => (t.subjects || []).includes(s.subject_name)).length === 0 && (
                          <SelectItem value={null} disabled>Nenhum professor disponível</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Input type="number" className="w-16 h-8 text-xs" value={s.weekly_classes} onChange={(e) => {
                      const updated = [...form.subjects];
                      updated[idx] = { ...updated[idx], weekly_classes: parseInt(e.target.value) || 1 };
                      setForm({ ...form, subjects: updated });
                    }} />
                    <span className="text-xs text-muted-foreground">aulas</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => removeSubjectFromForm(idx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
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