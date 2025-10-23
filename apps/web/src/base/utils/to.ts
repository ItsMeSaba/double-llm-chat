// export async function to<T>(
//   fn: () => Promise<T>
// ): Promise<[T, null] | [null, unknown]> {
//   try {
//     const result = await fn(); // run only when needed
//     return [result, null];
//   } catch (err) {
//     return [null, err];
//   }
// }

type Ok<T> = { ok: true; data: T };
type Err<E> = { ok: false; error: E };
type Result<T, E = unknown> = Ok<T> | Err<E>;

export async function to<T, E = unknown>(
  fn: () => Promise<T> | T
): Promise<Result<T, E>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: e as E };
  }
}
