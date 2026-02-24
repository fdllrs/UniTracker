import './ArrowsOverlay.css';

/**
 * Renders the dashed arrow that follows the cursor while
 * dragging to create/remove a dependency link between cards.
 */
export default function DragArrow({ dragging, containerRef }) {
    if (!dragging || !containerRef.current) return null;

    const gc = containerRef.current;
    const gcRect = gc.getBoundingClientRect();

    const sourceEl = document.getElementById(`card-${dragging.sourceId}`);
    if (!sourceEl) return null;

    const srcRect = sourceEl.getBoundingClientRect();
    const x1 = srcRect.left + srcRect.width / 2 - gcRect.left + gc.scrollLeft;
    const y1 = srcRect.bottom - gcRect.top + gc.scrollTop;

    let x2, y2;

    if (dragging.snapTarget) {
        const targetEl = document.getElementById(`card-${dragging.snapTarget}`);
        if (targetEl) {
            const tgtRect = targetEl.getBoundingClientRect();
            x2 = tgtRect.left + tgtRect.width / 2 - gcRect.left + gc.scrollLeft;
            y2 = tgtRect.top - gcRect.top + gc.scrollTop;
        }
    }

    if (x2 === undefined) {
        x2 = dragging.mouseX - gcRect.left + gc.scrollLeft;
        y2 = dragging.mouseY - gcRect.top + gc.scrollTop;
    }

    const midY = (y1 + y2) / 2;
    const d = Math.abs(x1 - x2) < 3
        ? `M ${x1} ${y1} L ${x2} ${y2}`
        : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;

    return (
        <svg
            className="arrows-svg drag-arrow-svg"
            style={{ zIndex: 50 }}
            width={gc.scrollWidth}
            height={gc.scrollHeight}
        >
            <defs>
                <marker id="ah-drag" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L8,3 z" fill="#f6a623" />
                </marker>
            </defs>
            <path
                d={d}
                fill="none"
                stroke="#f6a623"
                strokeWidth="2.5"
                strokeDasharray={dragging.snapTarget ? 'none' : '6,4'}
                markerEnd="url(#ah-drag)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(246,166,35,0.4))' }}
            />
        </svg>
    );
}
