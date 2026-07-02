import React, { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const PRIORITY = {
    high:   { dot: 'bg-red-500'    },
    medium: { dot: 'bg-yellow-500' },
    low:    { dot: 'bg-green-500'  },
};

export default function TaskCard({ task }) {
    const [isEditing, setIsEditing]   = useState(false);
    const [editTitle, setEditTitle]   = useState(task.title);
    const [isDeleting, setIsDeleting] = useState(false);
    const inputRef = useRef(null);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        disabled: isEditing,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
    } : undefined;

    const p = PRIORITY[task.priority] || PRIORITY.medium;

    // ── Save edited title ────────────────────────────────────────
    const handleSave = async () => {
        const trimmed = editTitle.trim();

        if (!trimmed) {
            setEditTitle(task.title);
            setIsEditing(false);
            return;
        }

        if (trimmed === task.title) {
            setIsEditing(false);
            return;
        }

        try {
            await updateDoc(doc(db, 'tasks', task.id), { title: trimmed });
            toast.success('Task updated');
        } catch {
            toast.error('Failed to update');
            setEditTitle(task.title);
        }
        setIsEditing(false);
    };

    // ── Keyboard shortcuts in edit mode ─────────────────────────
    const handleKeyDown = (e) => {
        if (e.key === 'Enter')  handleSave();
        if (e.key === 'Escape') {
            setEditTitle(task.title);
            setIsEditing(false);
        }
    };

    // ── Delete task ──────────────────────────────────────────────
    // SINGLE handleDelete — merged from both versions
    const handleDelete = async (e) => {
        // 1. Prevent the drag-and-drop logic from triggering
        e.preventDefault();
        e.stopPropagation();

        setIsDeleting(true);

        try {
            await deleteDoc(doc(db, 'tasks', task.id));
            toast.success('Task deleted');
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Failed to delete');
            setIsDeleting(false);
        }
    };

    // ── Click title to enter edit mode ──────────────────────────
    const handleTitleClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!isEditing ? listeners : {})}
            {...attributes}
            className={`group relative bg-neutral-800 p-3 rounded-lg border
        transition-all duration-150 select-none
        ${isDeleting ? 'opacity-0 scale-95 pointer-events-none' : ''}
        ${isDragging
                ? 'border-blue-500 opacity-80 scale-105 shadow-lg shadow-blue-500/10 cursor-grabbing'
                : isEditing
                    ? 'border-blue-500/60 cursor-default'
                    : 'border-neutral-700 hover:border-neutral-500 cursor-grab'}`}
        >

            {/* ── Delete button — appears on hover ── */}
            {!isEditing && (
                <button
                    onClick={handleDelete}
                    onPointerDown={(e) => e.stopPropagation()} /* 👈 ADD THIS LINE */
                    disabled={isDeleting}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
            w-6 h-6 flex items-center justify-center rounded
            text-neutral-500 hover:text-red-400 hover:bg-red-400/10
            transition-all duration-150 z-10"
                    title="Delete task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                </button>
            )}

            {/* ── Title: input when editing, text when not ── */}
            <div className="flex items-start gap-2 pr-6">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${p.dot}`} />

                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-neutral-700 text-white text-sm font-medium
              rounded px-2 py-0.5 outline-none border border-blue-500/60
              focus:border-blue-400"
                    />
                ) : (
                    <p
                        onClick={handleTitleClick}
                        className="text-sm font-medium text-white leading-snug
              hover:text-blue-300 cursor-text transition-colors"
                        title="Click to edit"
                    >
                        {task.title}
                    </p>
                )}
            </div>

            {/* ── Description ── */}
            {task.description && !isEditing && (
                <p className="text-xs text-neutral-400 mt-1.5 ml-4 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* ── Footer ── */}
            {!isEditing && (
                <div className="flex justify-between items-center mt-3 ml-4">
          <span className="text-[10px] text-neutral-600">
            {task.createdBy?.split(' ')[0]}
          </span>
                    {task.dueDate && (
                        <span className="text-[10px] text-red-400 font-medium">
              Due {task.dueDate}
            </span>
                    )}
                </div>
            )}

            {/* ── Editing hint ── */}
            {isEditing && (
                <p className="text-[10px] text-neutral-500 mt-2 ml-4">
                    Enter to save · Esc to cancel
                </p>
            )}

        </div>
    );
}