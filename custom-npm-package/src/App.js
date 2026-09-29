import React, { useState } from 'react';
import CasbinDemo from './utils/casbinSetup';

const App = () => {
  const [user, setUser] = useState('kathir');

  const handleChange = (event) => {
    setUser(event.target.value);
  };

  return (
    <div>
      <form onSubmit={(event) => event.preventDefault()}>
        <label>
          <select value={user} onChange={handleChange}>
            <option value="ganthi">Ganthi</option>
            <option value="kathir">Kathir</option>
            <option value="admin">Administrator</option>
          </select>
        </label>
      </form>
      <CasbinDemo user={user}></CasbinDemo>
    </div>
  );
};

export default App;
