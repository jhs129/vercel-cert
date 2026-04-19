export interface CmsMetadata {
  description?: string;
  media?: string;
  keywords?: string;
}

export interface CmsPage {
  title?: string;
  metadata?: CmsMetadata;
}

export interface CmsAlert {
  id: string;
  variant?: string;
  label: string;
  message: string;
}

export interface CmsArticle {
  slug?: string;
  title?: string;
  metadata?: CmsMetadata;
  publishDate?: string;
}
