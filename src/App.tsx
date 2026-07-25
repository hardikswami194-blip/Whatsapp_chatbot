import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import {
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendMessage,
} from './lib/chat';
import { useTheme } from './hooks/useTheme';
import type { Conversation, Message } from './types';

const REPLY_TEXTS = [
  'Got it, thanks!',
  'Sounds good to me.',
  'Let me check and get back to you.',
  'Interesting, tell me more.',
  'Absolutely, no problem at all.',
];

function App() {
  const { theme, toggle } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConvo, setMessagesByConvo] = useState<Record<string, Message[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const convos = await fetchConversations();
        if (cancelled) return;
        setConversations(convos);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load conversations.');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const selectedMessages = useMemo(
    () => (selectedId ? messagesByConvo[selectedId] ?? [] : []),
    [messagesByConvo, selectedId]
  );

  const handleSelect = useCallback(
    async (id: string) => {
      setSelectedId(id);
      // Clear unread badge immediately in the UI, then persist.
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
      );
      // Load messages for this conversation (cache check).
      setMessagesByConvo((prev) =>
        prev[id] ? prev : { ...prev, [id]: [] }
      );
      try {
        const [msgs] = await Promise.all([fetchMessages(id), markConversationRead(id)]);
        setMessagesByConvo((prev) => ({ ...prev, [id]: msgs }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages.');
      }
    },
    []
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!selectedId) return;
      const convoId = selectedId;

      try {
        const newMessage = await sendMessage(convoId, text, 'me');
        setMessagesByConvo((prev) => ({
          ...prev,
          [convoId]: [...(prev[convoId] ?? []), newMessage],
        }));
        // Move this conversation to the top of the sidebar.
        setConversations((prev) => {
          const target = prev.find((c) => c.id === convoId);
          if (!target) return prev;
          return [
            { ...target, lastMessage: text, lastMessageAt: newMessage.createdAt, unreadCount: 0 },
            ...prev.filter((c) => c.id !== convoId),
          ];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message.');
        return;
      }

      // Simulated auto-reply for a more lifelike feel, persisted to the database.
      window.setTimeout(async () => {
        const replyText = REPLY_TEXTS[Math.floor(Math.random() * REPLY_TEXTS.length)];
        try {
          const reply = await sendMessage(convoId, replyText, 'them');
          setMessagesByConvo((prev) => ({
            ...prev,
            [convoId]: [...(prev[convoId] ?? []), reply],
          }));
          setConversations((prev) => {
            const target = prev.find((c) => c.id === convoId);
            if (!target) return prev;
            return [
              { ...target, lastMessage: replyText, lastMessageAt: reply.createdAt },
              ...prev.filter((c) => c.id !== convoId),
            ];
          });
        } catch {
          // Silent: a failed auto-reply shouldn't surface a hard error.
        }
      }, 1400);
    },
    [selectedId]
  );

  const handleBack = () => setSelectedId(null);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-950 px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400">
            !
          </div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Something went wrong</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-sans antialiased dark:bg-slate-950">
      {/* Sidebar — hidden on mobile when a chat is open */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} h-full`}>
        <Sidebar
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onToggleTheme={toggle}
        />
      </div>
      {/* Chat area — hidden on mobile when no chat is selected */}
      <div className={`${selectedId ? 'flex' : 'hidden md:flex'} h-full flex-1`}>
        <ChatArea
          conversation={selectedConversation}
          messages={selectedMessages}
          onSend={handleSend}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}

export default App;
