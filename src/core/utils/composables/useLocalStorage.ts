import { ref } from "vue";

// Helper para armazenar dados no localStorage
const useLocalStorage = (key: string, initialValue: any = null) => {
  const storedValue = localStorage.getItem(key);
  const value = ref(storedValue ? JSON.parse(storedValue) : initialValue);

  const setItem = (newValue: any) => {
    value.value = newValue;
    if (newValue === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return { value, setItem };
};

export default useLocalStorage;
