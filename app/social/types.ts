export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};
