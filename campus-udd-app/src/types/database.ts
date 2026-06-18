// ── Database types (simplified placeholder — run `supabase gen types` for full generated types) ──

export type UserStatus = 'available' | 'in_class' | 'studying' | 'busy' | 'offline';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type GroupRole = 'admin' | 'member';
export type ActivityCategory = 'study' | 'meeting' | 'project' | 'lunch' | 'sport';
export type EventCategory = 'academic' | 'sports' | 'cultural' | 'party' | 'volunteering' | 'networking' | 'other';
export type AttendanceStatus = 'attending' | 'interested' | 'not_attending';
export type PresenceVisibility = 'everyone' | 'friends' | 'nobody';
export type NotificationType = 'friend_request' | 'event_reminder' | 'event_change' | 'friend_attending' | 'activity_invite' | 'group_invite';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  career: string | null;
  admission_year: number | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_building_id: string | null;
  status: UserStatus;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  user_id: string;
  show_schedule: boolean;
  show_presence: boolean;
  show_last_seen: boolean;
  presence_visibility: PresenceVisibility;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface ScheduleBlock {
  id: string;
  user_id: string;
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  subject: string;
  room: string | null;
  building_id: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
  profile?: Profile;
}

export interface GroupActivity {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description: string | null;
  category: ActivityCategory;
  activity_date: string;
  start_time: string;
  end_time: string;
  building_id: string | null;
  room: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  image_url: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  building_id: string | null;
  lat: number | null;
  lng: number | null;
  organizer_name: string;
  created_by: string;
  is_featured: boolean;
  is_cancelled: boolean;
  created_at: string;
  attendance_count?: number;
}

export interface EventAttendance {
  event_id: string;
  user_id: string;
  status: AttendanceStatus;
  updated_at: string;
}

export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface CampusPresence {
  user_id: string;
  is_on_campus: boolean;
  approximate_building_id: string | null;
  last_updated: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ── Supabase Database type (placeholder for supabase gen types) ──
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; full_name: string; email: string }; Update: Partial<Profile> };
      privacy_settings: { Row: PrivacySettings; Insert: Partial<PrivacySettings> & { user_id: string }; Update: Partial<PrivacySettings> };
      friendships: { Row: Friendship; Insert: { requester_id: string; addressee_id: string }; Update: Partial<Friendship> };
      schedule_blocks: { Row: ScheduleBlock; Insert: Omit<ScheduleBlock, 'id' | 'created_at'>; Update: Partial<ScheduleBlock> };
      groups: { Row: Group; Insert: Omit<Group, 'id' | 'created_at'>; Update: Partial<Group> };
      group_members: { Row: GroupMember; Insert: { group_id: string; user_id: string; role?: GroupRole }; Update: Partial<GroupMember> };
      group_activities: { Row: GroupActivity; Insert: Omit<GroupActivity, 'id' | 'created_at' | 'is_active'>; Update: Partial<GroupActivity> };
      events: { Row: Event; Insert: Omit<Event, 'id' | 'created_at' | 'is_featured' | 'is_cancelled'>; Update: Partial<Event> };
      event_attendance: { Row: EventAttendance; Insert: { event_id: string; user_id: string; status: AttendanceStatus }; Update: Partial<EventAttendance> };
      event_comments: { Row: EventComment; Insert: { event_id: string; user_id: string; content: string }; Update: never };
      campus_presence: { Row: CampusPresence; Insert: Partial<CampusPresence> & { user_id: string }; Update: Partial<CampusPresence> };
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at' | 'is_read'>; Update: Partial<Notification> };
    };
    Functions: {
      get_next_class: { Args: { p_user_id: string }; Returns: { subject: string; room: string; building_id: string; start_time: string; end_time: string; day: DayOfWeek; minutes_until: number }[] };
      mutual_friends_count: { Args: { p_user_a: string; p_user_b: string }; Returns: number };
    };
  };
};
