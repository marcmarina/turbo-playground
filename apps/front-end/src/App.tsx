import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useWebSocket } from './use-web-socket';

function App() {
  const { messages } = useWebSocket('https://turbo.backend.marcmarina.com');

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div>
        {messages.map((m, i) => {
          return <div key={i}>{JSON.stringify(m)}</div>;
        })}
      </div>
    </>
  );
}

export default App;
