import { createContext, useContext } from 'react';

// Context for the main-screen session state + global action sheets.
// The provider lives in MainActions.jsx; screens consume via useMainActions().
export const MainActionsContext = createContext(null);

export const useMainActions = () => useContext(MainActionsContext);
