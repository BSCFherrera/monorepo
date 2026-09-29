import { type ReactNode } from 'react';
export interface FeatherIconSpec {
    name: string;
    size?: number;
    color?: string;
}
/**
 * Register a custom Feather icon renderer.
 * Consumers who install `@react-native-vector-icons/feather` call this once
 * to wire their icon component into every library component that needs icons.
 */
export declare function setFeatherIconRenderer(fn: (spec: FeatherIconSpec) => ReactNode | null): void;
/**
 * Render an injected icon or a dependency-free geometric fallback.
 * Components call this internally; consumers override via `setFeatherIconRenderer`.
 */
export declare function renderFeatherIcon(spec: FeatherIconSpec): ReactNode | null;
