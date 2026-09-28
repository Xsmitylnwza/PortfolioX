import type { CaseEntryProps } from '../../types';
import MuxLayout from '../../../../components/ProjectDetailsMux';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function VelumaCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return (
    <ProjectDetailsShell
      project={project}
      layout="mux"
      LayoutBody={MuxLayout}
      currentIndex={currentIndex}
      caseTotal={caseTotal}
    />
  );
}
