export function generateSchedule(classes, teachers, rooms) {
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const slots = [];
  const usageMap = {};
  let order = 0;

  classes.forEach((cls) => {
    const classSubjects = cls.subjects || [];
    classSubjects.forEach((subj) => {
      const teacher = teachers.find((t) => t.id === subj.teacher_id);
      let assigned = 0;

      for (let d = 0; d < DAYS.length && assigned < (subj.weekly_classes || 1); d++) {
        const day = DAYS[d];
        for (let period = 1; period <= 6 && assigned < (subj.weekly_classes || 1); period++) {
          const teacherKey = `${teacher?.id || subj.teacher_id}-${day}-${period}`;
          if (usageMap[teacherKey]) continue;

          const room = rooms?.[order % rooms.length] || { id: "none", name: "Sala Padrão" };
          usageMap[teacherKey] = true;

          slots.push({
            class_group_id: cls.id,
            class_group_name: cls.name,
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
      }
    });
  });

  const conflicts = detectConflicts(slots);
  return { slots, conflicts };
}

export function detectConflicts(slots) {
  const conflicts = [];
  const teacherMap = {};
  const roomMap = {};
  slots.forEach((slot, idx) => {
    const tKey = `${slot.teacher_id}-${slot.day_of_week}-${slot.period}`;
    if (teacherMap[tKey] !== undefined) {
      conflicts.push({
        type: "teacher_double",
        message: `Professor ${slot.teacher_name} tem duas aulas no mesmo horário (${slot.day_of_week}, ${slot.period}º)`,
      });
    } else {
      teacherMap[tKey] = idx;
    }
    const rKey = `${slot.room_id}-${slot.day_of_week}-${slot.period}`;
    if (roomMap[rKey] !== undefined) {
      conflicts.push({
        type: "room_double",
        message: `Sala ${slot.room_name} tem duas aulas no mesmo horário (${slot.day_of_week}, ${slot.period}º)`,
      });
    } else {
      roomMap[rKey] = idx;
    }
  });
  return conflicts;
}
