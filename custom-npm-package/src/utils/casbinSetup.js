import React, { useEffect, useState } from 'react';
import { Authorizer } from 'casbin.js';
import permissions from '../components/permission.json';
import Component1 from '../components/component1';
import Component2 from '../components/component2';

const components = [
  { component: Component1, permission: 'component1' },
  { component: Component2, permission: 'component2' },
  // Add more components here 
];

const CasbinDemo = ({ user }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const authorizer = new Authorizer("manual");
    authorizer.setPermission(permissions[user]);
    setAuth(authorizer);
  }, [user]);

  if (!auth) {
    return null;
  }

  return (
    <div>
      {components.map(({ component: Component, permission }) => (
        auth.permission.check('read', permission) && <Component key={permission} />
      ))}
    </div>
  );
};

export default CasbinDemo;
