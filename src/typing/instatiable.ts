export interface Instatiable<T> {
    instantiate(): T
    instantiateArbitrary(): T
}