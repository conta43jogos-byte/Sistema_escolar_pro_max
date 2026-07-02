export function generateSchedule(classes, teachers, rooms) {
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const slots = [];
  let order = 0;

  classes.forEach((cls) => {
    const classSubjects = cls.subjects || [];
    classSubjects.forEach((subj) => {
      const teacher = teachers.find((t) => t.id === subj.teacher_id);
      let assigned = 0;
      DAYS.forEach((day) => {
        for (let period = 1; period <= 6; period++) {
          if (assigned >= (subj.weekly_classes || 1)) break;
          const room = rooms?.[order % rooms.length] || { id: "none", name: "Sala Padrão" };
          slots.push({
            id: `gen-${order}`,
            class_group_id: cls.id,
            class_name: cls.name,
            subject_name: subj.name || subj.subject_name,
            subject_id: subj.id || subj.subject_id,
            teacher_id: teacher?.id || subj.teacher_id,
            teacher_name: teacher?.name || "Professor",
            room_id: room.id,
            room_name: room.name,
            day_of_week: day,
            period,
            order,
          });
          assigned++;
          order++;
        }
      });
    });
  });

  return { slots };
}

export function detectConflicts(slots) {
  const conflicts = [];
  const seen = {};
  slots.forEach((slot, idx) => {
    const key = `${slot.teacher_id}-${slot.day_of_week}-${slot.period}`;
    if (seen[key] !== undefined) {
      conflicts.push({
        type: "teacher_double",
        message: `Professor ${slot.teacher_name} tem duas aulas no mesmo horário`,
        slot1: seen[key],
        slot2: idx,
      });
    }
    seen[key] = idx;
  });
  return conflicts;
}
