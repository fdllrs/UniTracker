/**
 * The translucent card clone that follows the cursor during a card reorder drag.
 */
export default function FloatingCard({ drag }) {
    if (!drag) return null;

    return (
        <div
            id="floating-move-card"
            className="floating-move-card"
            style={{
                left: drag.mouseX - drag.offsetX,
                top: drag.mouseY - drag.offsetY,
                width: drag.width,
            }}
        >
            <div className="floating-move-card__name">{drag.courseName}</div>
        </div>
    );
}
