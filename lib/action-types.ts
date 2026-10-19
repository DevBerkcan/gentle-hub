export type FieldErrors = Record<string, string>;

export type ActionFailure = {
  ok: false;
  error: string;
  errors?: FieldErrors;
};

export type ActionSuccess<T extends object = object> = { ok: true } & T;

export type ActionResult<T extends object = object> = ActionSuccess<T> | ActionFailure;

export type LoginState = { error?: string } | null;
