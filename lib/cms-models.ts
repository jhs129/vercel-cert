export interface CmsContent {
  id: string;
  name: string;
  published: string;
  data: {
    [key: string]: any;
  };
}

export interface CmsMetadata {
  description?: string;
  media?: string;
  keywords?: string;
}

export interface CmsPage extends CmsContent {
  data: {
    title?: string;
    metadata?: CmsMetadata;
  };
}

export interface CmsAlert extends CmsContent {
  data: {
    variant?: string;
    label: string;
    message: string;
  };
}

export interface CmsArticle extends CmsContent {
  data: {
    slug?: string;
    title?: string;
    categories?: string[];
    metadata?: CmsMetadata;
    publishDate?: number;
  };
}
