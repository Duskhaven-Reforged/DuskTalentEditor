import { useParams } from 'react-router-dom';
import './TalentEditor.css';
import { useEffect, useState } from 'react';
import { ForgeTalent } from './types/Forge_Talent.type';
import Modal from 'react-modal';
import TalentModal from './TalentModal';
import { Ranks } from './types/Ranks.type';
import NavBar from './NavBar';
import { Spells } from './types/Spells.type';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TalentEditor = () => {
  const { class: className } = useParams();
  const [talents, setTalents] = useState<ForgeTalent[]>([]);
  const [spells, setSpells] = useState<Spells>();
  const [updater, setUpdater] = useState(false);

  Modal.setAppElement('#root');

  async function getSpells() {
    window.electron.ipcRenderer.sendMessage(
      'customQuery',
      'SELECT id, SpellName0 FROM spell',
    );
  }

  function changeUpdater() {
    console.log('CHANGE UPDATER CALLED');
    setUpdater((prev) => !prev);
  }

  useEffect(() => {
    getSpells();
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.once('customQuery', (event, args) => {
      console.log('CAUGHT SPELLS');
      setSpells(event as Spells);
    });
  }, []);

  useEffect(() => {
    refreshTalents();
    loadTalents();
  }, [className]);

  function loadTalents() {
    console.log('LOAD TALENTS CALLED');
    window.electron.ipcRenderer.sendMessage(
      'query',
      `SELECT * FROM forge_talents WHERE talentTabId=${className}`,
    );
  }

  const findTalent = (row: number, column: number) => {
    return talents.find(
      (talent) => talent.rowIndex === row && talent.columnIndex === column,
    );
  };

  function refreshTalents() {
    console.log('REFRESH TALENTS CALLED');
    const handleQuery = (event: any, args: any) => {
      const tals: ForgeTalent[] = event as ForgeTalent[];
      console.log('REFRESHED TALENTS');
      setTalents(tals);
    };

    window.electron.ipcRenderer.once('query', handleQuery);
  }

  useEffect(() => {
    refreshTalents();
  }, []);

  useEffect(() => {
    console.log('UPDATER CHANGED');
    loadTalents();
    refreshTalents();
  }, [updater]);

  const renderTalent = (row: number, column: number) => {
    const talent = findTalent(row, column);

    return (
      <TalentModal
        forgeTalent={talent}
        setUpdater={setUpdater}
        spells={spells}
      />
    );
  };

  return (
    <div className="talentWrapper">
      {/* <NavBar /> */}
      <ToastContainer />
      <div className="talentCanvas">
        {Array.from({ length: 121 }).map((_, index) => {
          const row = Math.floor(index / 11);
          const column = index % 11;

          return (
            <div key={index} className="gridCell">
              {renderTalent(row, column)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TalentEditor;
