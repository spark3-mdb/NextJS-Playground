import { cx } from '@emotion/css';

const CustomComponent = ({ className }: { className: string }) => {

  return (
    <div className={cx(className)}>
      This is a custom component.
    </div>
  )
}

export default CustomComponent;