import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { dbFirestore } from '../lib/firebase';

interface DataContextType {
  customers: any[];
  loans: any[];
  payments: any[];
  isDataLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const unsubCustomers = onSnapshot(collection(dbFirestore, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubLoans = onSnapshot(collection(dbFirestore, 'loans'), (snapshot) => {
      setLoans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubPayments = onSnapshot(collection(dbFirestore, 'payments'), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsDataLoading(false);
    });

    return () => {
      unsubCustomers();
      unsubLoans();
      unsubPayments();
    };
  }, []);

  return (
    <DataContext.Provider value={{ customers, loans, payments, isDataLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
