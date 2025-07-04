import React from 'react';

type LoadingContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};
const LoadingContext = React.createContext<LoadingContextType>({ loading: false, setLoading: () => {} });

export default  LoadingContext;