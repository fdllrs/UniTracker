import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement document.fonts
if (!document.fonts) {
    document.fonts = { ready: Promise.resolve() };
}

// Clear localStorage between tests
beforeEach(() => {
    localStorage.clear();
});
