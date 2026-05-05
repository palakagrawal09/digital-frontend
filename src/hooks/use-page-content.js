export const usePageContent = () => {
    const get = (section, key, fallback) => fallback;
  
    const getJSON = (section, key, fallback) => fallback;
  
    return { get, getJSON };
  };