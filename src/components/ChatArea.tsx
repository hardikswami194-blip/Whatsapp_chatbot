import { useEffect, useRef, useState } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import type { Conversation, Message } from '../types';
import { formatMessageTime, getInitials } from '../utils';

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSend: (text: string) => void;
  onBack: () => void;
}

export default function ChatArea({ conversation, messages, onSend, onBack }: ChatAreaProps) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <section className="hidden flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950 md:flex">
        <div className="flex flex-col items-center px-8 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xl shadow-blue-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Your Messages</h2>
          <p className="mt-2 max-w-xs text-sm text-slate-400 dark:text-slate-500">
            Select a conversation from the sidebar to start chatting.
          </p>
        </div>
      </section>
    );
  }

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 md:px-6">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-600 ring-2 ring-white dark:from-slate-700 dark:to-slate-600 dark:text-slate-200 dark:ring-slate-900">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.username}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              getInitials(conversation.username)
            )}
          </div>
          {conversation.online && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50 md:text-base">
            {conversation.username}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                conversation.online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
            {conversation.online ? 'Active now' : 'Offline'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400" aria-label="Call">
            <Phone className="h-[18px] w-[18px]" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400" aria-label="Video call">
            <Video className="h-[18px] w-[18px]" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label="More options">
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-20 text-center">
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Send className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">No messages yet</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Send a message to start the conversation</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender === 'me';
              const prevMsg = messages[idx - 1];
              const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[10px] font-semibold text-slate-600 dark:from-slate-700 dark:to-slate-600 dark:text-slate-200 ${
                        showAvatar ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {conversation.avatar ? (
                        <img
                          src={conversation.avatar}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        getInitials(conversation.username)
                      )}
                    </div>
                  )}
                  <div className={`flex max-w-[75%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                        isMe
                          ? 'rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                          : 'rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 px-1 text-[10px] font-medium text-slate-400">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-blue-500 dark:focus-within:bg-slate-800 dark:focus-within:ring-blue-900/40">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              className="max-h-32 flex-1 resize-none bg-transparent px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition hover:scale-105 hover:shadow-blue-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
            aria-label="Send message"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
