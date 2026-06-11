export type DocumentPreview = {
  id: string;
  title: string;
  linkedPath: string;
  linkedTopic: string;
  excerpt: string;
  content?: string;
  reviewLater: boolean;
  updatedTime: string;
  tags: string[];
};

export type DocumentTopicOption = {
  id: string;
  title: string;
  pathTitle: string;
};

// Aliases for transition compatibility
export type NotePreview = DocumentPreview;
export type NoteTopicOption = DocumentTopicOption;
