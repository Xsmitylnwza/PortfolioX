export type ProjectMedia = string | {
  image?: string;
  video?: string;
  kind?: 'cover';
};

export interface ProjectFlowStep {
  step: string;
  title: string;
  body: string;
  cue?: string;
}

export interface ProjectWhyItem {
  title: string;
  body: string;
}

export interface ProjectRecord {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  fullDescription: string;
  tags: string[];
  coverImage: string;
  heroMedia: { image: string; video?: string; kind?: 'cover' };
  link: string | null;
  repo?: string | null;
  role: string;
  code?: string;
  liveStatus?: string;
  liveNotice?: string;
  gallery?: ProjectMedia[];
  galleryLabels?: string[];
  galleryDescriptions?: string[];
  galleryKinds?: string[];
  demoPresentation?: 'stacked' | 'grid';
  flow?: ProjectFlowStep[];
  why?: ProjectWhyItem[];
}
