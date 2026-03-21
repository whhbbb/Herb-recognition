import React from 'react';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { currentPageAtom } from './store/atoms';
import { loadHerbDatabaseFromApi } from './data/herbDatabase';
import HomePage from './components/HomePage';
import ResultPage from './components/ResultPage';
import DetailPage from './components/DetailPage';
import HistoryPage from './components/HistoryPage';
import SearchPage from './components/SearchPage';
import Test from './components/Test';

const App: React.FC = () => {
  const [currentPage] = useAtom(currentPageAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadHerbDatabaseFromApi();
      setReady(true);
    };
    void init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <p className="text-gray-600">正在加载草药数据...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'test':
        return <Test />
      case 'home':
        return <HomePage />;
      case 'result':
        return <ResultPage />;
      case 'detail':
        return <DetailPage />;
      case 'history':
        return <HistoryPage />;
      case 'search':
        return <SearchPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
    </div>
  );
};

export default App;
