// 用户资料
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string;
  is_admin: boolean;
  created_at: string;
}

// 好友关系
export interface Friendship {
  id: number;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  // 联表查询字段
  friend_profile?: Profile;
  user_profile?: Profile;
}

// 公共动态
export interface Post {
  id: number;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  // 联表查询字段
  author?: Profile;
  comments?: Comment[];
}

// 评论
export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  // 联表查询字段
  author?: Profile;
}

// 私信
export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  // 联表查询字段
  sender?: Profile;
  receiver?: Profile;
}

// 通知
export interface Notification {
  id: number;
  user_id: string;
  type: 'comment' | 'friend_request' | 'message';
  content: string;
  related_id: string | null;
  read: boolean;
  created_at: string;
}

// 公司文化内容
export interface CompanyContent {
  id: number;
  title: string;
  content: string;
  section: 'banner' | 'mission' | 'values' | 'announcement';
  sort_order: number;
  updated_at: string;
}
