
let _fresh = 0;

export function fresh(): string {
    return `z${_fresh++}`;
}

export function resetFresh() {
    _fresh = 0;
}