import type { ElementType, HTMLAttributes, ReactNode } from 'react';

interface CaseMatteProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children?: ReactNode;
  contentClassName?: string;
}

const CaseMatteSurface = ({
  as = 'div',
  children,
  className = '',
  contentClassName = '',
  ...props
}: CaseMatteProps) => {
  const Root = as;

  return (
    <Root
      {...props}
      className={['case-matte-surface', className].filter(Boolean).join(' ')}
    >
      <div className={['case-matte-surface__content', contentClassName].filter(Boolean).join(' ')}>
        {children}
      </div>
    </Root>
  );
};

export default CaseMatteSurface;
