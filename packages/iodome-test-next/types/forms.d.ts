type FormAction = (
  formData: FormData,
) => string | Promise<void | { error?: string; success?: boolean }>;
