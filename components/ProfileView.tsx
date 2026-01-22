import React, { useState } from 'react';
import { User, Task } from '../types';
import { Icon } from './Icon';
import { userApi } from '../api';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onLogout: () => void;
  completedCount: number;
  completedTasks: Task[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onBack, onLogout, completedCount, completedTasks }) => {
  const [formData, setFormData] = useState(user);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { user: updatedUser } = await userApi.updateProfile({
        name: formData.name,
        role: formData.role,
        preferences: formData.preferences
      });
      onUpdateUser(updatedUser);
      // Toast logic should ideally be here if possible, or propagated
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (key: 'emailNotifications' | 'pushNotifications') => {
    if (!formData.preferences) return;

    const newPreferences = {
      ...formData.preferences,
      [key]: !formData.preferences[key]
    };

    setFormData(prev => ({ ...prev, preferences: newPreferences }));

    // Auto-save for toggles
    try {
      setIsSaving(true);
      const { user: updatedUser } = await userApi.updateProfile({ // Note: The backend accepts partial preferences, but sending full object is safer for now or construct partial.
        preferences: newPreferences
      });
      onUpdateUser(updatedUser);
    } catch (error) {
      console.error("Failed to update preferences", error);
      // Revert on error
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences!, [key]: !newPreferences[key] }
      }));
    } finally {
      setIsSaving(false);
    }
  };


  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
    // TODO: Persist theme preference if desired, similar to notifications
  };

  return (
    <div className="flex-grow flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark p-6 animate-slide-in-right">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark text-text-secondary-light transition-colors"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Profile & Settings</h1>
            <p className="text-text-secondary-light text-sm">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Profile Card & Stats */}
          <div className="md:col-span-4 flex flex-col gap-6">

            {/* Profile Card */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-border-light dark:border-border-dark flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <div
                  className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-background-light dark:border-background-dark shadow-lg"
                  style={{ backgroundImage: `url("${formData.avatarUrl}")` }}
                ></div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="edit" className="text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold">{formData.name}</h2>
              <p className="text-text-secondary-light text-sm font-medium mb-4">{formData.role}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">Pro Member</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">Active</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-soft border border-border-light dark:border-border-dark">
                <div className="size-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-2">
                  <Icon name="check_circle" size={18} />
                </div>
                <h3 className="text-2xl font-black">{completedCount}</h3>
                <p className="text-[10px] uppercase font-bold text-text-secondary-light">Tasks Done</p>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-soft border border-border-light dark:border-border-dark">
                <div className="size-8 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center mb-2">
                  <Icon name="local_fire_department" size={18} />
                </div>
                <h3 className="text-2xl font-black">5</h3>
                <p className="text-[10px] uppercase font-bold text-text-secondary-light">Day Streak</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full mt-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm"
            >
              <Icon name="logout" className="text-red-500" />
              Sign Out
            </button>
          </div>


          {/* Right Column: Edit Form & Preferences */}
          <div className="md:col-span-8 flex flex-col gap-6">

            {/* Completed Tasks List */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-soft border border-border-light dark:border-border-dark">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Icon name="check_circle" className="text-green-500" />
                Completed Tasks
              </h3>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {completedTasks && completedTasks.length > 0 ? (
                  completedTasks.map((task) => (
                    <div key={task.id} className="p-3 bg-background-light dark:bg-background-dark rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`size - 2 rounded - full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'} `}></div>
                        <div>
                          <p className="text-sm font-bold line-through text-text-secondary-light">{task.title}</p>
                          <p className="text-[10px] text-text-secondary-light">{task.date}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">Done</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-secondary-light">
                    <Icon name="assignment" size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No completed tasks yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* General Info Form */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-soft border border-border-light dark:border-border-dark">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Icon name="person" className="text-primary" />
                Personal Information
              </h3>
              <form onSubmit={handleSave} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary-light uppercase mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary-light uppercase mb-2">Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary-light uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Preferences */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-soft border border-border-light dark:border-border-dark">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Icon name="tune" className="text-primary" />
                App Preferences
              </h3>

              <div className="flex flex-col gap-6">

                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg">
                      <Icon name="dark_mode" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Dark Mode</h4>
                      <p className="text-xs text-text-secondary-light">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w - 12 h - 6 rounded - full transition - colors relative ${isDark ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'} `}
                  >
                    <div className={`absolute top - 1 size - 4 bg - white rounded - full transition - transform ${isDark ? 'left-7' : 'left-1'} `}></div>
                  </button>
                </div>

                {/* Notification Settings */}
                <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg">
                      <Icon name="mail" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Email Notifications</h4>
                      <p className="text-xs text-text-secondary-light">Receive weekly summaries</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('emailNotifications')}
                    disabled={isSaving}
                    className={`w - 12 h - 6 rounded - full transition - colors relative ${formData.preferences?.emailNotifications ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'} `}
                  >
                    <div className={`absolute top - 1 size - 4 bg - white rounded - full transition - transform ${formData.preferences?.emailNotifications ? 'left-7' : 'left-1'} `}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg">
                      <Icon name="notifications_active" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Push Notifications</h4>
                      <p className="text-xs text-text-secondary-light">Get alerts for upcoming tasks</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('pushNotifications')}
                    disabled={isSaving}
                    className={`w - 12 h - 6 rounded - full transition - colors relative ${formData.preferences?.pushNotifications ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'} `}
                  >
                    <div className={`absolute top - 1 size - 4 bg - white rounded - full transition - transform ${formData.preferences?.pushNotifications ? 'left-7' : 'left-1'} `}></div>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div >
  );
};