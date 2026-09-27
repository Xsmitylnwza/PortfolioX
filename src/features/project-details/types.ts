import type { ComponentType } from 'react';
import type { ProjectMedia, ProjectRecord } from '../../data/projectTypes';

export interface CaseEntryProps {
  project: ProjectRecord;
  currentIndex: number;
  caseTotal: number;
}

export interface CaseLayoutProps {
  project: ProjectRecord;
  decision: string | undefined;
  techItems: string[];
  gallery: ProjectMedia[];
  hasLive: boolean;
  hasRepo: boolean;
}

export type CaseLayoutName = 'hermes' | 'modenote' | 'freeflow' | 'mux' | 'zuch' | 'keshi' | 'decrypt' | 'default';

export interface CaseShellProps extends CaseEntryProps {
  layout: CaseLayoutName;
  LayoutBody: ComponentType<CaseLayoutProps>;
  isKeshiNext?: boolean;
}
