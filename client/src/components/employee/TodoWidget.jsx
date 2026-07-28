import React, { useState, useEffect, useContext } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { getTodos, createTodo, toggleTodo, deleteTodo } from '../../services/todoService';
import { NotificationContext } from '../../context/NotificationContext';

const TodoWidget = () => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useContext(NotificationContext);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await getTodos();
      setTodos(res.data || []);
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await createTodo({ title: newTitle, priority, dueDate: dueDate || null });
      setTodos([res.data, ...todos]);
      setNewTitle('');
      setDueDate('');
      addToast('Todo task added', 'success');
    } catch (e) {
      addToast('Failed to add todo', 'danger');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleTodo(id);
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (e) {
      addToast('Failed to update todo', 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t._id !== id));
      addToast('Todo deleted', 'info');
    } catch (e) {
      addToast('Failed to delete todo', 'danger');
    }
  };

  return (
    <div className="card">
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Personal Todo List</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Track your daily work & priorities</p>
        </div>
        <span className="badge badge-primary">{todos.filter((t) => !t.completed).length} Pending</span>
      </div>

      <form onSubmit={handleAdd} className="flex-row" style={{ gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ flex: '1 1 200px' }}
          required
        />
        <select
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ width: '110px' }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          className="form-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ width: '140px' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
          <Plus size={16} /> Add
        </button>
      </form>

      {loading ? (
        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading todos...</div>
      ) : todos.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No todo items found. Add your first task above!
        </div>
      ) : (
        <div className="flex-col" style={{ gap: '8px' }}>
          {todos.map((todo) => (
            <div
              key={todo._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                background: todo.completed ? 'var(--bg-input)' : 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                opacity: todo.completed ? 0.7 : 1,
              }}
            >
              <div className="flex-row" style={{ gap: '12px', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => handleToggle(todo._id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {todo.completed ? (
                    <CheckCircle2 size={20} color="#22c55e" />
                  ) : (
                    <Circle size={20} color="var(--text-muted)" />
                  )}
                </button>
                <div style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{todo.title}</div>
                  <div className="flex-row" style={{ gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {todo.dueDate && (
                      <span className="flex-row" style={{ gap: '4px' }}>
                        <Calendar size={12} /> {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span
                      style={{
                        color:
                          todo.priority === 'High'
                            ? '#ef4444'
                            : todo.priority === 'Medium'
                            ? '#f59e0b'
                            : '#3b82f6',
                        fontWeight: 600,
                      }}
                    >
                      {todo.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(todo._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                title="Delete todo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoWidget;
