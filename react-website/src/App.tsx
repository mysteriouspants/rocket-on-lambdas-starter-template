import logo from './logo.svg';
import './App.css';

function App() {
  fetch("https://api.pax-imperia.com/latest/hello/xpm", {
    credentials: 'include'
  }).then(response => {
    return response.text();
  }).then(text => {
    console.log(text);
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
