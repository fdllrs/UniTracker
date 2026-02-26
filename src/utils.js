function prunePlanDependencies(planObject) {
    // 1. Create a deep copy to avoid mutating the original input if desired
    const plan = JSON.parse(JSON.stringify(planObject));

    // 2. Flatten all courses into a Map for O(1) lookup
    const allCourses = plan.years.flatMap(y =>
        y.semesters.flatMap(s => s.courses)
    );
    const courseMap = new Map(allCourses.map(c => [c.id, c]));

    // 3. Helper to get ALL transitive dependencies of a course (memoized)
    const transitiveCache = new Map();

    function getTransitiveDeps(courseId) {
        if (transitiveCache.has(courseId)) return transitiveCache.get(courseId);

        const course = courseMap.get(courseId);
        if (!course) return new Set();

        const allDeps = new Set();
        course.dependencies.forEach(depId => {
            allDeps.add(depId);
            // Recursively get dependencies of dependencies
            const subDeps = getTransitiveDeps(depId);
            subDeps.forEach(id => allDeps.add(id));
        });

        transitiveCache.set(courseId, allDeps);
        return allDeps;
    }

    // 4. Process each course and filter its dependency array
    allCourses.forEach(course => {
        const directDeps = [...course.dependencies];

        course.dependencies = directDeps.filter(depId => {
            // We keep depId ONLY if it is NOT a dependency of any 
            // OTHER course in the direct dependencies list.
            const isRedundant = directDeps.some(otherDepId => {
                if (depId === otherDepId) return false;
                const ancestorsOfOther = getTransitiveDeps(otherDepId);
                return ancestorsOfOther.has(depId);
            });

            return !isRedundant;
        });
    });

    return plan;
}
