import type { CaseEntryProps } from '../../types';
import KeshiLayout from '../../../../components/ProjectDetailsKeshi';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function KeshiCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="keshi" LayoutBody={KeshiLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
