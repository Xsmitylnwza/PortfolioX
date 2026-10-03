import type { CaseEntryProps } from '../../types';
import VibeLayout from '../../../../components/ProjectDetailsVibe';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function VibeStudioCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="vibe" LayoutBody={VibeLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
