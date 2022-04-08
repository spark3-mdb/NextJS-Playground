import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import IconButton from '@leafygreen-ui/icon-button';
import Box, { BoxProps, ExtendableBox } from '@leafygreen-ui/box';
import ChevronUpIcon from '@leafygreen-ui/icon/dist/ChevronUp';
import ChevronDownIcon from '@leafygreen-ui/icon/dist/ChevronDown';
import { css, cx } from '@leafygreen-ui/emotion';
import { palette } from '@leafygreen-ui/palette';
import { createDataProp, getNodeTextContent } from '@leafygreen-ui/lib';
import { useUsingKeyboardContext } from '@leafygreen-ui/leafygreen-provider';
import { ExitHandler } from 'react-transition-group/Transition';
import {
  menuItemContainerStyle,
  activeMenuItemContainerStyle,
  disabledMenuItemContainerStyle,
  focusedMenuItemContainerStyle,
  linkStyle,
  disabledTextStyle,
  mainIconStyle,
  activeIconStyle,
  titleTextStyle,
  activeTitleTextStyle,
  descriptionTextStyle,
  linkDescriptionTextStyle,
  activeDescriptionTextStyle,
  textContainer,
  getFocusedStyles,
  getHoverStyles,
  menuItemHeight,
  paddingLeft,
} from './styles';

const subMenuContainer = createDataProp('sub-menu-container');
const iconButton = createDataProp('icon-button');

const subMenuContainerHeight = 56;
const iconButtonContainerSize = 28;

const subMenuStyle = css`
  min-height: 56px;
  background-color: ${palette.black};
  padding-right: ${iconButtonContainerSize + 16}px;
  align-items: center;
  justify-content: flex-start;
`;

const subMenuOpenStyle = css`
  background-color: transparent;

  &:hover {
    background-color: ${palette.gray.dark3};
  }
`;

const focusedIconStyle = css`
  ${subMenuContainer.selector}:focus + ${iconButton.selector} & {
    color: ${palette.white};
  }
`;

const closedIconStyle = css`
  transition: color 200ms ease-in-out;
  color: ${palette.gray.light1};
`;

const openIconStyle = css`
  color: ${palette.gray.light1};
`;

const iconButtonStyle = css`
  position: absolute;
  z-index: 1;
  right: 8px;
  top: ${subMenuContainerHeight / 2 - iconButtonContainerSize / 2}px;
  margin: auto;
  background-color: ${palette.black};
  transition: background-color 150ms ease-in-out;

  &:hover {
    background-color: ${palette.gray.dark2};
  }

  ${subMenuContainer.selector}:hover + & {
    background-color: ${palette.gray.dark3};
  }
`;

const iconButtonFocusedStyle = css`
  ${subMenuContainer.selector}:focus + & {
    background-color: ${palette.blue.dark2};

    &:hover:before {
      background-color: ${palette.blue.dark2};
    }
  }
`;

const openIconButtonStyle = css`
  background-color: ${palette.black};
`;

const ulStyle = css`
  list-style: none;
  padding: 0;
  height: 0;
  overflow: hidden;
  transition: height 150ms ease-in-out;
`;

const menuItemText = css`
  width: 100%;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  padding-left: 16px;
  text-shadow: none;
`;

const menuItemBorder = css`
  position: absolute;
  width: 100%;
  height: 1px;
  background: ${palette.gray.dark2};
  top: 0;
`;

const menuItemBorderBottom = css`
  ${menuItemBorder};
  top: unset;
  bottom: 0;
`;

const subItemStyle = css`
  // Reassign the variable for specificity
  --lg-menu-item-text-color: ${palette.gray.light1};
  position: relative;
`;

const subMenuItemHeight = 36;

interface SubMenuProps {
  /**
   * Determines if `<SubMenu />` item appears open
   */
  open?: boolean;

  /**
   * Function to set the value of `open` in `<SubMenu />`
   */
  setOpen?: (value: boolean) => void;

  /**
   * className applied to `SubMenu` root element
   */
  className?: string;

  /**
   * Content to appear below main text of SubMenu
   */
  description?: string | React.ReactElement;

  /**
   * Determines if `<SubMenu />` item appears disabled
   */
  disabled?: boolean;

  /**
   * Determines if `<SubMenu />` item appears active
   */
  active?: boolean;

  /**
   * Slot to pass in an Icon rendered to the left of `SubMenu` text.
   */
  glyph?: React.ReactElement;

  /**
   * Main text rendered in `SubMenu`.
   */
  title?: string;

  /**
   * Content rendered inside of `SubMenu`.
   */
  children?: React.ReactNode;

  onClick?: React.MouseEventHandler;

  onExited?: ExitHandler<HTMLElement>;

  href?: string;
}

const SubMenu: ExtendableBox<
  SubMenuProps & { ref?: React.Ref<any> },
  'button'
> = React.forwardRef(
  (
    {
      title,
      children,
      onClick,
      description,
      setOpen,
      className,
      glyph,
      onExited = () => {},
      open = false,
      active = false,
      disabled = false,
      ...rest
    }: SubMenuProps,
    ref: React.Ref<any>,
  ) => {
    const { usingKeyboard: showFocus } = useUsingKeyboardContext();
    const hoverStyles = getHoverStyles(subMenuContainer.selector);
    const focusStyles = getFocusedStyles(subMenuContainer.selector);

    const nodeRef = React.useRef(null);

    const [
      iconButtonElement,
      setIconButtonElement,
    ] = useState<HTMLElement | null>(null);

    const onRootClick = useCallback(
      (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent> &
          React.MouseEvent<HTMLButtonElement, MouseEvent>,
      ) => {
        if (iconButtonElement?.contains(e.target as HTMLElement)) {
          e.preventDefault();
        } else if (onClick) {
          onClick(e);
        }
      },
      [iconButtonElement, onClick],
    );

    const numberOfMenuItems = React.Children.toArray(children).length;

    const ChevronIcon = open ? ChevronDownIcon : ChevronUpIcon;
    const chevronIconStyles = cx({
      [openIconStyle]: open,
      [closedIconStyle]: !open,
      [focusedIconStyle]: showFocus,
    });

    const handleChevronClick = (e: React.MouseEvent) => {
      // we stop the event from propagating and closing the entire menu
      e.nativeEvent.stopImmediatePropagation();

      if (setOpen) {
        setOpen(!open);
      }
    };

    // TODO: This code is duplicated in `MenuItem`
    // We should consider combining these.
    // See: https://github.com/mongodb/leafygreen-ui/pull/1176
    const isAnchor = typeof rest.href === 'string';

    const updatedGlyph =
      glyph &&
      React.cloneElement(glyph, {
        role: 'presentation',
        className: cx(
          mainIconStyle,
          {
            [activeIconStyle]: active,
            [focusStyles.iconStyle]: showFocus,
          },
          glyph.props?.className,
        ),
      });

    const boxProps = {
      ...subMenuContainer.prop,
      ref,
      role: 'menuitem',
      'aria-haspopup': true,
      onClick: onRootClick,
      tabIndex: disabled ? -1 : undefined,
      'aria-disabled': disabled,
      // only add a disabled prop if not an anchor
      ...(typeof rest.href !== 'string' && { disabled }),
    };

    const anchorProps = isAnchor
      ? {
          target: '_self',
          rel: '',
        }
      : {};

    const content = (
      <>
        {updatedGlyph}
        <div className={textContainer}>
          <div
            data-text={getNodeTextContent(children)}
            className={cx(titleTextStyle, hoverStyles.text, {
              [activeTitleTextStyle]: active,
              [disabledTextStyle]: disabled,
              [focusStyles.textStyle]: showFocus,
            })}
          >
            {title}
          </div>
          {description && (
            <div
              className={cx(descriptionTextStyle, {
                [activeDescriptionTextStyle]: active,
                [disabledTextStyle]: disabled,
                [focusStyles.descriptionStyle]: showFocus,
                [linkDescriptionTextStyle]: typeof rest.href === 'string',
              })}
            >
              {description}
            </div>
          )}
        </div>
      </>
    );

    const as = isAnchor ? 'a' : 'button';

    return (
      <li role="none">
        <Box
          as={as}
          {...boxProps}
          {...anchorProps}
          {...rest}
          className={cx(
            menuItemContainerStyle,
            menuItemHeight('default'),
            linkStyle,
            subMenuStyle,
            {
              [activeMenuItemContainerStyle]: active,
              [disabledMenuItemContainerStyle]: disabled,
              [focusedMenuItemContainerStyle]: showFocus,
              [subMenuOpenStyle]: open,
            },
            className,
          )}
        >
          {content}
          <IconButton
            {...iconButton.prop}
            data-testid="lg-sub-menu-icon-button"
            darkMode={true}
            ref={setIconButtonElement}
            aria-label={open ? 'Close Sub-menu' : 'Open Sub-menu'}
            className={cx(iconButtonStyle, {
              [openIconButtonStyle]: open,
              [iconButtonFocusedStyle]: showFocus,
            })}
            onClick={handleChevronClick}
          >
            <ChevronIcon
              role="presentation"
              className={chevronIconStyles}
              size={14}
            />
          </IconButton>
        </Box>

        <Transition
          in={open}
          timeout={{
            enter: 0,
            exit: 150,
          }}
          mountOnEnter
          unmountOnExit
          onExited={onExited}
          nodeRef={nodeRef}
        >
          {(state: string) => (
            <ul
              ref={nodeRef}
              className={cx(ulStyle, {
                [css`
                  height: ${subMenuItemHeight * numberOfMenuItems}px;
                `]: state === 'entered',
              })}
              role="menu"
              aria-label={title}
            >
              {React.Children.map(
                children as React.ReactElement,
                (child, index) => {
                  return React.cloneElement(child, {
                    children: (
                      <>
                        <div className={menuItemBorder} />
                        <span className={menuItemText}>
                          {child.props.children}
                        </span>
                        {index === numberOfMenuItems - 1 && (
                          <div className={menuItemBorderBottom} />
                        )}
                      </>
                    ),
                    className: cx(
                      subItemStyle,
                      css`
                        padding-left: ${glyph ? paddingLeft : 28}px;
                      `,
                      child.props.className,
                    ),
                    onClick: (
                      e: React.MouseEvent<HTMLAnchorElement, MouseEvent> &
                        React.MouseEvent<HTMLButtonElement, MouseEvent>,
                    ) => {
                      child.props?.onClick?.(e);
                      if (onClick) {
                        onClick(e);
                      }
                    },
                  });
                },
              )}
            </ul>
          )}
        </Transition>
      </li>
    );
  },
);

SubMenu.displayName = 'SubMenu';

SubMenu.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  href: PropTypes.string,
  children: PropTypes.node,
  setOpen: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  onClick: PropTypes.func,
  glyph: PropTypes.element,
  onExited: PropTypes.func,
  open: PropTypes.bool,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default SubMenu;

export type SubMenuElement = React.ReactComponentElement<
  typeof SubMenu,
  BoxProps<'button', SubMenuProps & { ref?: React.Ref<any> }>
>;
