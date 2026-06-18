-- ============================================================================
-- Campus UDD — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all tables, enums, indexes, functions, RLS policies,
--              and triggers for the Campus UDD social-network application.
-- ============================================================================


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  1. EXTENSIONS                                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Trigram similarity for fuzzy search


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  2. ENUM TYPES                                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE TYPE user_status AS ENUM (
  'available', 'in_class', 'studying', 'busy', 'offline'
);

CREATE TYPE friendship_status AS ENUM (
  'pending', 'accepted', 'rejected'
);

CREATE TYPE day_of_week AS ENUM (
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
);

CREATE TYPE group_role AS ENUM (
  'admin', 'member'
);

CREATE TYPE activity_category AS ENUM (
  'study', 'meeting', 'project', 'lunch', 'sport'
);

CREATE TYPE event_category AS ENUM (
  'academic', 'sports', 'cultural', 'party', 'volunteering', 'networking', 'other'
);

CREATE TYPE attendance_status AS ENUM (
  'attending', 'interested', 'not_attending'
);

CREATE TYPE presence_visibility AS ENUM (
  'everyone', 'friends', 'nobody'
);

CREATE TYPE notification_type AS ENUM (
  'friend_request',
  'event_reminder',
  'event_change',
  'friend_attending',
  'activity_invite',
  'group_invite'
);


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  3. TABLES                                                             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- 3.1  profiles — Core user profile, linked 1-to-1 with auth.users
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  career           TEXT,                               -- e.g. "Ingeniería Civil"
  admission_year   INT,                                -- e.g. 2023
  avatar_url       TEXT,
  bio              TEXT,
  favorite_building_id TEXT,                           -- free-form building key
  status           user_status NOT NULL DEFAULT 'offline',
  last_seen        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.2  privacy_settings — Per-user privacy configuration
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE privacy_settings (
  user_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  show_schedule        BOOLEAN NOT NULL DEFAULT true,
  show_presence        BOOLEAN NOT NULL DEFAULT true,
  show_last_seen       BOOLEAN NOT NULL DEFAULT true,
  presence_visibility  presence_visibility NOT NULL DEFAULT 'friends'
);

ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.3  friendships — Bidirectional friend connections
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        friendship_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_friendship UNIQUE (requester_id, addressee_id),
  CONSTRAINT chk_no_self_friend CHECK (requester_id <> addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.4  schedule_blocks — Weekly class schedule entries
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE schedule_blocks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day          day_of_week NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  subject      TEXT NOT NULL,
  room         TEXT,
  building_id  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_schedule_time CHECK (end_time > start_time)
);

ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.5  groups — User-created study / social groups
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.6  group_members — M:N relationship between groups and users
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE group_members (
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.7  group_activities — Scheduled activities within a group
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE group_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  category      activity_category NOT NULL DEFAULT 'study',
  activity_date DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  building_id   TEXT,
  room          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.8  activity_participants — Users who joined a group activity
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE activity_participants (
  activity_id UUID NOT NULL REFERENCES group_activities(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (activity_id, user_id)
);

ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.9  events — Campus-wide events (public or featured)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  category       event_category NOT NULL DEFAULT 'other',
  image_url      TEXT,
  event_date     DATE NOT NULL,
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  building_id    TEXT,
  lat            DOUBLE PRECISION,
  lng            DOUBLE PRECISION,
  organizer_name TEXT,
  created_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  is_cancelled   BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.10 event_attendance — RSVPs for campus events
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE event_attendance (
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status     attendance_status NOT NULL DEFAULT 'interested',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.11 event_comments — Comments on events
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE event_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_comment_length CHECK (char_length(content) <= 500)
);

ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.12 campus_presence — Real-time on-campus location beacon
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE campus_presence (
  user_id                UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_on_campus           BOOLEAN NOT NULL DEFAULT false,
  approximate_building_id TEXT,
  last_updated           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE campus_presence ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.13 notifications — In-app notification feed
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  4. INDEXES                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Trigram index for fuzzy search on profile names
CREATE INDEX idx_profiles_full_name_trgm
  ON profiles USING gin (full_name gin_trgm_ops);

-- Profiles
CREATE INDEX idx_profiles_career       ON profiles (career);
CREATE INDEX idx_profiles_status       ON profiles (status);

-- Friendships
CREATE INDEX idx_friendships_requester ON friendships (requester_id);
CREATE INDEX idx_friendships_addressee ON friendships (addressee_id);
CREATE INDEX idx_friendships_status    ON friendships (status);

-- Schedule blocks
CREATE INDEX idx_schedule_blocks_user  ON schedule_blocks (user_id);
CREATE INDEX idx_schedule_blocks_day   ON schedule_blocks (day);

-- Groups
CREATE INDEX idx_groups_created_by     ON groups (created_by);

-- Group members
CREATE INDEX idx_group_members_user    ON group_members (user_id);

-- Group activities
CREATE INDEX idx_group_activities_group ON group_activities (group_id);
CREATE INDEX idx_group_activities_date  ON group_activities (activity_date);

-- Activity participants
CREATE INDEX idx_activity_participants_user ON activity_participants (user_id);

-- Events
CREATE INDEX idx_events_date           ON events (event_date);
CREATE INDEX idx_events_category       ON events (category);
CREATE INDEX idx_events_created_by     ON events (created_by);
CREATE INDEX idx_events_featured       ON events (is_featured) WHERE is_featured = true;

-- Event attendance
CREATE INDEX idx_event_attendance_user ON event_attendance (user_id);

-- Event comments
CREATE INDEX idx_event_comments_event  ON event_comments (event_id);
CREATE INDEX idx_event_comments_user   ON event_comments (user_id);

-- Notifications
CREATE INDEX idx_notifications_user         ON notifications (user_id);
CREATE INDEX idx_notifications_unread       ON notifications (user_id, is_read)
  WHERE is_read = false;
CREATE INDEX idx_notifications_created      ON notifications (created_at DESC);


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  5. HELPER FUNCTIONS                                                   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- 5.1  is_friend — Returns true if two users are accepted friends.
--      (internal helper used by multiple RLS policies)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_friend(uid_a UUID, uid_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
      AND (
        (requester_id = uid_a AND addressee_id = uid_b)
        OR
        (requester_id = uid_b AND addressee_id = uid_a)
      )
  );
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 5.2  get_next_class — Returns the user's next class block for today.
--      Uses the server's current day/time. Returns one row or none.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_next_class(p_user_id UUID)
RETURNS TABLE (
  block_id    UUID,
  subject     TEXT,
  room        TEXT,
  building_id TEXT,
  start_time  TIME,
  end_time    TIME
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_today day_of_week;
BEGIN
  -- Map PostgreSQL dow (0=Sun … 6=Sat) to our enum
  v_today := CASE EXTRACT(DOW FROM now())
    WHEN 1 THEN 'mon'::day_of_week
    WHEN 2 THEN 'tue'::day_of_week
    WHEN 3 THEN 'wed'::day_of_week
    WHEN 4 THEN 'thu'::day_of_week
    WHEN 5 THEN 'fri'::day_of_week
    WHEN 6 THEN 'sat'::day_of_week
    ELSE NULL  -- Sunday: no classes
  END;

  -- No classes on Sunday
  IF v_today IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT
      sb.id,
      sb.subject,
      sb.room,
      sb.building_id,
      sb.start_time,
      sb.end_time
    FROM schedule_blocks sb
    WHERE sb.user_id = p_user_id
      AND sb.day = v_today
      AND sb.start_time > now()::time
    ORDER BY sb.start_time
    LIMIT 1;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 5.3  mutual_friends_count — Counts mutual accepted friends between two users
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION mutual_friends_count(p_user_a UUID, p_user_b UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH friends_a AS (
    SELECT CASE
      WHEN requester_id = p_user_a THEN addressee_id
      ELSE requester_id
    END AS friend_id
    FROM friendships
    WHERE status = 'accepted'
      AND (requester_id = p_user_a OR addressee_id = p_user_a)
  ),
  friends_b AS (
    SELECT CASE
      WHEN requester_id = p_user_b THEN addressee_id
      ELSE requester_id
    END AS friend_id
    FROM friendships
    WHERE status = 'accepted'
      AND (requester_id = p_user_b OR addressee_id = p_user_b)
  )
  SELECT COUNT(*)::INT
  FROM friends_a
  INNER JOIN friends_b USING (friend_id);
$$;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  6. ROW LEVEL SECURITY POLICIES                                        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- 6.1  profiles
-- ────────────────────────────────────────────────────────────────────────────

-- Anyone authenticated can read all profiles
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile row (on sign-up)
CREATE POLICY profiles_insert ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.2  privacy_settings — Owner only
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY privacy_select ON privacy_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY privacy_insert ON privacy_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY privacy_update ON privacy_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY privacy_delete ON privacy_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.3  friendships
-- ────────────────────────────────────────────────────────────────────────────

-- Both parties can read the friendship row
CREATE POLICY friendships_select ON friendships
  FOR SELECT
  USING (auth.uid() IN (requester_id, addressee_id));

-- Only the requester can create a friend request
CREATE POLICY friendships_insert ON friendships
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Only the addressee can update (accept / reject)
CREATE POLICY friendships_update ON friendships
  FOR UPDATE
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

-- Either party can delete (unfriend / cancel)
CREATE POLICY friendships_delete ON friendships
  FOR DELETE
  USING (auth.uid() IN (requester_id, addressee_id));

-- ────────────────────────────────────────────────────────────────────────────
-- 6.4  schedule_blocks — Owner full access, friends read if allowed
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY schedule_select ON schedule_blocks
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      is_friend(auth.uid(), user_id)
      AND (SELECT show_schedule FROM privacy_settings WHERE privacy_settings.user_id = schedule_blocks.user_id)
    )
  );

CREATE POLICY schedule_insert ON schedule_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY schedule_update ON schedule_blocks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY schedule_delete ON schedule_blocks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.5  groups
-- ────────────────────────────────────────────────────────────────────────────

-- Everyone can read groups
CREATE POLICY groups_select ON groups
  FOR SELECT
  USING (true);

-- Creator can insert
CREATE POLICY groups_insert ON groups
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Admins of the group can update it
CREATE POLICY groups_update ON groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

-- Only the creator can delete the group
CREATE POLICY groups_delete ON groups
  FOR DELETE
  USING (auth.uid() = created_by);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.6  group_members
-- ────────────────────────────────────────────────────────────────────────────

-- Members of the group can see all other members
CREATE POLICY group_members_select ON group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
    )
  );

-- Admins can add members, or a user can add themselves (join)
CREATE POLICY group_members_insert ON group_members
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id   -- self-join
    OR EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
        AND gm2.role = 'admin'
    )
  );

-- Admins can update member roles
CREATE POLICY group_members_update ON group_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
        AND gm2.role = 'admin'
    )
  );

-- Members can leave; admins can remove others
CREATE POLICY group_members_delete ON group_members
  FOR DELETE
  USING (
    auth.uid() = user_id   -- leave the group
    OR EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
        AND gm2.role = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 6.7  group_activities
-- ────────────────────────────────────────────────────────────────────────────

-- Members of the group can see its activities
CREATE POLICY group_activities_select ON group_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_activities.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Any member can create an activity in the group
CREATE POLICY group_activities_insert ON group_activities
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_activities.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Creator can update their activity
CREATE POLICY group_activities_update ON group_activities
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Creator can delete their activity
CREATE POLICY group_activities_delete ON group_activities
  FOR DELETE
  USING (auth.uid() = created_by);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.8  activity_participants
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY activity_participants_select ON activity_participants
  FOR SELECT
  USING (true);

CREATE POLICY activity_participants_insert ON activity_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY activity_participants_delete ON activity_participants
  FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.9  events — Everyone reads, creator modifies
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY events_select ON events
  FOR SELECT
  USING (true);

CREATE POLICY events_insert ON events
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY events_update ON events
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY events_delete ON events
  FOR DELETE
  USING (auth.uid() = created_by);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.10 event_attendance — Everyone reads, user manages own RSVP
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY event_attendance_select ON event_attendance
  FOR SELECT
  USING (true);

CREATE POLICY event_attendance_insert ON event_attendance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY event_attendance_update ON event_attendance
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY event_attendance_delete ON event_attendance
  FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.11 event_comments — Everyone reads, author inserts/deletes
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY event_comments_select ON event_comments
  FOR SELECT
  USING (true);

CREATE POLICY event_comments_insert ON event_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY event_comments_delete ON event_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.12 campus_presence — Owner manages, visibility governed by privacy
-- ────────────────────────────────────────────────────────────────────────────

-- Owner always sees their own. Others see based on presence_visibility setting.
CREATE POLICY campus_presence_select ON campus_presence
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      -- Check the owner's privacy preferences
      EXISTS (
        SELECT 1 FROM privacy_settings ps
        WHERE ps.user_id = campus_presence.user_id
          AND ps.show_presence = true
          AND (
            ps.presence_visibility = 'everyone'
            OR (
              ps.presence_visibility = 'friends'
              AND is_friend(auth.uid(), campus_presence.user_id)
            )
          )
      )
    )
  );

CREATE POLICY campus_presence_insert ON campus_presence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY campus_presence_update ON campus_presence
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY campus_presence_delete ON campus_presence
  FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6.13 notifications — Owner only
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY notifications_select ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY notifications_insert ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notifications_update ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notifications_delete ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  7. TRIGGERS                                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- 7.1  on_profile_created — Auto-create privacy_settings + campus_presence
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO privacy_settings (user_id) VALUES (NEW.id);
  INSERT INTO campus_presence  (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();

-- ────────────────────────────────────────────────────────────────────────────
-- 7.2  on_group_created — Auto-add the creator as admin member
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_group()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_group();

-- ────────────────────────────────────────────────────────────────────────────
-- 7.3  on_friend_request — Auto-create notification for the addressee
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_name TEXT;
BEGIN
  -- Only fire on new pending requests
  IF NEW.status = 'pending' THEN
    SELECT full_name INTO v_requester_name
    FROM profiles WHERE id = NEW.requester_id;

    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.addressee_id,
      'friend_request',
      'Nueva solicitud de amistad',
      v_requester_name || ' te envió una solicitud de amistad.',
      jsonb_build_object(
        'friendship_id', NEW.id,
        'requester_id', NEW.requester_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_friend_request
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_request();

-- ────────────────────────────────────────────────────────────────────────────
-- 7.4  updated_at auto-touch for profiles
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- ============================================================================
-- End of migration 001_initial_schema.sql
-- ============================================================================
