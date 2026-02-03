export type Failure<T = Error> = { success: false; error: T };
export type Success<T = void> = { success: true; data: T };

export type Result<T = void, E = Error> = Success<T> | Failure<E>;
