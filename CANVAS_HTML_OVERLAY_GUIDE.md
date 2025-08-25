# Canvas + HTML Overlay Development Guide

A comprehensive guide for migrating from pure React DOM rendering to Canvas2D with HTML overlays for high-performance interactive applications.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Canvas Rendering Fundamentals](#canvas-rendering-fundamentals)
3. [Coordinate Systems & Transformations](#coordinate-systems--transformations)
4. [HTML Overlay Architecture](#html-overlay-architecture)
5. [Event Handling & Interactions](#event-handling--interactions)
6. [Performance Optimization](#performance-optimization)
7. [High Refresh Rate Rendering](#high-refresh-rate-rendering)
8. [Canvas Context Optimization](#canvas-context-optimization)
9. [Memory Management](#memory-management)
10. [Common Pitfalls & Solutions](#common-pitfalls--solutions)

---

## Core Concepts

### When to Use Canvas + HTML Overlay

**Canvas excels at:**
- Rendering hundreds/thousands of similar items efficiently
- Custom graphics, shapes, and animations
- Pixel-perfect drawing operations
- High-frequency updates (120Hz+)
- Spatial data visualization

**HTML overlays excel at:**
- Text input fields and forms
- Rich text editing (TipTap, etc.)
- Complex UI controls (dropdowns, modals)
- Accessibility features
- Browser-native interactions

### Hybrid Architecture Benefits

- **Performance**: Canvas handles bulk rendering, HTML handles complex UI
- **Accessibility**: HTML elements remain screen-reader accessible
- **Development Speed**: Leverage existing HTML/CSS knowledge for UI components
- **Native Feel**: Canvas provides 120Hz smooth interactions, HTML provides familiar controls

---

## Canvas Rendering Fundamentals

### Canvas Setup and Sizing

Canvas has two distinct dimensions:
- **Display size**: CSS width/height (what the user sees)
- **Drawing buffer size**: canvas.width/height properties (actual pixels)

**Key Concepts:**
- Always match drawing buffer to display size × devicePixelRatio for crisp rendering
- Use ResizeObserver to handle dynamic sizing
- Canvas context is expensive to create - cache it when possible

### Drawing Operations

**Path-based drawing:**
- Use `beginPath()` to start new shapes
- Build paths with `moveTo()`, `lineTo()`, `quadraticCurveTo()`, etc.
- Fill paths with `fill()`, stroke with `stroke()`
- `closePath()` connects back to starting point

**Text rendering:**
- Set `font` property before drawing text
- Use `fillText()` for solid text, `strokeText()` for outlines
- `textBaseline` affects vertical alignment
- `measureText()` returns width for layout calculations

**Transform stack:**
- `save()` and `restore()` manage transform state
- `setTransform()` for absolute transforms
- `scale()`, `translate()`, `rotate()` for relative transforms

---

## Coordinate Systems & Transformations

### World vs Screen Coordinates

**World coordinates:**
- Your logical coordinate system (card positions, etc.)
- Independent of zoom level and camera position
- Consistent regardless of viewport size

**Screen/View coordinates:**
- Pixel positions on the canvas
- Affected by camera position and zoom
- What the user actually sees

### Camera Implementation

A camera system needs:
- **Position** (x, y): Where the camera is looking
- **Zoom** (z): Scale factor for magnification
- **Transform matrix**: Converts world → screen coordinates

**Key formulas:**
- World to Screen: `screenX = cameraX + worldX * zoom`
- Screen to World: `worldX = (screenX - cameraX) / zoom`

### Zoom Anchoring

When zooming, you want the point under the cursor to remain stationary:
1. Get cursor position in screen coordinates
2. Convert to world coordinates using current camera
3. Apply new zoom level
4. Adjust camera position so cursor world point maps to same screen point

---

## HTML Overlay Architecture

### Positioning Strategy

**Absolute positioning:**
- Use `position: absolute` on overlay containers
- Position relative to viewport, not canvas
- Use `transform: translate3d()` for GPU acceleration
- `pointer-events: none` to prevent interference, `pointer-events: auto` for interactive elements

### Coordinate Synchronization

**Keeping overlays aligned:**
- Calculate screen position from world coordinates using camera transform
- Update overlay positions in the same requestAnimationFrame as canvas drawing
- Use React refs or imperative DOM updates for minimal overhead

### Layer Management

**Typical z-index stack:**
- Canvas: z-index 1 (base layer)
- Non-interactive overlays: z-index 2-9
- Interactive overlays (forms, modals): z-index 10+
- Debug/dev tools: z-index 1000+

---

## Event Handling & Interactions

### Pointer Events vs Mouse Events

**Pointer Events** (recommended):
- Unified handling for mouse, touch, and pen input
- Built-in pointer capture for dragging
- Better multi-touch support
- Use `setPointerCapture()` during drags to handle mouse leaving canvas

**Event delegation:**
- Attach all interaction handlers to the canvas element
- Calculate world coordinates from screen coordinates for hit testing
- Use event.pointerId for tracking multiple simultaneous inputs

### Hit Testing

**Techniques for finding clicked objects:**
- **Bounding box**: Simple rectangle collision detection
- **Spatial indexing**: Quad-tree or R-tree for large datasets
- **Reverse iteration**: Check top-most items first for proper layering

### Interaction States

**State management patterns:**
- Separate refs for different interaction states (dragging, hovering, selected)
- Use `useRef` for values that shouldn't trigger re-renders
- Batch state updates to minimize React updates during interactions

---

## Performance Optimization

### Viewport Culling

**Only render visible items:**
- Calculate visible world rectangle from camera and canvas size
- Skip rendering for objects completely outside view
- Use spatial data structures for efficient queries

### Render Scheduling

**On-demand rendering:**
- Only redraw when something changes (camera, data, hover state)
- Use `requestAnimationFrame` to batch multiple changes
- Avoid rendering on every React re-render

**Change detection:**
- Track "dirty" flags for different types of changes
- Separate camera changes from data changes
- Use `useCallback` and `useMemo` to prevent unnecessary re-renders

### Canvas Optimization

**Drawing efficiency:**
- Batch similar operations together
- Avoid frequent save/restore calls
- Use integer coordinates when possible for crisp pixels
- Cache complex paths or use Path2D objects

---

## High Refresh Rate Rendering

### Adaptive Frame Rate

**Heat-based rendering:**
- Run continuous loop during active interactions
- Gradually reduce frame rate when idle
- Target 120Hz on supporting displays, fallback to 60Hz

**Interaction detection:**
- Boost frame rate during pan/zoom operations
- Maintain high refresh for hover effects
- Return to idle after interaction timeout

### Performance Monitoring

**Frame rate tracking:**
- Count frames over time intervals
- Display FPS counter for development
- Monitor for frame drops during complex operations

---

## Canvas Context Optimization

### Context Creation Options

**Low-latency contexts:**
- `{ desynchronized: true }` for reduced input lag
- `{ alpha: false }` when transparency not needed
- `{ willReadFrequently: false }` for write-only contexts

**Context reuse:**
- Cache context reference to avoid repeated `getContext()` calls
- Initialize context once during setup
- Store context in React ref or module scope

### Rendering Pipeline

**Efficient drawing order:**
1. Clear canvas
2. Set up camera transform
3. Draw background/grid
4. Cull invisible objects
5. Draw visible objects in z-order
6. Update HTML overlays

---

## Memory Management

### Object Pooling

**For frequently created objects:**
- Pool coordinate objects, bounds rectangles
- Reuse arrays for calculations
- Avoid creating new objects in render loops

### Event Listener Cleanup

**Prevent memory leaks:**
- Remove event listeners in useEffect cleanup
- Use AbortController for modern cleanup patterns
- Properly dispose of ResizeObserver instances

### Canvas Memory

**Large canvas considerations:**
- Canvas memory usage = width × height × 4 bytes
- Consider multiple smaller canvases for very large views
- Clear unused contexts when switching between views

---

## Common Pitfalls & Solutions

### Device Pixel Ratio Issues

**Problem**: Blurry canvas on high-DPI displays
**Solution**: Always multiply canvas dimensions by devicePixelRatio, but clamp to reasonable values (1-3) to avoid excessive memory usage

### Coordinate System Confusion

**Problem**: Events don't align with drawn objects
**Solution**: Always convert between coordinate systems consistently. Use helper functions for world↔screen conversion

### Event Handler Memory Leaks

**Problem**: Event listeners not cleaned up properly
**Solution**: Store handler references and remove them in cleanup functions

### Transform Matrix Corruption

**Problem**: Canvas transform gets out of sync
**Solution**: Always reset transform with `setTransform(1, 0, 0, 1, 0, 0)` before each frame, then apply camera transform

### Unnecessary Re-renders

**Problem**: Canvas redraws on every React render
**Solution**: Use refs for values that change frequently, schedule drawing with requestAnimationFrame

### Poor Zoom Performance

**Problem**: Lag during zoom operations
**Solution**: Implement proper viewport culling and consider reducing drawing detail at extreme zoom levels

### Text Rendering Issues

**Problem**: Text looks different from HTML text
**Solution**: Use system font stacks and match CSS font properties exactly

### Touch/Mobile Issues

**Problem**: Touch interactions don't work properly
**Solution**: Use pointer events instead of mouse events, handle touch-specific behaviors

---

## Development Workflow Tips

### Debugging Tools

**Visual debugging:**
- Draw bounding boxes around objects
- Show coordinate system grid
- Display frame rate and performance metrics
- Add console logging for coordinate transformations

### Progressive Enhancement

**Development approach:**
1. Start with basic canvas rendering
2. Add camera/viewport system
3. Implement interaction handling
4. Add HTML overlays for complex UI
5. Optimize for performance
6. Add high refresh rate support

### Testing Strategy

**Test different scenarios:**
- Various zoom levels and camera positions
- Different screen sizes and device pixel ratios
- Touch vs mouse interactions
- Performance with large datasets
- Browser compatibility (Canvas2D is well-supported)

---

## Conclusion

The Canvas + HTML overlay approach provides the best of both worlds: high-performance custom rendering with familiar HTML UI components. The key is understanding when to use each technology and how to coordinate between them effectively.

Focus on getting the coordinate system and event handling right first - everything else builds on that foundation. Start simple and add optimizations as needed based on actual performance requirements.
