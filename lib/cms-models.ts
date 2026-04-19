export interface CmsMetadata {
  description?: string;
  media?: string;
  keywords?: string;
}

export interface CmsPage {
  data: {
    title?: string;
    metadata?: CmsMetadata;
  };
}

export interface CmsAlert {
  id: string;
  data: {
    variant?: string;
    label: string;
    message: string;
  };
}

export interface CmsArticle {
  data: {
    slug?: string;
    title?: string;
    metadata?: CmsMetadata;
    publishDate?: string;
  };
}
