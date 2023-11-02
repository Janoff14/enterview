import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [step, setStep] = useState(1);
  const [videos, setVideos] = useState([])
  const [questions, setQuestions] = useState(["placeholder1", "placeholder2", "placeholder3"])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState("")

  // Define functions that modify globalState here

  
 

  const contextValue = {
    step,
    setStep,
    videos,
    setVideos,
    questions,
    setQuestions,
    loading,
    setLoading,
    results,
    setResults



    // Add your functions here
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
