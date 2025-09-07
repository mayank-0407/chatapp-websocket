export const getSession = (item: string) => {
  const sessionData = sessionStorage.getItem(item);
  return sessionData;
};

export const setSession = (item: string, data: string) => {
  sessionStorage.setItem(item, data);
};
