import { useParams } from 'react-router-dom';
import './TalentEditor.css';
import {
  DragEvent,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { ForgeTalent } from './types/Forge_Talent.type';
import Modal from 'react-modal';
import TalentModal from './TalentModal';
import { Ranks } from './types/Ranks.type';
import NavBar from './NavBar';
import { Spells } from './types/Spells.type';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Ruler from './shared/Ruler';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TalentEditor = () => {
  const { class: className } = useParams();
  const [talents, setTalents] = useState<ForgeTalent[]>([]);
  const [spells, setSpells] = useState<Spells>();
  const [updater, setUpdater] = useState(false);

  const handleDragStart = (
    event: { dataTransfer: { setData: (arg0: string, arg1: string) => void } },
    row: any,
    column: any,
  ) => {
    event.dataTransfer.setData('text/plain', `${row},${column}`);
  };

  const handleDragOver = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    row: string | number,
    column: string | number,
  ) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain').split(',');
    const draggedRow = Number(data[0]) + 1;
    const draggedColumn = Number(data[1]);

    if (typeof row == 'number' && typeof column == 'number') {
      if (findTalent(row + 1, column + 1)) {
        console.log('FAILED');
      } else {
        const t = findTalent(draggedRow, draggedColumn);
        console.log('Spell ID: ' + t!.spellid);
        console.log('Row: ' + row);
        console.log('Column: ' + column);
        if (t) {
          dragSpell(t, { row: row + 1, column: column });
        }
      }
    }
  };

  function dragSpell(
    talent: ForgeTalent,
    target: { row: number; column: number },
  ) {
    window.electron.ipcRenderer.sendMessage(
      'updateQuery',
      `UPDATE forge_talents SET rowIndex=${target.row}, columnIndex=${target.column} WHERE spellid=${talent.spellid};`,
    );
  }

  useEffect(() => {
    const handleUpdateQuery = (event: any, args: any) => {
      console.log('Spell Drag updated');
      setUpdater((prev) => !prev);
    };

    window.electron.ipcRenderer.on('updateQuery', handleUpdateQuery);

    // Cleanup function
    return () => {
      window.electron.ipcRenderer.removeListener(
        'updateQuery',
        handleUpdateQuery,
      );
    };
  }, []);

  Modal.setAppElement('#root');

  async function getSpells() {
    console.log('GETSPELLS CALLED');
    window.electron.ipcRenderer.sendMessage(
      'customQuery',
      'SELECT id, SpellName0 FROM spell',
    );
  }

  useEffect(() => {
    getSpells();
  }, []);

  // useEffect(() => {
  //   console.log(spells);
  // }, [spells]);

  useEffect(() => {
    window.electron.ipcRenderer.once('customQuery', (event, args) => {
      console.log('CAUGHT SPELLS');
      setSpells(event as Spells);
      toast('Spells loaded', { toastId: 'spellLoadToast' });
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
        row={row}
        column={column}
      />
    );
  };

  const generateNumbers = (n: number) => {
    return Array.from({ length: n }, (_, i) => i + 1);
  };

  return (
    <div className="talentWrapper">
      {/* <NavBar /> */}
      <ToastContainer />
      <div className="ruler-row">
        <Ruler numbers={generateNumbers(11)} />
      </div>
      <div className="canvasWrapper">
        <div className="verticalRuler">
          {Array.from({ length: 11 }).map((_, index) => {
            return <div>{index + 1}</div>;
          })}
        </div>
        <div className="talentCanvas">
          {Array.from({ length: 121 }).map((_, index) => {
            const row = Math.floor(index / 11) + 1;
            const column = (index % 11) + 1;

            return (
              <div
                key={index}
                draggable
                onDragStart={(event) => handleDragStart(event, row, column)}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, row, column)}
                className="gridCell"
              >
                {/* {column === 0 && <div>{row}</div>} */}
                {renderTalent(row, column)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TalentEditor;
