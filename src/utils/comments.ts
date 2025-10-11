const API_KEY = import.meta.env.VITE_AYRSHARE_API_KEY;
const BASE_URL = 'https://api.ayrshare.com/api';

export interface Comment {
  comment: string;
  commentId: string;
  created: string;
  likeCount?: number;
  platform: string;
  userName?: string;
  from?: {
    name?: string;
    id?: string;
    username?: string;
  };
  replies?: Comment[];
  [key: string]: any;
}

export interface CommentsResponse {
  status: string;
  id?: string;
  lastUpdated?: string;
  nextUpdate?: string;
  [platform: string]: any;
}

export const fetchComments = async (
  profileKey: string,
  postId: string,
  options?: {
    searchPlatformId?: boolean;
    commentId?: boolean;
    platform?: string;
  }
): Promise<CommentsResponse> => {
  const queryParams = new URLSearchParams();

  if (options?.searchPlatformId) {
    queryParams.append('searchPlatformId', 'true');
  }

  if (options?.commentId) {
    queryParams.append('commentId', 'true');
  }

  if (options?.platform) {
    queryParams.append('platform', options.platform);
  }

  const url = `${BASE_URL}/comments/${postId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to fetch comments: ${response.statusText}`);
  }

  return response.json();
};

export const postComment = async (
  profileKey: string,
  postId: string,
  commentText: string,
  options?: {
    platforms?: string[];
    searchPlatformId?: boolean;
    platform?: string;
  }
): Promise<any> => {
  const queryParams = new URLSearchParams();

  if (options?.searchPlatformId) {
    queryParams.append('searchPlatformId', 'true');
  }

  if (options?.platform) {
    queryParams.append('platform', options.platform);
  }

  const url = `${BASE_URL}/comments/${postId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const body: any = {
    comment: commentText,
  };

  if (options?.platforms) {
    body.platforms = options.platforms;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to post comment: ${response.statusText}`);
  }

  return response.json();
};

export const deleteComment = async (
  profileKey: string,
  commentId: string,
  options?: {
    searchPlatformId?: boolean;
    commentId?: boolean;
    platform?: string;
  }
): Promise<any> => {
  const queryParams = new URLSearchParams();

  if (options?.searchPlatformId) {
    queryParams.append('searchPlatformId', 'true');
  }

  if (options?.commentId) {
    queryParams.append('commentId', 'true');
  }

  if (options?.platform) {
    queryParams.append('platform', options.platform);
  }

  const url = `${BASE_URL}/comments/${commentId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to delete comment: ${response.statusText}`);
  }

  return response.json();
};

export const getAllCommentsForPlatform = (commentsResponse: CommentsResponse, platform: string): Comment[] => {
  const platformComments = commentsResponse[platform];
  if (!platformComments || !Array.isArray(platformComments)) {
    return [];
  }
  return platformComments;
};

export const getTotalCommentsCount = (commentsResponse: CommentsResponse): number => {
  let total = 0;
  const platforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin', 'threads', 'reddit', 'bluesky'];

  platforms.forEach(platform => {
    const platformComments = commentsResponse[platform];
    if (Array.isArray(platformComments)) {
      total += platformComments.length;
      platformComments.forEach(comment => {
        if (comment.replies && Array.isArray(comment.replies)) {
          total += comment.replies.length;
        }
      });
    }
  });

  return total;
};

export const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const sortCommentsByDate = (comments: Comment[], ascending: boolean = false): Comment[] => {
  return [...comments].sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortCommentsByLikes = (comments: Comment[]): Comment[] => {
  return [...comments].sort((a, b) => {
    const likesA = a.likeCount || 0;
    const likesB = b.likeCount || 0;
    return likesB - likesA;
  });
};

export const filterCommentsByAuthor = (comments: Comment[], isOwner: boolean): Comment[] => {
  return comments.filter(comment => {
    if (isOwner) {
      return comment.owner === true || comment.isSubmitter === true;
    }
    return comment.owner !== true && comment.isSubmitter !== true;
  });
};
