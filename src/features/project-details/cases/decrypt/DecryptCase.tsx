import type { CaseEntryProps } from '../../types';
import DecryptLayout from '../../../../components/ProjectDetailsDecrypt';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function DecryptCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="decrypt" LayoutBody={DecryptLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
