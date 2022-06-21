-- Custom types
CREATE TYPE PUBLIC .app_permission AS enum (
  'dictionaries',
  'notes',
  'projects',
  'verses.set',
  'moderator.set',
  'user_projects',
  'project_source',
  'coordinator.set',
  'languages',
  'user_languages'
);

CREATE TYPE PUBLIC .app_role AS enum (
  'admin',
  'coordinator',
  'moderator',
  'translator'
);

CREATE TYPE PUBLIC .project_type AS enum ('obs', 'bible');

CREATE TYPE PUBLIC .book_code AS enum (
  'gen',
  'exo',
  'lev',
  'num',
  'deu',
  'jos',
  'jdg',
  'rut',
  '1sa',
  '2sa',
  '1ki',
  '2ki',
  '1ch',
  '2ch',
  'ezr',
  'neh',
  'est',
  'job',
  'psa',
  'pro',
  'ecc',
  'sng',
  'isa',
  'jer',
  'lam',
  'ezk',
  'dan',
  'hos',
  'jol',
  'amo',
  'oba',
  'jon',
  'mic',
  'nam',
  'hab',
  'zep',
  'hag',
  'zec',
  'mal',
  'mat',
  'mrk',
  'luk',
  'jhn',
  'act',
  'rom',
  '1co',
  '2co',
  'gal',
  'eph',
  'php',
  'col',
  '1th',
  '2th',
  '1ti',
  '2ti',
  'tit',
  'phm',
  'heb',
  'jas',
  '1pe',
  '2pe',
  '1jn',
  '2jn',
  '3jn',
  'jud',
  'rev',
  'obs'
);

-- USERS
CREATE TABLE PUBLIC .users (
  id uuid NOT NULL primary key,
  -- UUID from auth.users
  email text NOT NULL UNIQUE,
  agreement BOOLEAN NOT NULL DEFAULT FALSE,
  confession BOOLEAN NOT NULL DEFAULT FALSE,
  blocked TIMESTAMP DEFAULT NULL
);

-- USER ROLES
CREATE TABLE PUBLIC .user_roles (
  id bigint generated BY DEFAULT AS identity primary key,
  user_id uuid references PUBLIC .users ON
  DELETE
    CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

COMMENT ON TABLE PUBLIC .user_roles IS 'Application roles for each user.';

-- ROLE PERMISSIONS
CREATE TABLE PUBLIC .role_permissions (
  id bigint generated BY DEFAULT AS identity primary key,
  role app_role NOT NULL,
  permission app_permission NOT NULL,
  UNIQUE (role, permission)
);

COMMENT ON TABLE PUBLIC .role_permissions IS 'Application permissions for each role.';

-- LANGUAGES
CREATE TABLE PUBLIC .languages (
  id bigint generated BY DEFAULT AS identity primary key,
  eng text NOT NULL,
  code text NOT NULL UNIQUE,
  orig_name text NOT NULL,
  is_GL BOOLEAN NOT NULL DEFAULT FALSE
);

-- METHODS
CREATE TABLE PUBLIC .methods (
  id bigint generated BY DEFAULT AS identity primary key,
  NAME text NOT NULL
);

-- PROJECTS
CREATE TABLE PUBLIC .projects (
  id bigint generated BY DEFAULT AS identity primary key,
  NAME text NOT NULL,
  code text NOT NULL,
  language_id bigint references PUBLIC .languages ON
  DELETE
    restrict NOT NULL,
    method_id bigint references PUBLIC .methods ON
  DELETE
    restrict NOT NULL,
    TYPE project_type NOT NULL,
    UNIQUE (code, language_id)
);

-- PROJECT COORDINATORS
CREATE TABLE PUBLIC .project_coordinators (
  id bigint generated BY DEFAULT AS identity primary key,
  project_id bigint references PUBLIC .projects ON
  DELETE
    CASCADE NOT NULL,
    user_id uuid references PUBLIC .users ON
  DELETE
    restrict NOT NULL,
    UNIQUE (project_id, user_id)
);

-- PROJECT MODERATORS
CREATE TABLE PUBLIC .project_moderators (
  id bigint generated BY DEFAULT AS identity primary key,
  project_id bigint references PUBLIC .projects ON
  DELETE
    CASCADE NOT NULL,
    user_id uuid references PUBLIC .users ON
  DELETE
    restrict NOT NULL,
    UNIQUE (project_id, user_id)
);

-- PROJECT TRANSLATORS
CREATE TABLE PUBLIC .project_translators (
  id bigint generated BY DEFAULT AS identity primary key,
  project_id bigint references PUBLIC .projects ON
  DELETE
    CASCADE NOT NULL,
    user_id uuid references PUBLIC .users ON
  DELETE
    restrict NOT NULL,
    UNIQUE (project_id, user_id)
);

-- BRIEFS
CREATE TABLE PUBLIC .briefs (
  id bigint generated BY DEFAULT AS identity primary key,
  project_id bigint references PUBLIC .projects ON
  DELETE
    CASCADE NOT NULL UNIQUE,
    text text NOT NULL
);

-- STEPS
CREATE TABLE PUBLIC .steps (
  id bigint generated BY DEFAULT AS identity primary key,
  NAME text NOT NULL,
  method_id bigint REFERENCES PUBLIC .methods ON
  DELETE
    CASCADE NOT NULL,
    config jsonb NOT NULL,
    ORDER int2 NOT NULL,
    UNIQUE (method, ORDER)
);

-- BOOKS
CREATE TABLE PUBLIC .books (
  id bigint generated BY DEFAULT AS identity primary key,
  code book_code NOT NULL,
  project_id bigint references PUBLIC .projects ON
  DELETE
    CASCADE NOT NULL,
    text text DEFAULT NULL,
    UNIQUE (project_id, code)
);

COMMENT ON TABLE PUBLIC .books IS 'Подумать о том, что будет если удалить проект. Так как в таблице книги мы хотим хранить текст';

-- CHAPTERS
CREATE TABLE PUBLIC .chapters (
  id bigint generated BY DEFAULT AS identity primary key,
  NUMBER int2 NOT NULL,
  book_id bigint REFERENCES PUBLIC .books ON
  DELETE
    CASCADE NOT NULL,
    text text DEFAULT NULL,
    UNIQUE (book_id, NUMBER)
);

-- VERSES
CREATE TABLE PUBLIC .verses (
  id bigint generated BY DEFAULT AS identity primary key,
  NUMBER int2 NOT NULL,
  chapter_id bigint REFERENCES PUBLIC .chapters ON
  DELETE
    CASCADE NOT NULL,
    project_translator_id bigint REFERENCES PUBLIC .project_translators ON
  DELETE
    restrict NOT NULL,
    UNIQUE (chapter_id, NUMBER)
);

-- PROGRESS
CREATE TABLE PUBLIC .progress (
  id bigint generated BY DEFAULT AS identity primary key,
  verse_id bigint REFERENCES PUBLIC .verses ON
  DELETE
    restrict NOT NULL,
    step_id bigint REFERENCES PUBLIC .steps ON
  DELETE
    restrict NOT NULL,
    text text DEFAULT NULL,
    UNIQUE (verse_id, step_id)
);

-- authorize with role-based access control (RBAC)
-- https://supabase.com/docs/reference/javascript/rpc
CREATE FUNCTION PUBLIC .authorize(
  requested_permission app_permission,
  user_id uuid
) returns BOOLEAN LANGUAGE plpgsql security definer AS $$
DECLARE
  bind_permissions INT;

BEGIN
  SELECT
    COUNT(*)
  FROM
    PUBLIC .role_permissions
    INNER JOIN PUBLIC .user_roles ON role_permissions.role = user_roles.role
  WHERE
    role_permissions.permission = authorize.requested_permission
    AND user_roles.user_id = authorize.user_id INTO bind_permissions;

RETURN bind_permissions > 0;

END;

$$;

-- if user can work with site
CREATE FUNCTION PUBLIC .has_access(user_id uuid) returns BOOLEAN LANGUAGE plpgsql security definer AS $$
DECLARE
  access INT;

BEGIN
  SELECT
    COUNT(*)
  FROM
    PUBLIC .users
  WHERE
    users.id = has_access.user_id
    AND users.agreement = TRUE
    AND users.confession = TRUE INTO access;

RETURN access > 0;

END;

$$;

-- Редактировать привилегии может координатор и администратор.
-- Координатор может поменять роль на переводчика или модератора.
-- Админ может на координатора, переводчика или модератора.
CREATE FUNCTION PUBLIC .can_change_role(role app_role, from_user uuid, to_user uuid) returns BOOLEAN LANGUAGE plpgsql security definer AS $$
DECLARE
  from_user_role app_role;

to_user_role app_role;

BEGIN
  SELECT
    user_roles.role
  FROM
    user_roles
  WHERE
    user_roles.user_id = can_change_role.from_user INTO from_user_role;

SELECT
  user_roles.role
FROM
  user_roles
WHERE
  user_roles.user_id = can_change_role.to_user INTO to_user_role;

IF can_change_role.role = 'admin' THEN RETURN FALSE;

END IF;

IF can_change_role.role = 'coordinator'
AND from_user_role = 'admin'
AND to_user_role NOT IN ('admin', 'coordinator') THEN RETURN TRUE;

END IF;

IF can_change_role.role = 'moderator'
AND from_user_role = 'admin'
AND to_user_role NOT IN ('admin', 'moderator') THEN RETURN TRUE;

ELSEIF can_change_role.role = 'moderator'
AND from_user_role = 'coordinator'
AND to_user_role = 'translator' THEN RETURN TRUE;

END IF;

IF can_change_role.role = 'translator'
AND from_user_role = 'admin'
AND to_user_role NOT IN ('admin', 'translator') THEN RETURN TRUE;

ELSEIF can_change_role.role = 'translator'
AND from_user_role = 'coordinator'
AND to_user_role = 'moderator' THEN RETURN TRUE;

END IF;

RETURN FALSE;

END;

$$;

-- Secure the tables
-- Secure users
ALTER TABLE
  PUBLIC .users enable ROW LEVEL security;

CREATE policy "Залогиненый юзер может получить список всех юзеров" ON PUBLIC .users FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Создавать может только записи про себя" ON PUBLIC .users FOR
INSERT
  WITH CHECK (auth.uid() = id);

CREATE policy "Обновлять может только самого себя" ON PUBLIC .users FOR
UPDATE
  USING (auth.uid() = id);

-- Secure languages
ALTER TABLE
  PUBLIC .languages enable ROW LEVEL security;

CREATE policy "Залогиненый юзер может получить список всех языков" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Создавать может только тот, у кого есть привилегия" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Обновлять может только тот, у кого есть привилегия" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Удалять может только тот, у кого есть привилегия" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure user_roles
ALTER TABLE
  PUBLIC .user_roles enable ROW LEVEL security;

CREATE policy "Залогиненый юзер может получить список всех ролей любого пользователя" ON PUBLIC .user_roles FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Редактировать привилегии может координатор и администратор. Координатор может поменять роль на переводчика или модератора. Админ может на координатора, переводчика или модератора." ON PUBLIC .user_roles FOR
UPDATE
  USING (authorize('coordinator.set', auth.uid()));

+ -- Secure role_permissions
ALTER TABLE
  PUBLIC .role_permissions enable ROW LEVEL security;

-- Secure methods
ALTER TABLE
  PUBLIC .methods enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .methods FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .methods FOR
INSERT
  WITH CHECK (authorize('methods', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .methods FOR
UPDATE
  USING (authorize('methods', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .methods FOR
DELETE
  USING (authorize('methods', auth.uid()));

-- Secure projects
ALTER TABLE
  PUBLIC .projects enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure project_coordinators
ALTER TABLE
  PUBLIC .project_coordinators enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure project_moderators
ALTER TABLE
  PUBLIC .project_moderators enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure project_translators
ALTER TABLE
  PUBLIC .project_translators enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure briefs
ALTER TABLE
  PUBLIC .briefs enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure steps
ALTER TABLE
  PUBLIC .steps enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure books
ALTER TABLE
  PUBLIC .books enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure chapters
ALTER TABLE
  PUBLIC .chapters enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure verses
ALTER TABLE
  PUBLIC .verses enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Secure progress
ALTER TABLE
  PUBLIC .progress enable ROW LEVEL security;

CREATE policy "Allow everyone read access" ON PUBLIC .languages FOR
SELECT
  USING (auth.role() = 'authenticated');

CREATE policy "Обновлять может только самого себя" ON PUBLIC .languages FOR
INSERT
  WITH CHECK (authorize('languages', auth.uid()));

CREATE policy "Allow individual update access" ON PUBLIC .languages FOR
UPDATE
  USING (authorize('languages', auth.uid()));

CREATE policy "Allow individual delete access" ON PUBLIC .languages FOR
DELETE
  USING (authorize('languages', auth.uid()));

-- Send "previous data" on change
ALTER TABLE
  PUBLIC .users replica identity full;

ALTER TABLE
  PUBLIC .languages replica identity full;

-- inserts a row into public.users and assigns roles
CREATE FUNCTION PUBLIC .handle_new_user() returns TRIGGER LANGUAGE plpgsql security definer AS $$ -- declare is_admin boolean;
BEGIN
  INSERT INTO
    PUBLIC .users (id, email)
  VALUES
    (NEW .id, NEW .email);

INSERT INTO
  PUBLIC .user_roles (user_id, role)
VALUES
  (NEW .id, 'translator');

RETURN NEW;

END;

$$;

-- trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created after
INSERT
  ON auth.users FOR each ROW EXECUTE PROCEDURE PUBLIC .handle_new_user();

/**
 * REALTIME SUBSCRIPTIONS
 * Only allow realtime listening on public tables.
 */
BEGIN
;

-- remove the realtime publication
DROP publication IF EXISTS supabase_realtime;

-- re-create the publication but don't enable it for any tables
CREATE publication supabase_realtime;

COMMIT;

-- add tables to the publication
ALTER publication supabase_realtime
ADD
  TABLE PUBLIC .languages;

ALTER publication supabase_realtime
ADD
  TABLE PUBLIC .users;

-- DUMMY DATA
INSERT INTO
  PUBLIC .languages (eng, code, orig_name)
VALUES
  ('russian', 'ru', 'русский'),
  ('english', 'en', 'english');

INSERT INTO
  PUBLIC .role_permissions (role, permission)
VALUES
  ('moderator', 'dictionaries'),
  ('moderator', 'notes'),
  ('coordinator', 'dictionaries'),
  ('coordinator', 'notes'),
  ('coordinator', 'verses.set'),
  ('coordinator', 'moderator.set'),
  ('coordinator', 'user_projects'),
  ('admin', 'dictionaries'),
  ('admin', 'notes'),
  ('admin', 'verses.set'),
  ('admin', 'moderator.set'),
  ('admin', 'user_projects'),
  ('admin', 'projects'),
  ('admin', 'project_source'),
  ('admin', 'coordinator.set'),
  ('admin', 'languages'),
  ('admin', 'user_languages');