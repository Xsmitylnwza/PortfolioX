import type { CaseEntryProps } from '../../types';
import KeshiNextLayout from '../../../../components/ProjectDetailsKeshiNext';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function KeshiNextCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="keshi" LayoutBody={KeshiNextLayout} isKeshiNext currentIndex={currentIndex} caseTotal={caseTotal} />;
}
