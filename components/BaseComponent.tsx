import React, { ComponentClass, FunctionComponent, PropsWithChildren } from 'react';

/**
 * A component whose root component can be controlled via a `component` prop.
 *
 * Adjusts valid props based on the type of `component`.
 */
 export interface OverridableComponent<M extends OverridableTypeMap> {
  <C extends React.ElementType>(
    props: {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      as: C;
    } & OverrideProps<M, C>,
  ): JSX.Element;
  (props: DefaultComponentProps<M>): JSX.Element;
}

/**
 * Props of the component if `component={Component}` is used.
 */
// prettier-ignore
export type OverrideProps<
  M extends OverridableTypeMap,
  C extends React.ElementType
> = (
  & BaseProps<M>
  & DistributiveOmit<React.ComponentPropsWithRef<C>, keyof BaseProps<M>>
);

/**
 * Props if `component={Component}` is NOT used.
 */
// prettier-ignore
export type DefaultComponentProps<M extends OverridableTypeMap> =
  & BaseProps<M>
  & DistributiveOmit<React.ComponentPropsWithRef<M['defaultComponent']>, keyof BaseProps<M>>;

/**
 * Props defined on the component (+ common material-ui props).
 */
// prettier-ignore
export type BaseProps<M extends OverridableTypeMap> =
& M['props']
& CommonProps;

/**
* Props that are valid for material-ui components.
*/
// each component declares it's classes in a separate interface for proper JSDoc.
export interface CommonProps extends StyledComponentProps<never> {
className?: string;
style?: React.CSSProperties;
}

export interface OverridableTypeMap {
props: {};
defaultComponent: React.ElementType;
}

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export interface StyledComponentProps<ClassKey extends string = string> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ClassNameMap<ClassKey>>;
}


export type ClassNameMap<ClassKey extends string = string> = Record<ClassKey, string>;

// DIVIDER

// interface BaseComponentProps {
//   as?: string | ComponentClass<BaseComponentProps, any> | FunctionComponent<BaseComponentProps>;
// }

// const BaseComponent = (props: PropsWithChildren<BaseComponentProps>) => {
//   const { as, ...rest } = props;
//   const defaultComponent = 'div';
//   const component = as ? as : defaultComponent;
//   return React.createElement(component, rest);
// }

// export default BaseComponent;