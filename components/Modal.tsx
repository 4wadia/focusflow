import React, { useState, useEffect } from 'react';
import { Priority, ModalType, Task, Subtask } from '../types';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  type: ModalType;
  task?: Task; // Optional task for editing
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, type, task, errorMessage, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  // Duration State (Strings for manual input)
  const [durationHours, setDurationHours] = useState("0");
  const [durationMins, setDurationMins] = useState("30");

  // Time State (Strings for manual input)
  const [dueHour, setDueHour] = useState("12");
  const [dueMin, setDueMin] = useState("00");
  const [dueAmPm, setDueAmPm] = useState('PM');

  // Subtasks State
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [newTagText, setNewTagText] = useState('');

  // Predefined tag colors for quick selection
  const presetTags = ['Design', 'Backend', 'Frontend', 'Urgent', 'Review', 'Bug'];

  useEffect(() => {
    if (isOpen) {
      if (type === 'EDIT_TASK' && task) {
        // Pre-fill for editing
        setTitle(task.title);
        setPriority(task.priority === 'Completed' ? 'Medium' : task.priority);

        // Parse Duration: "1h 30m" or "30m" or "1h"
        const dStr = task.duration || '';
        const hMatch = dStr.match(/(\d+)h/);
        const mMatch = dStr.match(/(\d+)m/);
        setDurationHours(hMatch ? hMatch[1] : "0");
        setDurationMins(mMatch ? mMatch[1] : "0");

        // Parse Due Time: "2:30 PM"
        if (task.dueTime) {
          const parts = task.dueTime.split(' ');
          if (parts.length === 2) {
            const [timePart, amPmPart] = parts;
            const [h, m] = timePart.split(':');
            setDueHour(h);
            setDueMin(m);
            setDueAmPm(amPmPart);
          }
        } else {
          // Defaults
          setDueHour("12");
          setDueMin("00");
          setDueAmPm('PM');
        }

        // Load subtasks
        setSubtasks(task.subtasks || []);

        // Load tags
        setTags(task.tags || []);

      } else {
        // Reset for adding
        setTitle('');
        setPriority('Medium');
        setDurationHours("0");
        setDurationMins("30");
        setDueHour("12");
        setDueMin("00");
        setDueAmPm('PM');
        setSubtasks([]);
        setNewSubtaskText('');
        setTags([]);
        setNewTagText('');
      }
    }
  }, [isOpen, type, task]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process Duration
    const dh = parseInt(durationHours) || 0;
    const dm = parseInt(durationMins) || 0;
    let durationString = '';
    if (dh > 0) durationString += `${dh}h `;
    if (dm > 0) durationString += `${dm}m`;
    if (durationString === '') durationString = '0m';

    // Process Time
    // Ensure padding
    const formattedMin = dueMin.padStart(2, '0');
    const timeString = `${dueHour}:${formattedMin} ${dueAmPm}`;

    onSubmit({
      title,
      duration: durationString.trim(),
      dueTime: timeString,
      priority,
      subtasks,
      tags
    });
  };

  // Subtask Handlers
  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        text: newSubtaskText.trim(),
        completed: false
      };
      setSubtasks(prev => [...prev, newSubtask]);
      setNewSubtaskText('');
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = newTagText.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setNewTagText('');
    }
  };

  const handleTogglePresetTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(prev => prev.filter(t => t !== tag));
    } else {
      setTags(prev => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  // Input Handlers
  const handleNumericInput = (val: string, max: number, setter: (v: string) => void) => {
    // Allow empty string for typing
    if (val === '') {
      setter('');
      return;
    }
    // Only allow digits
    const cleanVal = val.replace(/\D/g, '');
    const num = parseInt(cleanVal);

    if (!isNaN(num)) {
      // Just limit length/value loosely to prevent huge numbers
      if (num <= max) {
        setter(cleanVal);
      } else {
        setter(max.toString());
      }
    }
  };

  const handleBlur = (val: string, min: number, max: number, setter: (v: string) => void, pad = false) => {
    let num = parseInt(val) || min; // Default to min if empty/invalid
    // Clamp
    num = Math.max(min, Math.min(max, num));
    setter(pad ? num.toString().padStart(2, '0') : num.toString());
  };

  const isEdit = type === 'EDIT_TASK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="relative bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border-light dark:border-border-dark animate-zoom-in">

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-red-600 dark:text-red-400 text-xs font-bold animate-slide-in-up">
            <Icon name="error" size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">
            {type === 'ADD_TASK' ? 'Add New Task' : type === 'ADD_COLUMN' ? 'Add New Category' : 'Edit Task'}
          </h3>
          <button onClick={onClose} className="text-text-secondary-light hover:text-primary transition-colors">
            <Icon name="close" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-xs font-bold text-text-secondary-light uppercase mb-1">Title</label>
            <input
              autoFocus={!isEdit}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'ADD_TASK' ? "e.g., Review Design" : "e.g., Marketing"}
              className="w-full bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              required
            />
          </div>

          {(type === 'ADD_TASK' || type === 'EDIT_TASK') && (
            <div className="flex gap-4">
              {/* Duration Field */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary-light uppercase mb-1">Duration</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={durationHours}
                      onChange={(e) => handleNumericInput(e.target.value, 23, setDurationHours)}
                      onBlur={() => handleBlur(durationHours, 0, 23, setDurationHours)}
                      className="w-full bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg pl-3 pr-8 py-2.5 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-center"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-text-secondary-light pointer-events-none">h</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={durationMins}
                      onChange={(e) => handleNumericInput(e.target.value, 59, setDurationMins)}
                      onBlur={() => handleBlur(durationMins, 0, 59, setDurationMins)}
                      className="w-full bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg pl-3 pr-8 py-2.5 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-center"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-text-secondary-light pointer-events-none">m</span>
                  </div>
                </div>
              </div>

              {/* Time Field */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary-light uppercase mb-1">Due Time</label>
                <div className="flex bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg p-1 items-center h-[42px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={dueHour}
                    onChange={(e) => handleNumericInput(e.target.value, 12, setDueHour)}
                    onBlur={() => handleBlur(dueHour, 1, 12, setDueHour)}
                    className="flex-1 w-full bg-transparent text-center font-medium outline-none py-1.5"
                  />
                  <span className="text-text-secondary-light font-bold pb-0.5">:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={dueMin}
                    onChange={(e) => handleNumericInput(e.target.value, 59, setDueMin)}
                    onBlur={() => handleBlur(dueMin, 0, 59, setDueMin, true)}
                    className="flex-1 w-full bg-transparent text-center font-medium outline-none py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setDueAmPm(p => p === 'AM' ? 'PM' : 'AM')}
                    className="mx-1 px-2 py-1 rounded-md text-xs font-bold bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark hover:text-primary transition-colors select-none"
                  >
                    {dueAmPm}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(type === 'ADD_TASK' || type === 'EDIT_TASK') && (
            <div>
              <label className="block text-xs font-bold text-text-secondary-light uppercase mb-1">Priority</label>
              <div className="flex gap-2">
                {['High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as Priority)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${priority === p
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-transparent text-text-secondary-light border-border-light dark:border-border-dark hover:border-primary/50'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          {(type === 'ADD_TASK' || type === 'EDIT_TASK') && (
            <div>
              <label className="block text-xs font-bold text-text-secondary-light uppercase mb-2">
                Subtasks {subtasks.length > 0 && <span className="text-primary">({subtasks.filter(s => s.completed).length}/{subtasks.length})</span>}
              </label>

              {/* Add Subtask Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  placeholder="Add a subtask..."
                  className="flex-1 bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskText.trim()}
                  className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="add" size={18} />
                </button>
              </div>

              {/* Subtask List */}
              {subtasks.length > 0 && (
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${st.completed
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                        : 'bg-background-light dark:bg-background-dark/50 border-border-light dark:border-border-dark'
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(st.id)}
                        className={`shrink-0 size-5 rounded-full border flex items-center justify-center transition-all ${st.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-primary'
                          }`}
                      >
                        {st.completed && <Icon name="check" size={12} className="text-white font-bold" />}
                      </button>
                      <span className={`flex-1 text-sm ${st.completed ? 'line-through text-text-secondary-light' : ''}`}>
                        {st.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="shrink-0 p-1 text-text-secondary-light hover:text-red-500 transition-colors"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags Section */}
          {(type === 'ADD_TASK' || type === 'EDIT_TASK') && (
            <div>
              <label className="block text-xs font-bold text-text-secondary-light uppercase mb-2">
                Tags {tags.length > 0 && <span className="text-primary">({tags.length})</span>}
              </label>

              {/* Preset Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {presetTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTogglePresetTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${tags.includes(tag)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-transparent text-text-secondary-light border-border-light dark:border-border-dark hover:border-primary/50'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add custom tag..."
                  className="flex-1 bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTagText.trim()}
                  className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {/* Selected Custom Tags (non-preset) */}
              {tags.filter(t => !presetTags.includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.filter(t => !presetTags.includes(t)).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-[10px] font-bold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <Icon name="close" size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-text-secondary-light hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {isEdit ? 'Save Changes' : type === 'ADD_TASK' ? 'Create Task' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};