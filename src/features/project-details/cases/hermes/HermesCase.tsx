import type { CaseEntryProps } from '../../types';
import HermesLayout from '../../../../components/ProjectDetailsHermes';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function HermesCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="hermes" LayoutBody={HermesLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
