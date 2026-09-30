import React, { forwardRef, type CSSProperties, type ReactNode } from 'react';

type SvgStyle = CSSProperties | false | null | undefined | SvgStyle[];
type SvgProps = Record<string, unknown> & {
  children?: ReactNode;
  height?: number | string;
  style?: SvgStyle;
  viewBox?: string;
  width?: number | string;
  xml?: string;
};

function flattenStyle(style: SvgStyle): CSSProperties | undefined {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle).filter(Boolean));
  }

  return style && typeof style === 'object' ? style : undefined;
}

function cleanProps(props: SvgProps) {
  const { style, ...rest } = props;
  return {
    ...rest,
    style: flattenStyle(style),
  };
}

function createSvgElement(tagName: string) {
  return forwardRef<SVGElement, SvgProps>(function SvgElement(props, ref) {
    return React.createElement(tagName, { ...cleanProps(props), ref });
  });
}

const Svg = forwardRef<SVGSVGElement, SvgProps>(function Svg(props, ref) {
  return <svg {...cleanProps(props)} ref={ref} />;
});

export const Circle = createSvgElement('circle');
export const ClipPath = createSvgElement('clipPath');
export const Defs = createSvgElement('defs');
export const Ellipse = createSvgElement('ellipse');
export const G = createSvgElement('g');
export const Line = createSvgElement('line');
export const LinearGradient = createSvgElement('linearGradient');
export const Mask = createSvgElement('mask');
export const Path = createSvgElement('path');
export const Polygon = createSvgElement('polygon');
export const Polyline = createSvgElement('polyline');
export const RadialGradient = createSvgElement('radialGradient');
export const Rect = createSvgElement('rect');
export const Stop = createSvgElement('stop');
export const Symbol = createSvgElement('symbol');
export const TSpan = createSvgElement('tspan');
export const Text = createSvgElement('text');
export const TextPath = createSvgElement('textPath');
export const Use = createSvgElement('use');

export function SvgXml({ xml, width, height, style }: SvgProps) {
  return (
    <span
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: typeof xml === 'string' ? xml : '' }}
      style={{ display: 'inline-block', width, height, ...flattenStyle(style) }}
    />
  );
}

export const SvgUri = Svg;
export const SvgFromUri = Svg;
export const SvgFromXml = SvgXml;
export const SvgAst = Svg;
export const SvgCss = Svg;
export const SvgCssUri = Svg;
export const SvgWithCss = Svg;
export const SvgWithCssUri = Svg;
export const LocalSvg = Svg;
export const WithLocalSvg = Svg;

export default Svg;
