import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function useSrapperContext(){
    return useContext(AppContext)
}

export function AppWrapper({ children }) {
  const [links, setLinks] = useState()

  const value ={
      setLinks,
      links
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}