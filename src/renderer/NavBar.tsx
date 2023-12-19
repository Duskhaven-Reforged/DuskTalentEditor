import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import path from 'path';
import deathknight from '../../assets/classes/classicon_deathknight.png';
import demonhunter from '../../assets/classes/classicon_demonhunter.png';
import druid from '../../assets/classes/classicon_druid.png';
import hunter from '../../assets/classes/classicon_hunter.png';
import mage from '../../assets/classes/classicon_mage.png';
import paladin from '../../assets/classes/classicon_paladin.png';
import priest from '../../assets/classes/classicon_priest.png';
import rogue from '../../assets/classes/classicon_rogue.png';
import shaman from '../../assets/classes/classicon_shaman.png';
import warlock from '../../assets/classes/classicon_warlock.png';
import warrior from '../../assets/classes/classicon_warrior.png';
import bard from '../../assets/classes/classicon_bard.png';
import monk from '../../assets/classes/classicon_monk.png';
import tinker from '../../assets/classes/classicon_tinker.png';
import { classLists } from './types/ClassList.type';

const images = {
  deathknight,
  demonhunter,
  druid,
  hunter,
  mage,
  paladin,
  priest,
  rogue,
  shaman,
  warlock,
  warrior,
  bard,
  monk,
  tinker,
};

function NavBar() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<
    { specID: string; name: string }[] | null
  >([]);
  const classMap = new Map(
    classLists.map((classList) => [
      classList.class,
      classList.specs.map((spec) => ({ specID: spec.specID, name: spec.name })),
    ]),
  );
  const navigate = useNavigate();

  const handleKeyClick = (key: string) => {
    if (key === selectedKey) {
      setSelectedKey('');
    } else {
      setSelectedKey(key);
      setSelectedValues(classMap.get(key) || []);
    }
  };
  const handleValueClick = (value: { specID: string; name: string }): void => {
    console.log('NAVIGATE VALUE CLICK');
    navigate(`/talentEditor/${value.specID}`);
  };

  return (
    <div className="navbar">
      {Array.from(classMap.keys()).map((key) => (
        <div
          key={key}
          className="navbar-item"
          onClick={() => handleKeyClick(key)}
        >
          <img src={images[key as keyof typeof images]} />
          {selectedKey === key && (
            <div className="navbar-sub-items">
              {selectedValues &&
                selectedValues.map((value) => (
                  <button
                    key={value.specID}
                    className="navbar-sub-item"
                    onClick={() => handleValueClick(value)}
                  >
                    {value.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default NavBar;
