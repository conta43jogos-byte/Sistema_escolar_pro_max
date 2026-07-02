const storage = {
  Teacher: JSON.parse(localStorage.getItem('bd_Teacher') || '[]'),
  Subject: JSON.parse(localStorage.getItem('bd_Subject') || '[]'),
  ClassGroup: JSON.parse(localStorage.getItem('bd_ClassGroup') || '[]'),
  Room: JSON.parse(localStorage.getItem('bd_Room') || '[]'),
  ScheduleSlot: JSON.parse(localStorage.getItem('bd_ScheduleSlot') || '[]'),
  save(name) {
    localStorage.setItem(`bd_${name}`, JSON.stringify(this[name]));
  }
};

function createEntity(name) {
  const store = () => storage[name];
  const save = () => storage.save(name);
  return {
    list: async () => [...(store() || [])],
    create: async (data) => {
      const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...data };
      store().push(item);
      save();
      return item;
    },
    update: async (id, data) => {
      const idx = store().findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Not found');
      store()[idx] = { ...store()[idx], ...data };
      save();
      return store()[idx];
    },
    delete: async (id) => {
      const idx = store().findIndex(i => i.id === id);
      if (idx > -1) { store().splice(idx, 1); save(); }
    },
    deleteMany: async () => { storage[name] = []; save(); },
    bulkCreate: async (items) => {
      const created = items.map(item => ({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...item }));
      store().push(...created);
      save();
      return created;
    },
  };
}

export const base44 = {
  auth: {
    me: async () => {
      const token = localStorage.getItem('authToken');
      if (token) return JSON.parse(localStorage.getItem('user') || '{}');
      throw new Error('Not authenticated');
    },
    loginViaEmailPassword: async (email, password) => {
      const user = { id: '1', email, name: email.split('@')[0] };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    },
    loginWithProvider: (provider, redirectUrl) => {
      localStorage.setItem('authToken', 'mock-token-' + provider);
      window.location.href = redirectUrl;
    },
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    register: async (userData) => {
      const user = { id: '1', ...userData };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
  },
  entities: {
    Teacher: createEntity('Teacher'),
    Subject: createEntity('Subject'),
    ClassGroup: createEntity('ClassGroup'),
    Room: createEntity('Room'),
    ScheduleSlot: createEntity('ScheduleSlot'),
  }
};

export default base44;
