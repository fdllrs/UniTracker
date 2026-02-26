import { useState, useEffect } from 'react';
import '../PreferencesModal/PreferencesModal.css'; // Reusing existing modal CSS
import './ImportPlanModal.css';

export default function ImportPlanModal({ open, onClose, onImport }) {
    const [jsonStr, setJsonStr] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) {
            setJsonStr('');
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const formatText = `{
  "plan": "Nombre del plan",
  "subtitle": "Subtítulo (Opcional)",
  "years": [
    {
      "year": 1,
      "label": "Primer Año",
      "semesters": [
        {
          "semester": 1,
          "courses": [
            {
              "id": "mat-1",
              "name": "Matemática",
              "dependencies": [],
              "weeklyHours": 4
            }
          ]
        }
      ]
    }
  ]
}`;

    const handleImport = () => {
        try {
            const obj = JSON.parse(jsonStr);
            if (!obj.plan || !obj.years) {
                throw new Error("El JSON no tiene el formato correcto (requiere 'plan' y 'years').");
            }
            onImport(obj);
            onClose();
        } catch (e) {
            setError(e.message || 'Error al procesar el JSON');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target.result;
            if (file.name.endsWith('.js') || file.name.endsWith('.json')) {
                let jsonContent = result;
                if (file.name.endsWith('.js')) {
                    const match = result.match(/export default (\{[\s\S]*?\});?/);
                    if (match && match[1]) {
                        jsonContent = match[1];
                        try {
                            const fixedJson = jsonContent
                                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
                                .replace(/'/g, '"');
                            JSON.parse(fixedJson);
                            jsonContent = fixedJson;
                        } catch (err) {
                            console.log("Error trying to auto-fix JS to JSON syntax", err);
                        }
                    } else {
                        const constMatch = result.match(/const [a-zA-Z0-9_]+ = (\{[\s\S]*?\});/);
                        if (constMatch && constMatch[1]) {
                            jsonContent = constMatch[1];
                            try {
                                const fixedJson = jsonContent
                                    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
                                    .replace(/'/g, '"');
                                JSON.parse(fixedJson);
                                jsonContent = fixedJson;
                            } catch (err) {
                                console.log("Error trying to auto-fix JS to JSON syntax", err);
                            }
                        }
                    }
                }
                setJsonStr(jsonContent);
                setError(null);
            } else {
                setError("El archivo debe ser .json");
            }
        };
        reader.onerror = () => {
            setError("Error leyendo el archivo.");
        };
        reader.readAsText(file);
    };

    if (!open) return null;

    return (
        <div className="prefs-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="prefs-modal import-modal">
                <button className="prefs-modal__close" onClick={onClose}>✕</button>
                <h2 className="prefs-modal__title">Importar Plan JSON</h2>

                <p className="import-modal__text">
                    Pegá tu plan de estudios en formato JSON o cargá un archivo estructurado:
                </p>

                <textarea
                    autoFocus
                    className={`prefs-modal__input import-modal__textarea ${jsonStr ? 'import-modal__textarea--filled' : 'import-modal__textarea--empty'}`}
                    placeholder={formatText}
                    value={jsonStr}
                    onChange={(e) => setJsonStr(e.target.value)}
                />

                {error && <div className="import-modal__error">{error}</div>}

                <div className="prefs-modal__actions import-modal__actions-container">
                    <div>
                        <input
                            type="file"
                            accept=".json,.js"
                            id="plan-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        <label
                            htmlFor="plan-upload"
                            className="prefs-modal__btn prefs-modal__btn--ghost import-modal__upload-btn"
                        >
                            + Seleccionar Archivo
                        </label>
                    </div>

                    <div className="import-modal__buttons">
                        <button
                            className="prefs-modal__btn prefs-modal__btn--secondary"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            className="prefs-modal__btn prefs-modal__btn--primary"
                            onClick={handleImport}
                            disabled={!jsonStr.trim()}
                        >
                            Importar Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
