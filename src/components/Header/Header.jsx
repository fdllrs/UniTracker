import './Header.css';

export default function Header({ studyPlan, stats, editMode, editTransition, showHours = true, showGrades = true }) {
    const pctAprobada = stats.total > 0 ? (stats.aprobada / stats.total) * 100 : 0;
    const pctRegular = stats.total > 0 ? ((stats.regular - stats.aprobada) / stats.total) * 100 : 0;

    // Build header class for edit mode hide animation
    const headerClass = [
        'header',
        editMode && !editTransition ? 'header--hidden' : '',
        editTransition === 'entering' ? 'header--slide-out' : '',
        editTransition === 'exiting' ? 'header--slide-in' : '',
    ].filter(Boolean).join(' ');

    return (
        <header className={headerClass}>
            <h1 className="header__title">{studyPlan.plan || 'Study Plan'}</h1>
            <p className="header__subtitle">{studyPlan.subtitle || ''}</p>

            <div className="stats-bar">
                <div className="stat">
                    <span className="stat__value stat__value--aprobada">{stats.aprobada}</span> Aprobadas
                </div>
                <div className="stat">
                    <span className="stat__value stat__value--regular">{stats.regular}</span> Regulares
                </div>
                <div className="stat">
                    <span className="stat__value stat__value--cursar">{stats.cursar}</span> Puedo cursar
                </div>
                <div className="stat">
                    <span className="stat__value stat__value--pendiente">{stats.pendiente}</span> Pendientes
                </div>
                {showHours && (
                    <div className="stat stat--hours">
                        <svg className="stat__icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                        <span className="stat__value stat__value--hours">{stats.completedHours}</span>
                        <span className="stat__hours-total">/ {stats.totalHours} hs</span>
                    </div>
                )}
                {showGrades && (
                    <div className="stat stat--average">
                        <svg className="stat__icon" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" /></svg>
                        <span className="stat__value stat__value--average">{stats.average}</span>
                        <span className="stat__average-label">promedio</span>
                    </div>
                )}
            </div>

            <div className="progress-container">
                <div className="progress-bar">
                    <div className="progress-bar__segment progress-bar__segment--aprobada" style={{ width: `${pctAprobada}%` }} />
                    <div className="progress-bar__segment progress-bar__segment--regular" style={{ width: `${pctRegular}%` }} />
                </div>
                <div className="instructions" style={{ marginTop: '0.4rem' }}>{stats.pctComplete}% completado</div>
            </div>

        </header>
    );
}
