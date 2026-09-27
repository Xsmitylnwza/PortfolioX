import type { CaseEntryProps } from '../../types';
import ZuchLayout from '../../../../components/ProjectDetailsZucchini';
import ProjectDetailsShell from '../../../../components/ProjectDetailsShell';
import '../../../../components/ProjectDetailsStyles';

export default function ZucchiniCase({ project, currentIndex, caseTotal }: CaseEntryProps) {
  return <ProjectDetailsShell project={project} layout="zuch" LayoutBody={ZuchLayout} currentIndex={currentIndex} caseTotal={caseTotal} />;
}
