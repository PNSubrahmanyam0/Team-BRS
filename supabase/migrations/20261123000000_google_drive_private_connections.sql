-- Google Drive OAuth token storage. Applied to brs-ai-recruiter.
create schema if not exists private;
create table if not exists private.google_drive_connections (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null unique references public.organizations(id) on delete cascade,
 connected_by uuid not null references auth.users(id),
 google_email text not null,
 refresh_token_ciphertext text not null,
 refresh_token_iv text not null,
 refresh_token_auth_tag text not null,
 scopes text[] not null default '{}',
 root_folder_id text,
 root_folder_name text,
 folder_map jsonb not null default '{}'::jsonb,
 status text not null default 'connected' check(status in ('connected','reauthorization_required','disconnected')),
 connected_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table private.google_drive_connections enable row level security;
revoke all on table private.google_drive_connections from public, anon, authenticated;

create or replace function public.brs_google_drive_get_connection(p_organization_id uuid)
returns jsonb language sql security definer set search_path=''
as $$ select to_jsonb(g) from private.google_drive_connections g where g.organization_id=p_organization_id and g.status='connected' limit 1; $$;

create or replace function public.brs_google_drive_upsert_connection(
 p_organization_id uuid,p_connected_by uuid,p_google_email text,
 p_refresh_token_ciphertext text,p_refresh_token_iv text,p_refresh_token_auth_tag text,p_scopes text[]
)
returns void language sql security definer set search_path=''
as $$
 insert into private.google_drive_connections(organization_id,connected_by,google_email,refresh_token_ciphertext,refresh_token_iv,refresh_token_auth_tag,scopes,status,updated_at)
 values(p_organization_id,p_connected_by,p_google_email,p_refresh_token_ciphertext,p_refresh_token_iv,p_refresh_token_auth_tag,coalesce(p_scopes,'{}'),'connected',now())
 on conflict(organization_id) do update set connected_by=excluded.connected_by,google_email=excluded.google_email,
 refresh_token_ciphertext=excluded.refresh_token_ciphertext,refresh_token_iv=excluded.refresh_token_iv,
 refresh_token_auth_tag=excluded.refresh_token_auth_tag,scopes=excluded.scopes,status='connected',updated_at=now();
$$;

create or replace function public.brs_google_drive_set_folder(p_organization_id uuid,p_root_folder_id text,p_root_folder_name text,p_folder_map jsonb)
returns void language sql security definer set search_path=''
as $$ update private.google_drive_connections set root_folder_id=p_root_folder_id,root_folder_name=p_root_folder_name,folder_map=coalesce(p_folder_map,'{}'::jsonb),updated_at=now() where organization_id=p_organization_id and status='connected'; $$;

revoke all on function public.brs_google_drive_get_connection(uuid) from public,anon,authenticated;
revoke all on function public.brs_google_drive_upsert_connection(uuid,uuid,text,text,text,text,text[]) from public,anon,authenticated;
revoke all on function public.brs_google_drive_set_folder(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.brs_google_drive_get_connection(uuid) to service_role;
grant execute on function public.brs_google_drive_upsert_connection(uuid,uuid,text,text,text,text,text[]) to service_role;
grant execute on function public.brs_google_drive_set_folder(uuid,text,text,jsonb) to service_role;
