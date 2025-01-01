async function useFetch(url, ref) {
  // to be modified (url=[url, filePath], returnType=[json, text])
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const results = await response.json();
    return ref ? results[ref] : results;
  } catch (error) {
    return error.message;
  }
}

export default useFetch;