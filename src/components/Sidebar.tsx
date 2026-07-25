import { Search, Sun, Moon } from 'lucide-react';
import type { Conversation } from '../types';
import { formatTime, getInitials } from '../utils';
import type { Theme } from '../hooks/useTheme';

interface SidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Sidebar({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const filtered = conversations.filter((c) =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <aside className="flex w-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:w-[340px] md:min-w-[340px]">
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">Messages</h1>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
              </p>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-900/40"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">No conversations found</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Try a different search term</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((convo) => {
              const isActive = convo.id === selectedId;
              return (
                <li key={convo.id}>
                  <button
                    onClick={() => onSelect(convo.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-900/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-600 ring-2 ring-white dark:from-slate-700 dark:to-slate-600 dark:text-slate-200 dark:ring-slate-900">
                        {convo.avatar ? (
                          <img
                            src={convo.avatar}
                            alt={convo.username}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          getInitials(convo.username)
                        )}
                      </div>
                      {convo.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            isActive
                              ? 'font-semibold text-slate-900 dark:text-slate-50'
                              : 'font-medium text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {convo.username}
                        </p>
                        <span
                          className={`shrink-0 text-[11px] font-medium ${
                            convo.unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {convo.lastMessageAt ? formatTime(convo.lastMessageAt) : ''}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-xs ${
                            convo.unreadCount > 0 ? 'font-medium text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {convo.lastMessage}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-600/40">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
