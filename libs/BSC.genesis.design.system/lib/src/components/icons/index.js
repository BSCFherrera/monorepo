"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFeatherIconRenderer = setFeatherIconRenderer;
exports.renderFeatherIcon = renderFeatherIcon;
const react_1 = require("react");
const react_native_1 = require("react-native");
let renderFn = null;
/**
 * Register a custom Feather icon renderer.
 * Consumers who install `@react-native-vector-icons/feather` call this once
 * to wire their icon component into every library component that needs icons.
 */
function setFeatherIconRenderer(fn) {
    renderFn = fn;
}
/**
 * Render an injected icon or a dependency-free geometric fallback.
 * Components call this internally; consumers override via `setFeatherIconRenderer`.
 */
function renderFeatherIcon(spec) {
    return renderFn?.(spec) ?? fallbackIcon(spec);
}
function fallbackIcon({ name, size = 24, color = '#000' }) {
    const scale = size / 24;
    const parts = [];
    const box = (style) => parts.push((0, react_1.createElement)(react_native_1.View, { key: parts.length, style: { position: 'absolute', ...style } }));
    const line = (x1, y1, x2, y2) => {
        const length = Math.hypot(x2 - x1, y2 - y1) * scale;
        box({ left: (x1 + x2) / 2 * scale - length / 2, top: (y1 + y2) / 2 * scale - scale, width: length, height: 2 * scale, borderRadius: scale, backgroundColor: color, transform: [{ rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }] });
    };
    const circle = (x, y, radius) => box({ left: (x - radius) * scale, top: (y - radius) * scale, width: radius * 2 * scale, height: radius * 2 * scale, borderRadius: radius * scale, borderWidth: 2 * scale, borderColor: color });
    if (name.startsWith('chevron-')) {
        const points = name === 'chevron-right' ? [9, 6, 15, 12, 9, 18] : name === 'chevron-left' ? [15, 6, 9, 12, 15, 18] : name === 'chevron-up' ? [6, 15, 12, 9, 18, 15] : [6, 9, 12, 15, 18, 9];
        line(points[0], points[1], points[2], points[3]);
        line(points[2], points[3], points[4], points[5]);
    }
    else if (name === 'check' || name === 'check-circle') {
        if (name === 'check-circle')
            circle(12, 12, 10);
        line(5, 12, 9, 16);
        line(9, 16, 20, 5);
    }
    else if (name === 'x') {
        line(6, 6, 18, 18);
        line(18, 6, 6, 18);
    }
    else if (name === 'menu') {
        [6, 12, 18].forEach(y => line(3, y, 21, y));
    }
    else if (name === 'arrow-left') {
        line(19, 12, 5, 12);
        line(5, 12, 12, 5);
        line(5, 12, 12, 19);
    }
    else if (name === 'user' || name === 'user-plus') {
        circle(9, 7, 4);
        box({ left: 2 * scale, top: 15 * scale, width: 14 * scale, height: 7 * scale, borderTopLeftRadius: 4 * scale, borderTopRightRadius: 4 * scale, borderWidth: 2 * scale, borderBottomWidth: 0, borderColor: color });
        if (name === 'user-plus') {
            line(20, 8, 20, 14);
            line(17, 11, 23, 11);
        }
    }
    else if (name === 'copy') {
        box({ left: 3 * scale, top: 3 * scale, width: 12 * scale, height: 12 * scale, borderWidth: 2 * scale, borderRadius: 2 * scale, borderColor: color });
        box({ left: 9 * scale, top: 9 * scale, width: 12 * scale, height: 12 * scale, borderWidth: 2 * scale, borderRadius: 2 * scale, borderColor: color });
    }
    else if (name === 'lock') {
        box({ left: 7 * scale, top: 2 * scale, width: 10 * scale, height: 14 * scale, borderRadius: 5 * scale, borderWidth: 2 * scale, borderColor: color });
        box({ left: 3 * scale, top: 11 * scale, width: 18 * scale, height: 11 * scale, borderRadius: 2 * scale, borderWidth: 2 * scale, borderColor: color });
    }
    else if (name === 'bell') {
        box({ left: 6 * scale, top: 2 * scale, width: 12 * scale, height: 16 * scale, borderTopLeftRadius: 6 * scale, borderTopRightRadius: 6 * scale, borderWidth: 2 * scale, borderColor: color });
        line(3, 18, 21, 18);
        line(11, 22, 13, 22);
    }
    else if (name === 'file-text') {
        box({ left: 4 * scale, top: 2 * scale, width: 16 * scale, height: 20 * scale, borderRadius: 2 * scale, borderWidth: 2 * scale, borderColor: color });
        line(8, 9, 12, 9);
        line(8, 13, 16, 13);
        line(8, 17, 16, 17);
    }
    else if (name === 'message-circle') {
        circle(12, 11, 9);
        line(5, 16, 3, 22);
        line(3, 22, 9, 19);
    }
    else {
        if (name === 'alert-triangle') {
            line(12, 3, 2, 21);
            line(2, 21, 22, 21);
            line(22, 21, 12, 3);
        }
        else
            circle(12, 12, 10);
        if (name === 'clock') {
            line(12, 6, 12, 12);
            line(12, 12, 16, 14);
        }
        else {
            line(12, 9, 12, 14);
            circle(12, 17, 0.5);
        }
    }
    return (0, react_1.createElement)(react_native_1.View, { accessible: false, pointerEvents: 'none', style: { width: size, height: size } }, parts);
}
