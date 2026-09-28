import type { CaseEntryProps } from '../../types';
import ModeNoteLayout from '../../../../components/ProjectDetailsModeNote';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function ModeNoteCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="modenote" LayoutBody={ModeNoteLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
