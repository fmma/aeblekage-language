export interface Instatiable<T> {
    instantiate(): T
    symbolicate(): T
}