import React, { useState } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { View } from '../types';
import { Notification } from '../types';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingCount: number;
  onAddCategory: () => void;
  onProfileClick: () => void;
  view: View;
  userAvatar: string;
  userName: string;
  filterStatus?: 'All' | 'Pending' | 'Completed';
  onFilterStatusChange?: (status: 'All' | 'Pending' | 'Completed') => void;
  filterPriority?: string;
  onFilterPriorityChange?: (priority: string) => void;
  notifications?: Notification[];
  onMarkAllRead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  pendingCount,
  onAddCategory,
  onProfileClick,
  view,
  userAvatar,
  userName,
  filterStatus = 'All',
  onFilterStatusChange,
  filterPriority = 'All',
  onFilterPriorityChange,
  notifications = [],
  onMarkAllRead
}) => {
  const tabs = ['All Tasks', 'Work', 'Personal'];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = (filterStatus !== 'All' ? 1 : 0) + (filterPriority !== 'All' ? 1 : 0);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex-none bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-3 relative z-30">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left Side: Logo & Tabs */}
        <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => view === 'profile' ? window.location.reload() : null}>
            <Logo />
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">FocusFlow</h1>
          </div>

          <div className="h-8 w-px bg-border-light dark:border-border-dark hidden lg:block shrink-0"></div>

          {view === 'dashboard' && (
            <>
              <div className="flex flex-col hidden xl:flex shrink-0">
                <h2 className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Good Morning, {userName.split(' ')[0]}</h2>
                <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-bold">{pendingCount} Tasks Pending</p>
              </div>

              {/* Scrollable Tabs List */}
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <div className="flex-1 overflow-x-auto no-scrollbar">
                  <div className="inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => onTabChange(tab)}
                          className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all whitespace-nowrap ${isActive
                              ? 'bg-white dark:bg-neutral-700 text-primary dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                              : 'text-text-secondary-light hover:text-text-main-light dark:hover:text-text-main-dark'
                            }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={onAddCategory}
                  className="shrink-0 size-8 rounded-lg border border-dashed border-border-light dark:border-border-dark flex items-center justify-center text-text-secondary-light hover:text-primary hover:border-primary transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  title="Add Category"
                >
                  <Icon name="add" size={18} />
                </button>
              </div>
            </>
          )}

          {view === 'profile' && (
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-text-main-light dark:text-text-main-dark">User Profile</h2>
            </div>
          )}
        </div>

        {/* Right Side: Search, Filter & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {view === 'dashboard' && (
            <>
              <div className="hidden md:flex relative group">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-background-light dark:bg-background-dark/50 border border-transparent focus:border-border-light dark:focus:border-border-dark rounded-lg py-1.5 pl-9 pr-4 text-xs font-medium focus:ring-0 w-32 focus:w-48 transition-all h-9"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light pointer-events-none">
                  <Icon name="search" size={16} />
                </span>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative flex items-center justify-center size-9 rounded-lg transition-all border ${showFilters || activeFilterCount > 0 ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-secondary-light hover:border-primary hover:text-primary'}`}
                  title="Filter Tasks"
                >
                  <Icon name="filter_list" size={18} />
                  {activeFilterCount > 0 && !showFilters && (
                    <span className="absolute -top-1 -right-1 size-2.5 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
                  )}
                </button>

                {showFilters && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 z-50">

                      {/* Status Filter */}
                      <div className="mb-4">
                        <h4 className="text-[10px] font-bold text-text-secondary-light uppercase mb-2">Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {['All', 'Pending', 'Completed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => onFilterStatusChange?.(status as any)}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${filterStatus === status
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-transparent border-border-light dark:border-border-dark text-text-secondary-light hover:border-primary/50'
                                }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Priority Filter */}
                      <div>
                        <h4 className="text-[10px] font-bold text-text-secondary-light uppercase mb-2">Priority</h4>
                        <div className="flex flex-wrap gap-2">
                          {['All', 'High', 'Medium', 'Low'].map((p) => (
                            <button
                              key={p}
                              onClick={() => onFilterPriorityChange?.(p)}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${filterPriority === p
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-transparent border-border-light dark:border-border-dark text-text-secondary-light hover:border-primary/50'
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(activeFilterCount > 0) && (
                        <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex justify-end">
                          <button
                            onClick={() => {
                              onFilterStatusChange?.('All');
                              onFilterPriorityChange?.('All');
                            }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative flex items-center justify-center size-9 rounded-lg transition-all border ${showNotifications ? 'bg-primary text-white border-primary' : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-secondary-light hover:border-primary hover:text-primary'}`}
            >
              <Icon name="notifications" size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 size-1.5 bg-red-500 rounded-full border border-surface-light dark:border-surface-dark"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                <div className={`absolute right-0 top-full mt-2 w-80 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 z-50 ${notifications.length === 0 ? 'h-auto' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={onMarkAllRead} className="text-[10px] text-primary font-bold hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`flex gap-3 items-start p-2 hover:bg-background-light dark:hover:bg-background-dark/50 rounded-lg transition-colors cursor-pointer ${!n.read ? 'bg-background-light/50 dark:bg-neutral-800/30' : ''}`}>
                          <div className={`size-2 mt-1.5 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <p className="text-xs font-semibold">{n.title}</p>
                            <p className="text-[10px] text-text-secondary-light mt-1">{n.message}</p>
                            <p className="text-[10px] text-text-secondary-light font-mono mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-text-secondary-light">
                        <Icon name="notifications_off" size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onProfileClick}
            className={`size-9 rounded-lg overflow-hidden border transition-all ${view === 'profile' ? 'border-primary ring-2 ring-primary/20' : 'border-border-light dark:border-border-dark hover:border-primary'}`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url("${userAvatar}")` }}
            ></div>
          </button>
        </div>
      </div>
    </header>
  );
};