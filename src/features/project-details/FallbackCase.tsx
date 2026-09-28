import type { CaseEntryProps } from './types';
import { CinemaLayout } from '../../components/ProjectDetailsFallback';
import ProjectDetailsShell from '../../components/ProjectDetailsShell';
import '../../components/ProjectDetailsStyles';

export default function FallbackCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="default" LayoutBody={CinemaLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
