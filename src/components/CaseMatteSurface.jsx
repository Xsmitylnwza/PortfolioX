const CaseMatteSurface = ({
  as = 'div',
  children,
  className = '',
  contentClassName = '',
  ...props
}) => {
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
