import './Home.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ClassList, classLists } from './types/ClassList.type';

function Home() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[] | null>([]);
  const classMap = new Map(
    classLists.map((classList) => [
      classList.class,
      classList.specs.map((spec) => spec.specID),
    ]),
  );

  const handleKeyClick = (key: string) => {
    setSelectedKey(key);
    setSelectedValues(classMap.get(key) || []);
  };

  const navigate = useNavigate();

  const handleValueClick = (value: string): void => {
    navigate(`/talentEditor/${value}/${value}`);
  };

  const handleRightClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    key: string,
  ): void => {
    event.preventDefault();
    navigate(`/designer?class=${key}&spec=class`);
  };

  return (
    <div className="homediv">
      <h2>Select Class</h2>
      {/* <div className="talentSelector">
        {Array.from(classMap.keys()).map((key) => (
          <button
            key={key}
            onClick={() => handleKeyClick(key)}
            className={`classButton ${selectedKey === key ? 'selected' : ''}`}
            onContextMenu={(event) => handleRightClick(event, key)}
          >
            {key}
          </button>
        ))}
      </div>
      <h2>Select Spec</h2>
      <div className="specSelector">
        {selectedValues &&
          selectedValues.map((value) => (
            <button
              key={value}
              className="specbutton"
              onClick={() => handleValueClick(value)}
            >
              {value}
            </button>
          ))}
      </div> */}
    </div>
  );
}

export default Home;
