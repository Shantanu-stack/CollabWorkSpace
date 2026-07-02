import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import {
    collection, onSnapshot, query, orderBy,
    doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import {
    DndContext, useDroppable, closestCorners
} from '@dnd-kit/core';
import toast, { Toaster } from 'react-hot-toast';
import TaskCard from './components/TaskCard';

const COLUMNS = [
    { id: 'todo',        title: 'To Do',       emoji: '📋', limit: 5  },
    { id: 'in-progress', title: 'In Progress',  emoji: '⚡', limit: 3  },
    { id: 'done',        title: 'Done',          emoji: '✅', limit: 99 },
];

const PRIORITY_OPTIONS = [
    { value: 'all',    label: 'All priorities' },
    { value: 'high',   label: '🔴  High'        },
    { value: 'medium', label: '🟡  Medium'       },
    { value: 'low',    label: '🟢  Low'          },
];

// ── Droppable Column ───────────────────────────────────────────
function DroppableColumn({ col, tasks }) {
    const { setNodeRef, isOver } = useDroppable({ id: col.id });
    const isOverLimit = col.limit < 99 && tasks.length >= col.limit;

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col rounded-xl border transition-all duration-200
        ${isOver
                ? 'border-blue-500/60 bg-blue-500/10 dark:bg-blue-950/10'
                : isOverLimit
                    ? 'border-red-500/60 bg-red-500/10 dark:border-red-700/60 dark:bg-red-950/10'
                    : 'border-slate-300 bg-slate-50/50 dark:border-white/[0.06] dark:bg-white/[0.03]'}`}
            style={{ width: '320px', minWidth: '320px', minHeight: '520px' }}
        >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-300 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <span className="text-base">{col.emoji}</span>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200 tracking-wide">
                        {col.title}
                    </h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium tabular-nums
          ${isOverLimit
                    ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25'
                    : 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-white/[0.07] dark:text-neutral-400 dark:border-white/[0.06]'}`}>
          {tasks.length}{col.limit < 99 ? ` / ${col.limit}` : ''}
        </span>
            </div>

            {/* Task list */}
            <div className="flex flex-col gap-2.5 p-3 flex-1">
                {tasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs text-slate-400 dark:text-neutral-700 select-none">
                            {isOver ? 'Drop here' : 'No tasks'}
                        </p>
                    </div>
                )}
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard({ user }) {
    const [tasks, setTasks]             = useState([]);
    const [isAdding, setIsAdding]       = useState(false);
    const [loading, setLoading]         = useState(false);
    const [newTask, setNewTask]         = useState({
        title: '', description: '', priority: 'medium', dueDate: ''
    });
    const [searchQuery, setSearchQuery]       = useState('');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        const q = query(collection(db, 'tasks'));
        return onSnapshot(q, snap =>
            setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
    }, []);

    const filteredTasks = useMemo(() =>
            tasks.filter(task => {
                const matchesSearch   = task.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
                return matchesSearch && matchesPriority;
            }),
        [tasks, searchQuery, filterPriority]);

    const isFiltering = searchQuery !== '' || filterPriority !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setFilterPriority('all');
    };

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const isColumn  = COLUMNS.some(c => c.id === over.id);
        const newStatus = isColumn
            ? over.id
            : tasks.find(t => t.id === over.id)?.status;
        if (!newStatus) return;
        const task = tasks.find(t => t.id === active.id);
        if (!task || newStatus === task.status) return;
        try {
            await updateDoc(doc(db, 'tasks', active.id), { status: newStatus });
            const colName = COLUMNS.find(c => c.id === newStatus)?.title ?? newStatus;
            toast.success(`Moved to ${colName}`, { duration: 2000 });
        } catch {
            toast.error('Failed to move task');
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'tasks'), {
                title:       newTask.title.trim(),
                description: newTask.description.trim(),
                priority:    newTask.priority,
                dueDate:     newTask.dueDate,
                status:      'todo',
                createdBy:   user.displayName || user.email,
                createdAt:   serverTimestamp(),
            });
            toast.success('Task added!');
            setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
            setIsAdding(false);
        } catch {
            toast.error('Failed to add task');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total',       value: tasks.length                                  },
        { label: 'To do',       value: tasks.filter(t => t.status === 'todo').length },
        { label: 'In progress', value: tasks.filter(t => t.status === 'in-progress').length },
        { label: 'Done',        value: tasks.filter(t => t.status === 'done').length },
    ];

    return (
        <div className="min-h-screen text-slate-900 dark:text-neutral-200 p-6 md:p-8 transition-colors">

            <Toaster
                position="bottom-right"
                toastOptions={{
                    className: 'dark:bg-[#1c1c1c] dark:text-[#e5e5e5] dark:border-white/[0.08] bg-white text-slate-900 border-slate-200 border',
                    style: {
                        fontSize: '13px',
                        borderRadius: '10px',
                    },
                    success: { iconTheme: { primary: '#4ade80', secondary: 'transparent' } },
                    error:   { iconTheme: { primary: '#f87171', secondary: 'transparent' } },
                }}
            />

            {/* ── Header ── */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Nexus Workspace
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">
                        {/* 👇 Updated to say Guest if no name exists */}
                        Welcome back, {user?.displayName?.split(' ')[0] || 'Guest'}
                    </p>
                </div>
                <div className="flex items-center gap-3">

                    {/* 👇 The new fallback logic for the avatar */}
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="avatar"
                            className="w-7 h-7 rounded-full ring-1 ring-slate-200 dark:ring-white/10"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full ring-1 ring-slate-200 dark:ring-white/10 bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            G
                        </div>
                    )}

                    <button
                        onClick={() => signOut(auth)}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200
              transition-colors px-3 py-1.5 rounded-lg
              border border-slate-300 hover:border-slate-400 dark:border-white/[0.06] dark:hover:border-white/10"
                    >
                        Sign out
                    </button>
                </div>
            </header>
            {/* ── Stats row ── */}
            <div className="grid grid-cols-4 gap-3 mb-8 max-w-lg">
                {stats.map(s => (
                    <div key={s.label}
                         className="rounded-xl border border-slate-300 bg-white/50 dark:border-white/[0.06] dark:bg-white/[0.03] px-4 py-3">
                        <p className="text-[11px] text-slate-500 dark:text-neutral-500 mb-1">{s.label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3 mb-6">

                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
            text-slate-400 dark:text-neutral-500 pointer-events-none"
                         fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="bg-white border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-white/[0.04] dark:border-white/[0.07] rounded-lg
              pl-8 pr-8 py-2 text-xs border dark:text-white dark:placeholder-neutral-600
              focus:outline-none focus:border-slate-400 dark:focus:border-white/15 w-48 transition-colors"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2
                text-slate-400 hover:text-slate-600 dark:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6 6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Priority filter */}
                <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-700 dark:bg-white/[0.04] dark:border-white/[0.07] rounded-lg
            px-3 py-2 text-xs dark:text-neutral-300
            focus:outline-none focus:border-slate-400 dark:focus:border-white/15 transition-colors"
                >
                    {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-[#1a1a1a] dark:text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Filter status */}
                {isFiltering && (
                    <>
            <span className="text-xs text-slate-500 dark:text-neutral-600">
              {filteredTasks.length} of {tasks.length}
            </span>
                        <button onClick={clearFilters}
                                className="text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-600 dark:hover:text-neutral-300
                transition-colors underline underline-offset-2">
                            Clear
                        </button>
                    </>
                )}

                {/* Add Task button — far right */}
                <button
                    onClick={() => setIsAdding(true)}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2
            bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-lg
            dark:hover:bg-neutral-100 transition-colors"
                >
                    <span className="text-base leading-none">+</span>
                    Add Task
                </button>
            </div>

            {/* ── Board ── */}
            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="flex gap-5 overflow-x-auto pb-6">
                    {COLUMNS.map(col => (
                        <DroppableColumn
                            key={col.id}
                            col={col}
                            tasks={filteredTasks.filter(t => t.status === col.id)}
                        />
                    ))}
                </div>
            </DndContext>

            {/* Empty state */}
            {isFiltering && filteredTasks.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-500 dark:text-neutral-600 text-sm">
                        No tasks match{' '}
                        {searchQuery && <span className="text-slate-800 dark:text-neutral-400">"{searchQuery}"</span>}
                        {filterPriority !== 'all' && ` · ${filterPriority} priority`}
                    </p>
                    <button onClick={clearFilters}
                            className="mt-3 text-xs text-slate-500 hover:text-slate-700 dark:text-neutral-600 dark:hover:text-neutral-400
              underline underline-offset-2 transition-colors">
                        Clear filters
                    </button>
                </div>
            )}

            {/* ── Add Task Modal ── */}
            {isAdding && (
                <div
                    className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm
            flex items-center justify-center z-50 p-4"
                    onClick={e => e.target === e.currentTarget && setIsAdding(false)}
                >
                    <div className="bg-white border border-slate-200 dark:bg-neutral-950 dark:border-white/[0.08]
            rounded-2xl p-6 w-full max-w-md shadow-2xl">

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">New Task</h2>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="text-slate-400 hover:text-slate-600 dark:text-neutral-600 dark:hover:text-neutral-300
                  transition-colors w-6 h-6 flex items-center justify-center"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6 6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-500
                  uppercase tracking-wider block mb-1.5">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                                    placeholder="What needs to be done?"
                                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                    dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white dark:placeholder-neutral-600
                    rounded-lg px-3 py-2.5 text-sm focus:outline-none
                    focus:border-slate-500 dark:focus:border-white/20 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-500
                  uppercase tracking-wider block mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={newTask.description}
                                    onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Optional details..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                    dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white dark:placeholder-neutral-600
                    rounded-lg px-3 py-2.5 text-sm focus:outline-none
                    focus:border-slate-500 dark:focus:border-white/20 transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-500
                    uppercase tracking-wider block mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-300 text-slate-900
                      dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white
                      rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-500 dark:focus:border-white/20 transition-colors"
                                    >
                                        <option value="low" className="bg-white text-slate-900 dark:bg-[#0d0d0d] dark:text-white">🟢  Low</option>
                                        <option value="medium" className="bg-white text-slate-900 dark:bg-[#0d0d0d] dark:text-white">🟡  Medium</option>
                                        <option value="high" className="bg-white text-slate-900 dark:bg-[#0d0d0d] dark:text-white">🔴  High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-500
                    uppercase tracking-wider block mb-1.5">
                                        Due date
                                    </label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-300 text-slate-900
                      dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white [color-scheme:light] dark:[color-scheme:dark]
                      rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-500 dark:focus:border-white/20 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !newTask.title.trim()}
                                    className="flex-1 bg-slate-900 text-white hover:bg-slate-800
                    dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-sm
                    font-semibold py-2.5 rounded-lg disabled:opacity-40 transition-colors"
                                >
                                    {loading ? 'Adding...' : 'Add Task'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300
                    dark:bg-white/[0.05] dark:text-neutral-400 dark:border-white/[0.06] dark:hover:bg-white/[0.08]
                    text-sm py-2.5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}