/*
# Create conversations and messages tables (single-tenant, no auth)

This chat application has no sign-in / sign-up screen. Every visitor uses the
shared anon-key client, so the schema is intentionally single-tenant: there is
no user_id column, no link to auth.users, and all data is shared/public. RLS
policies therefore grant CRUD access to BOTH the anon and authenticated roles.

1. New Tables

- `conversations`
  - `id` (uuid, primary key)
  - `username` (text, not null) — display name of the person you are chatting with
  - `avatar` (text) — optional URL to an avatar image
  - `online` (boolean, default false) — presence indicator shown as a green dot
  - `unread_count` (integer, default 0) — unread badge count
  - `last_message` (text) — preview of the most recent message shown in the sidebar
  - `last_message_at` (timestamptz) — timestamp of the most recent message, drives ordering + relative time
  - `created_at` (timestamptz, default now())

- `messages`
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key → conversations.id ON DELETE CASCADE)
  - `sender` (text, not null) — 'me' for the current user's outgoing messages, 'them' for the contact's incoming messages
  - `text` (text, not null) — the message body
  - `created_at` (timestamptz, default now()) — per-message timestamp

2. Indexes

- `messages_conversation_id_created_at_idx` on (conversation_id, created_at) — the chat view fetches messages for one conversation ordered by time.
- `conversations_last_message_at_idx` on last_message_at DESC — the sidebar is ordered by most-recent activity.

3. Security (RLS)

- RLS enabled on both tables.
- 4 separate policies per table (select / insert / update / delete), granted to
  `TO anon, authenticated` because the app has no sign-in and the data is
  intentionally shared. `USING (true)` / `WITH CHECK (true)` is documented here
  as intentionally public — this is a single-tenant no-auth app, NOT a shortcut
  around a real ownership check.

4. Notes

- No user_id / auth.users linkage — this app intentionally has no accounts.
- `sender` is a free-text column constrained by the app to 'me' | 'them' to keep the schema simple for a basic chat app.
- last_message / last_message_at on conversations are denormalized for sidebar performance; they are updated by the app whenever a message is sent.
*/