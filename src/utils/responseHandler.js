export const responseHandler = (message, status, data, error) => {
  const success = status >= 200 && status < 300;

  if (error) return { success, status, message, error };
  if (data) return { success, status, message, data };
  return { success, status, message };
};

new Error(``);
