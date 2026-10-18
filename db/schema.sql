-- GentleHub application tables. Better Auth tables ("user", session, account,
-- verification) are created by scripts/migrate.mjs via Better Auth itself.

create table if not exists applications (
  id          text primary key,
  name        text not null,
  description text not null default '',
  url         text not null,
  icon        text,
  category    text not null,
  environment text,
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  text
);

create table if not exists favorites (
  user_id        text not null references "user"(id) on delete cascade,
  application_id text not null references applications(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (user_id, application_id)
);

-- Exactly one row: the client-side encrypted credential vault (ciphertext only).
create table if not exists vault (
  id         smallint primary key default 1 check (id = 1),
  blob       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);
