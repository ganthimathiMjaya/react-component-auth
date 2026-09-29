// Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Permission from '../assets/Permission.png';
import Repository from '../assets/Respository.png';
import Roles from '../assets/Roles.png';
import Users from '../assets/users.png';
import { Button } from 'devextreme-react/button';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <Button
            id="menuButton"
            icon="menu"
          /> : <Button
            id="menuButton"
            icon="menu"
          />}
        </span>
      </div>
      <ul className="sidebar-list">
        <li className="sidebar-item">
          <Link to="/repository" className="sidebar-link">
            <img src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAA3pJREFUeF7tncFtFVEMRW+KQNABEiwogA2rICgBqAApUAtB6SBQAgg2bKAEqAFCEaCHEin8JN9zbc/zm5n7pez8ru177JmfWfw5gD6lDhyUZldyCEDxEAiAABQ7UJxeGyAAxQ4Up9cGCECxA8XptQECUOxAcXptwAoAPAHQ/u4CeADgdnFPu+nZIftj1M/q7ZWLip0CeD6Y4ZsBYE3KKFzYIbP6YvVm2YBXAN6M4nDyJWN4AA8BfF2I+a1MdmKHB3AC4KUA5DjATkfL+gXAo5z0XVTYHoffgDMAt7pYl5NkdQC6TkgOg/9UrPqjKSngVPB5ZVYDHs1o08x5q35G67pYqn8qWAAmsaE8pYIFQAAmOWAE6RKU4WJAQwAC5mUcFYAMFwMaAhAwr8dRC5Dni8uNdXvEuhbYw/GdHF37E4CrhAWgYOovpxQAAdjvQNcJKYDRtT/dA3QPKJjxgTZ8hA2wVn5uQh4P0mryJLcMYzUtvbRmbxBi602tx5PcMozVtPRSG75GjK03tR5PcsswVtPSS21YAPhvHaMBsAaGGkAq+NyJ1AIAWHoCMPPDKgEgR8wyjN0qS48sjw7PrpfSo4JnugTRjhUfsAaG8pQKFoB/DgiANmC/A56tKvaUSr+6DbAaotxxBLMDY9VL6VHBM90DrIYcnlJHWA+seik9KlgA1nkTtiaKGmdHMDuEVr2UHhWsDdAGOAbcPMIOoTbAtJQLEADOr/TozQNId3RmwdVdgmb2K11eANIt5QQFgPMrPXp1AKyG0h3cEdz8TVgAyBGzDMueKLI8Ojy7XkqPCtajCD2KoMd7wgF2CFOvAGzy1k9qARP0JngYCmE9SO2fTS4AyQMoAMU/aTYCgND1o+Dw6i5BBR6GUgpAyL74YQGIexhSEICQffHDAhD3MKQgACH74ocFIO5hSKEcwM8B3xEQcjTx8C8Adxg9zz9inwAcMkk2FPsZwGOmXw+AYwBHTJINxb4F0H7af/LHA6C9ruTD5AzbCnwK4CPTsgdA01/Cq0sYHzJi3wF4wQp5AbQ81rcBtpalx7u8dB265NSSXmUyF+DXANp90fWJAmhJ2ytNngG4B+D+wt4t4DHtN4DvAH4AeA/gm0fk4kwGgEj+zZ8VgOIREAABKHagOL02QACKHShOrw0QgGIHitNrAwSg2IHi9NoAASh2oDj9X6lBpmF9bkETAAAAAElFTkSuQmCC' className="sidebar-icon" alt="Repository Icon" />
            {!isCollapsed && <span>Repository</span>}
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/permission" className="sidebar-link">
            <img src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAlBJREFUeF7tmctywkAMBOH/Pzq5kCIUVI1XI+2A6ZxXj+2WbKe4XviLErhGq1P8goDwECAAAWEC4fJsAALCBMLl2QAEhAmEy7MBCAgTCJdnAxCwncCPqLh1KLcW2476dUEEhEUgAAF3AjyCnqdhK5OtxcKT/1eeR1BYBAIQ4L0D1ASF+cpf+ab7X3qsLx2+kZ2+gCtQ3Wm6f1X/4X5LhxFwaDaWmC4dRgACjhBQQ8Uj6AhF4wwCDHgdoQjooGjkOL0Ag81bhKp3gBLYeomtxVo7rydDQJ1dSyQCWjDWkyCgzq4lEgEtGOtJEFBn1xKJgBaM9SRfL+CtANQ99kQm/g9AwD93COgZ5HIWBJTR9QQioIdjOQsCyuh6AhHQw7GcBQFldD2BFQHqM9LtTPU0XX+6/4f86rKvmpkGoHqaro8AQQAB7oiIeDYgPIEIQIC142qAeAlbeHUwAjSj0RPjAtzu1VfM0gXcZtLxicsigN8D0nN/r88GhF0gAAFPBBJDEdOQuCwvYV7CsYE/xbqfaoMSjyB3/BDgEjTjEWACdMMR4BI04xFgAnTDEeASNOMRYAJ0w79egALgAlafxtP1p/t/yK8u+6qZaQCqp+n6CBAEEOCOiIhnA8ITiAAEWDuuBoiXsIVXByNAMxo9MS5gtPsDydVX0BKAA/VGj3xUszcSCBgdCZ0cAZrR6AkEjOLVyRGgGY2eQMAoXp0cAZrR6AkEjOL9suSf+H/AqRQhIKwTAQgIEwiXZwMQECYQLs8GICBMIFyeDUBAmEC4PBsQFvALFTJgYXXikAwAAAAASUVORK5CYII=' className="sidebar-icon" alt="Permission Icon" />
            {!isCollapsed && <span>Permission</span>}
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/roles" className="sidebar-link">
            <img src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAupJREFUeF7tm1FyhCAQBc0hk0Mmh0yKqqViWSIDDD527Pxm19Fu3qCsfGz8SQl8SKtTfEOAeBAgAAFiAuLyJAABYgLi8iQAAWIC4vIkAAFiAuLyJAABYgLi8iQAAWIC4vIkAAFFAt+v/3yJGU0tv2oCEvzP15X/bNsWVsKKAvbw8+gLK2E1AWfwQ0tYScAV/LASVhFggR9SwgoCHgs/jSi1gEfDHxGQwI3eGj4efq+ADG7k1hD4rxmttQUdwfVIAP7u2bpFQAlciwTgHxY2rAJq4CwSasfYn5rleKU1mt+pizftB79kbBFgBXcFzXqMdHkj8NP3wwlIi2J5ZbLm/wzenfBDCkgX1SvhbvhhBfRIyN+ppcaj7exrhGtB+4trSYIFvDf80AnIQD0ljE64Z5JDJ8BTwgz4j0iAh4RZ8K1tb5nPWZ4Drk62px0Bv3MpoiSiRQLwO5ciapG1SAD+CcXRFmS9RQV+YQh7Cig9rAH/on94CzhKAH6lec8QkCWkeWH0Z8va3PP2/58l4O3B3HUBCLiL9E2TsPhy3q88CRA7W1kA+wOEg4P9AYvAz6cR9nlitRbE/oDFRv7xdMIlYZUEKN6eEI61/9IrCHgs/KRBLeDR8EcEsD/AqYH1JID9AU7wexLA/gBH+K0C2B/gDL9FQG2ytNyf146xvzzL8Uo4wr0ZZwXH/oDzITG8QcPyysnVmo1VYDrGyMjP5xAuAfk33p5NGnfDT+caUkCPhPwdy9TlMfJDJyBfXEs7soD3ajv7WmETMEOC58h/RAI8JcyAH3oOOLaUkXY0C7617S3zuZ61oP3J90gA/o7gqICeuyNeV3QWYJXAyD9pfB4JsEzMwC/MOp4CSkkA/sWU7y3gKAH4lfutGQKyBPYHGG52ZwkwlOYjiQACxOMAAQgQExCXJwEIEBMQlycBCBATEJcnAQgQExCXJwEIEBMQlycBCBATEJcnAQgQExCXJwEIEBMQlycBCBATEJf/A+HDnGHLDb7kAAAAAElFTkSuQmCC' className="sidebar-icon" alt="Roles Icon" />
            {!isCollapsed && <span>Roles</span>}
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/users" className="sidebar-link">
            <img src='data:image/jpeg;base64,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' className="sidebar-icon" alt="Users Icon" />
            {!isCollapsed && <span>Users</span>}
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/customerprojectMapping" className="sidebar-link">
            <img src='data:image/jpeg;base64,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' className="sidebar-icon" alt="Users Icon" />
            {!isCollapsed && <span>Users Customer Project Mapping</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
