// ==========================================
// 🧠 TACTICAL-SOLVER.JS - NEXUS Math Solver
// This was missing - now implemented
// ==========================================

/**
 * Solves basic algebra equations for NEXUS terminal
 * Supports: 3x + 5 = 20, 2x = 10, x + 5 = 12, etc
 */
window.solveTacticalEquation = function(equation) {
    try {
        equation = equation.trim().replace(/\s+/g, ' ');
        if (!equation.includes('=')) return null;
        
        let [left, right] = equation.split('=').map(s => s.trim());
        let rhs = parseFloat(right);
        if (isNaN(rhs)) return null;

        // Normalize: 3x, 3x + 5, x + 5, etc
        // Pattern: [coeff]x [+/- constant]
        left = left.replace(/\s/g, '');
        
        // Case 1: x + b = c  or  x - b = c
        let m = left.match(/^x([\+\-])(\d+(?:\.\d+)?)$/);
        if (m) {
            let op = m[1];
            let b = parseFloat(m[2]);
            return op === '+' ? rhs - b : rhs + b;
        }
        // Case 2: ax = c
        m = left.match(/^(-?\d*\.?\d*)x$/);
        if (m) {
            let coeff = m[1];
            if (coeff === '' || coeff === '+') coeff = 1;
            else if (coeff === '-') coeff = -1;
            else coeff = parseFloat(coeff);
            if (coeff === 0) return null;
            return rhs / coeff;
        }
        // Case 3: ax + b = c
        m = left.match(/^(-?\d*\.?\d*)x([\+\-])(\d+(?:\.\d+)?)$/);
        if (m) {
            let coeff = m[1];
            if (coeff === '' || coeff === '+') coeff = 1;
            else if (coeff === '-') coeff = -1;
            else coeff = parseFloat(coeff);
            let op = m[2];
            let b = parseFloat(m[3]);
            if (op === '-') b = -b;
            // ax + b = rhs => ax = rhs - b
            return (rhs - b) / coeff;
        }
        // Case 4: plain x = c
        if (left === 'x') return rhs;
        
        return null;
    } catch(e) {
        console.warn("Tactical solver error:", e);
        return null;
    }
};

// Auto-correct for NEXUS input (typo tolerance)
window.nexusAutoCorrect = function(input) {
    if (!input) return input;
    // Basic corrections
    return input.trim()
        .replace(/\s*\+\s*/g, ' + ')
        .replace(/\s*\-\s*/g, ' - ')
        .replace(/\s*\=\s*/g, ' = ')
        .replace(/\bX\b/g, 'x');
};

// Advanced battle math evaluator (used by training modal)
window.evaluateFlat = window.evaluateFlat || function(expr) {
    try {
        // Safe eval for math only
        if (/[^0-9x+\-*/().=\s]/.test(expr)) return null;
        return Function('"use strict"; return (' + expr.replace(/x/g, '*') + ')')();
    } catch(e) { return null; }
};

console.log("🧠 tactical-solver.js v1.0 loaded - NEXUS solver online");
