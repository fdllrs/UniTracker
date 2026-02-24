import { useEffect, useRef, useCallback } from 'react';
import { STATUS_COLORS } from '../hooks/useStudyPlan';
import './ArrowsOverlay.css';

export default function ArrowsOverlay({
    allCourses,
    getEffectiveStatus,
    getSemesterIndex,
    highlightedCourse,
    activeCards,
    containerRef,
    editMode,
}) {
    const svgRef = useRef(null);

    const drawArrows = useCallback(() => {
        const svg = svgRef.current;
        const gc = containerRef.current;
        if (!svg || !gc) return;

        // Compute scale factor from container's CSS transform
        const cRect = gc.getBoundingClientRect();
        const scaleX = cRect.width / gc.offsetWidth || 1;
        const scaleY = cRect.height / gc.offsetHeight || 1;

        svg.setAttribute('width', gc.scrollWidth);
        svg.setAttribute('height', gc.scrollHeight);

        // Clear
        svg.querySelectorAll('.arrow-group').forEach((g) => g.remove());
        svg.querySelectorAll('marker').forEach((m) => m.remove());

        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.prepend(defs);
        }

        // Per-status arrowhead markers (normal and highlighted)
        for (const [status, color] of Object.entries(STATUS_COLORS)) {
            const createMarker = (idSuffix, fillColor) => {
                const m = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                m.setAttribute('id', `ah-${status}${idSuffix}`);
                m.setAttribute('markerWidth', '8');
                m.setAttribute('markerHeight', '6');
                m.setAttribute('refX', '7');
                m.setAttribute('refY', '3');
                m.setAttribute('orient', 'auto');
                m.setAttribute('markerUnits', 'strokeWidth');
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                p.setAttribute('d', 'M0,0 L0,6 L8,3 z');
                p.setAttribute('fill', fillColor);
                m.appendChild(p);
                defs.appendChild(m);
            };

            createMarker('', color);
            createMarker('-hi', color.slice(0, 7)); // Fully opaque for highlighted arrows
        }

        // Card rects — compensate for scale transform
        const cards = {};
        for (const c of allCourses) {
            const el = document.getElementById(`card-${c.id}`);
            if (!el) continue;
            const r = el.getBoundingClientRect();
            cards[c.id] = {
                l: (r.left - cRect.left) / scaleX + gc.scrollLeft,
                r: (r.right - cRect.left) / scaleX + gc.scrollLeft,
                t: (r.top - cRect.top) / scaleY + gc.scrollTop,
                b: (r.bottom - cRect.top) / scaleY + gc.scrollTop,
                cx: ((r.left + r.right) / 2 - cRect.left) / scaleX + gc.scrollLeft,
                w: r.width / scaleX,
            };
        }

        // Row rects — compensate for scale transform
        const rowEls = gc.querySelectorAll('.semester-row');
        const rows = Array.from(rowEls).map((el) => {
            const r = el.getBoundingClientRect();
            return {
                t: (r.top - cRect.top) / scaleY + gc.scrollTop,
                b: (r.bottom - cRect.top) / scaleY + gc.scrollTop,
            };
        });

        // Arrow list
        const arrows = [];
        for (const c of allCourses) {
            for (const depId of c.dependencies) {
                if (cards[depId] && cards[c.id]) {
                    arrows.push({ from: depId, to: c.id });
                }
            }
        }
        if (arrows.length === 0) return;

        // Sort outgoing/incoming by target/source cx
        const outgoing = {};
        const incoming = {};
        arrows.forEach((a, i) => {
            (outgoing[a.from] ??= []).push(i);
            (incoming[a.to] ??= []).push(i);
        });
        for (const id in outgoing) outgoing[id].sort((a, b) => cards[arrows[a].to].cx - cards[arrows[b].to].cx);
        for (const id in incoming) incoming[id].sort((a, b) => cards[arrows[a].from].cx - cards[arrows[b].from].cx);

        // Spread exit/entry points across card edges
        const EDGE_PAD = 25;
        const exitPt = new Array(arrows.length);
        const entryPt = new Array(arrows.length);

        function spreadPoints(idxList, cardId, isBottom) {
            const c = cards[cardId];
            const n = idxList.length;
            const usable = c.w - 2 * EDGE_PAD;
            const y = isBottom ? c.b : c.t;
            idxList.forEach((ai, i) => {
                const x = n === 1 ? c.cx : c.l + EDGE_PAD + (usable * i) / (n - 1);
                if (isBottom) exitPt[ai] = { x, y };
                else entryPt[ai] = { x, y };
            });
        }

        for (const id in outgoing) spreadPoints(outgoing[id], id, true);
        for (const id in incoming) spreadPoints(incoming[id], id, false);

        function gapBetween(rowIdxA, rowIdxB) {
            if (rowIdxA < 0 || rowIdxB >= rows.length) return null;
            return { top: rows[rowIdxA].b, bot: rows[rowIdxB].t, mid: (rows[rowIdxA].b + rows[rowIdxB].t) / 2 };
        }

        const allCards = Object.values(cards);
        const globalLeft = Math.min(...allCards.map((c) => c.l));
        const globalRight = Math.max(...allCards.map((c) => c.r));

        // Route and draw
        const arrowsData = arrows.map((arrow, idx) => {
            const ex = exitPt[idx];
            const en = entryPt[idx];
            if (!ex || !en) return;

            const srcRow = getSemesterIndex(arrow.from);
            const tgtRow = getSemesterIndex(arrow.to);
            const rowSpan = tgtRow - srcRow;

            const status = getEffectiveStatus(arrow.from);
            const color = STATUS_COLORS[status] || STATUS_COLORS.pendiente;
            const isHighlighted = highlightedCourse && (arrow.from === highlightedCourse || arrow.to === highlightedCourse);

            // Simple offset to prevent exact overlapping lines, without heavy lane reservation computations
            const offset = (idx % 6) * 5;
            let points;

            if (rowSpan === 1) {
                const gap = gapBetween(srcRow, tgtRow);
                const laneY = gap ? gap.mid + (offset - 12) : (ex.y + en.y) / 2;

                points = [
                    { x: ex.x, y: ex.y },
                    { x: ex.x, y: laneY },
                    { x: en.x, y: laneY },
                    { x: en.x, y: en.y },
                ];
            } else {
                const firstGap = gapBetween(srcRow, srcRow + 1);
                const lastGap = gapBetween(tgtRow - 1, tgtRow);
                const avgX = (ex.x + en.x) / 2;
                const mid = (globalLeft + globalRight) / 2;
                const useRight = avgX >= mid;

                const sideX = useRight ? globalRight + 15 + offset : globalLeft - 15 - offset;
                const hY1 = firstGap ? firstGap.mid + (offset - 12) : ex.y + 15 + offset;
                const hY2 = lastGap ? lastGap.mid - (offset - 12) : en.y - 15 - offset;

                points = [
                    { x: ex.x, y: ex.y },
                    { x: ex.x, y: hY1 },
                    { x: sideX, y: hY1 },
                    { x: sideX, y: hY2 },
                    { x: en.x, y: hY2 },
                    { x: en.x, y: en.y },
                ];
            }

            // Clean redundant points
            const clean = [points[0]];
            for (let i = 1; i < points.length; i++) {
                const prev = clean[clean.length - 1];
                if (Math.abs(prev.x - points[i].x) > 0.5 || Math.abs(prev.y - points[i].y) > 0.5) {
                    clean.push(points[i]);
                }
            }

            let d = `M ${clean[0].x} ${clean[0].y}`;
            for (let i = 1; i < clean.length; i++) d += ` L ${clean[i].x} ${clean[i].y}`;

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.classList.add('arrow-group');
            group.dataset.from = arrow.from;
            group.dataset.to = arrow.to;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', isHighlighted ? color.slice(0, 7) : color);
            path.setAttribute('stroke-width', isHighlighted ? '3' : '1.8');
            path.setAttribute('marker-end', `url(#ah-${status}${isHighlighted ? '-hi' : ''})`);
            path.classList.add('arrow-path');
            if (isHighlighted) {
                path.style.filter = 'drop-shadow(0 0 6px rgba(255,255,255,0.3))';
            } else if (highlightedCourse) {
                path.style.opacity = '0.15';
            }

            group.appendChild(path);
            return { group, isHighlighted };
        });

        // Append to DOM, placing highlighted arrows last so they are drawn on top
        arrowsData.forEach(data => {
            if (data && !data.isHighlighted) svg.appendChild(data.group);
        });
        arrowsData.forEach(data => {
            if (data && data.isHighlighted) svg.appendChild(data.group);
        });
    }, [allCourses, getEffectiveStatus, getSemesterIndex, highlightedCourse, activeCards, containerRef, editMode]);

    // Redraw on changes and after fonts
    useEffect(() => {
        // Double-rAF to let the DOM settle after React re-renders
        const draw = () => {
            requestAnimationFrame(() => requestAnimationFrame(drawArrows));
        };
        document.fonts.ready.then(draw);
        draw();

        // Schedule redraws for layout shifts and after transitions
        const layoutTimer = setTimeout(drawArrows, 100);
        // Redraw mid-transition for smoother arrow updates
        const midTransTimer = setTimeout(drawArrows, 350);
        // Redraw after edit-mode transitions finish (600ms animation)
        const transitionTimer = setTimeout(drawArrows, 650);

        const onResize = () => {
            clearTimeout(onResize._t);
            onResize._t = setTimeout(drawArrows, 150);
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('load', draw);
        return () => {
            clearTimeout(layoutTimer);
            clearTimeout(midTransTimer);
            clearTimeout(transitionTimer);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('load', draw);
        };
    }, [drawArrows]);

    return (
        <svg className="arrows-svg" ref={svgRef}>
            <defs />
        </svg>
    );
}
