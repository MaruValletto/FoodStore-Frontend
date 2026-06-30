export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error al cargar ${url}`);
  return response.json();
};
// En la iteracion siguiente, reemplazar la URL base:
// const BASE_URL = '/api'; y usar fetch(`${BASE_URL}/categorias`) etc.
