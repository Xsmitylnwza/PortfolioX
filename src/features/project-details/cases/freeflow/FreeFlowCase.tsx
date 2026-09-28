import type { CaseEntryProps } from '../../types';
import FreeflowLayout from '../../../../components/ProjectDetailsFreeflow';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function FreeFlowCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="freeflow" LayoutBody={FreeflowLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
