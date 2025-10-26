import React from 'react';
import { useAtom } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { currentPageAtom } from './store/atoms';
import HomePage from './components/HomePage';
import ResultPage from './components/ResultPage';
import DetailPage from './components/DetailPage';
import HistoryPage from './components/HistoryPage';
import SearchPage from './components/SearchPage';
import Test from './components/Test';

const App: React.FC = () => {
  const [currentPage] = useAtom(currentPageAtom);

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
