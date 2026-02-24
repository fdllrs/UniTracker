const PLAN_MECANICA = {
    plan: "Plan de Estudios",
    subtitle: "Ingeniería Mecánica",
    years: [
        {
            year: 1,
            label: "Nivel I",
            semesters: [
                {
                    semester: "Anual",
                    label: "Materias",
                    courses: [
                        { id: "1", name: "Análisis Matemático I", dependencies: [], weeklyHours: 0 },
                        { id: "2", name: "Química General", dependencies: [], weeklyHours: 0 },
                        { id: "3", name: "Algebra y Geometría Analítica", dependencies: [], weeklyHours: 0 },
                        { id: "4", name: "Física I", dependencies: [], weeklyHours: 0 },
                        { id: "5", name: "Ingeniería y Sociedad", dependencies: [], weeklyHours: 0 },
                        { id: "6", name: "Ingeniería Mecánica I (Int)", dependencies: [], weeklyHours: 0 },
                        { id: "7", name: "Sistemas de Representación", dependencies: [], weeklyHours: 0 },
                        { id: "8", name: "Fundamentos de Informática", dependencies: [], weeklyHours: 0 }
                    ]
                }
            ]
        },
        {
            year: 2,
            label: "Nivel II",
            semesters: [
                {
                    semester: "Anual",
                    label: "Materias",
                    courses: [
                        { id: "9", name: "Materiales No Metálicos", dependencies: ["2", "4"], weeklyHours: 0 },
                        { id: "10", name: "Estabilidad I", dependencies: ["1", "3", "4"], weeklyHours: 0 },
                        { id: "11", name: "Materiales Metálicos", dependencies: ["2", "4"], weeklyHours: 0 },
                        { id: "12", name: "Análisis Matemático II", dependencies: ["1", "3"], weeklyHours: 0 },
                        { id: "13", name: "Física II", dependencies: ["1", "4"], weeklyHours: 0 },
                        { id: "14", name: "Ingeniería Ambiental y Seguridad Industrial", dependencies: ["2", "4"], weeklyHours: 0 },
                        { id: "15", name: "Ingeniería Mecánica II (Int.)", dependencies: ["4", "6"], weeklyHours: 0 },
                        { id: "16", name: "Inglés I", dependencies: [], weeklyHours: 0 }
                    ]
                }
            ]
        },
        {
            year: 3,
            label: "Nivel III",
            semesters: [
                {
                    semester: "Anual",
                    label: "Materias",
                    courses: [
                        { id: "17", name: "Termodinámica", dependencies: ["12", "13", "1", "3", "4"], weeklyHours: 0 },
                        { id: "18", name: "Mecánica Racional", dependencies: ["10", "12", "1", "3", "4"], weeklyHours: 0 },
                        { id: "19", name: "Estabilidad II", dependencies: ["10", "12", "1", "3", "4"], weeklyHours: 0 },
                        { id: "20", name: "Mediciones y Ensayos", dependencies: ["10", "11", "13", "1", "4"], weeklyHours: 0 },
                        { id: "21", name: "Diseño Mecánico", dependencies: ["9", "10", "11", "4", "6", "7", "8"], weeklyHours: 0 },
                        { id: "22", name: "Cálculo Avanzado", dependencies: ["12", "1", "3", "8"], weeklyHours: 0 },
                        { id: "23", name: "Ingeniería Mecánica III (Int)", dependencies: ["9", "11", "15", "1", "2", "4", "6"], weeklyHours: 0 },
                        { id: "24", name: "Probabilidad y Estadística", dependencies: ["1", "3"], weeklyHours: 0 },
                        { id: "25", name: "Inglés II", dependencies: ["16"], weeklyHours: 0 }
                    ]
                }
            ]
        },
        {
            year: 4,
            label: "Nivel IV",
            semesters: [
                {
                    semester: "Anual",
                    label: "Materias",
                    courses: [
                        { id: "26", name: "Economía", dependencies: ["15", "5"], weeklyHours: 0 },
                        { id: "27", name: "Elementos de Máquinas (Int)", dependencies: ["9", "11", "18", "19", "23", "2", "10", "12"], weeklyHours: 0 },
                        { id: "28", name: "Tecnología del Calor", dependencies: ["17", "12", "13"], weeklyHours: 0 },
                        { id: "29", name: "Metrología e Ingeniería de Calidad", dependencies: ["20", "24", "3", "11", "13"], weeklyHours: 0 },
                        { id: "30", name: "Mecánica de los Fluidos", dependencies: ["17", "12", "13"], weeklyHours: 0 },
                        { id: "31", name: "Electrotecnia y Máquinas Eléctricas", dependencies: ["12", "13", "1", "3", "4"], weeklyHours: 0 },
                        { id: "32", name: "Electrónica y Sistemas de Control", dependencies: ["12", "13", "22", "1", "3", "4"], weeklyHours: 0 },
                        { id: "33", name: "Estabilidad III", dependencies: ["19", "1", "3", "4", "10"], weeklyHours: 0 }
                    ]
                }
            ]
        },
        {
            year: 5,
            label: "Nivel V",
            semesters: [
                {
                    semester: "Anual",
                    label: "Materias",
                    courses: [
                        { id: "34", name: "Tecnología de Fabricación", dependencies: ["27", "29", "9", "10", "11", "21"], weeklyHours: 0 },
                        { id: "35", name: "Máquinas Alternativas y Turbomáquinas", dependencies: ["28", "13", "17"], weeklyHours: 0 },
                        { id: "36", name: "Instalaciones Industriales", dependencies: ["20", "28", "30", "31", "32", "10", "14", "17"], weeklyHours: 0 },
                        { id: "37", name: "Organización Industrial", dependencies: ["26", "15"], weeklyHours: 0 },
                        { id: "38", name: "Legislación", dependencies: ["15", "5"], weeklyHours: 0 },
                        { id: "39", name: "Mantenimiento", dependencies: ["20", "26", "27", "11", "13", "18", "19"], weeklyHours: 0 },
                        { id: "40", name: "Proyecto Final (Int)", dependencies: ["27", "29", "31", "32", "18", "19", "20", "21"], weeklyHours: 0 }
                    ]
                }
            ]
        }
    ]
};

export default PLAN_MECANICA;