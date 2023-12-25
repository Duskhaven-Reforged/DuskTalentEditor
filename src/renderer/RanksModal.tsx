import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import './talentModal.css';
import { Ranks } from './types/Ranks.type';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import { DBRanks } from './types/DB_Ranks.type';

const RanksModal = (props: {
  ranks: Ranks;
  setRanks: (ranks: Ranks) => void;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
  originalspellID: number;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [ranks, setRanks] = useState<Ranks>(props.ranks);
  const [sql, setSql] = useState<string[]>([]);
  const [dbRanks, setDbRanks] = useState<DBRanks[]>([]);

  const handleSql = () => {
    let sqlQueries = [];
    for (let i = 0; i < ranks.numberRanks; i++) {
      let sql;
      if (dbRanks.length === 0) {
        // If dbRanks is empty, use INSERT
        sql = `INSERT INTO forge_talent_ranks (talentSpellId, talentTabId, rank, spellId) VALUES `;
      } else if (dbRanks.length === 1) {
        // If dbRanks has one item, use UPDATE for the first query and INSERT for the second
        sql =
          i === 0
            ? `UPDATE forge_talent_ranks SET talentSpellId = ${
                ranks.talentSpellid[0]
              }, talentTabId = ${ranks.talentTabid}, rank = ${
                i + 1
              }, spellId = ${ranks.talentSpellid[i]} WHERE talentSpellId = ${
                props.originalspellID
              }`
            : `INSERT INTO forge_talent_ranks (talentSpellId, talentTabId, rank, spellId) VALUES (${
                ranks.talentSpellid[0]
              }, ${ranks.talentTabid}, ${i + 1}, ${ranks.talentSpellid[i]})`;
      } else {
        // If dbRanks has two items, use UPDATE for both queries
        sql = `UPDATE forge_talent_ranks SET talentSpellId = ${
          ranks.talentSpellid[0]
        }, talentTabId = ${ranks.talentTabid}, rank = ${i + 1}, spellId = ${
          ranks.talentSpellid[i]
        }`;

        i === 0
          ? (sql += ` WHERE talentSpellId = ${props.originalspellID}`)
          : (sql += ` WHERE talentSpellId = ${ranks.talentSpellid[0]}`);
      }
      sql += ';';
      sqlQueries.push(sql);
    }
    setSql(sqlQueries);
  };

  useEffect(() => {
    handleSql();
  }, [dbRanks]);

  useEffect(() => {
    const handleGetRanks = (event: any, args: any) => {
      console.log('Ranks Caught');
      const dbRanks: DBRanks[] = event;
      console.log(dbRanks);
      // console.log(dbRanks[1].spellId);
      let r: Ranks = ranks;
      r.talentSpellid[0] = dbRanks[0].talentSpellId;
      if (dbRanks.length == 2) {
        r.talentSpellid[1] = dbRanks[1].spellId;
      }
      console.log(r);
      setRanks(r);
      setDbRanks(dbRanks);
    };

    window.electron.ipcRenderer.once('ranksQuery', handleGetRanks);

    // Cleanup function
    return () => {
      window.electron.ipcRenderer.removeListener('ranksQuery', handleGetRanks);
    };
  }, []);

  const openModal = () => {
    console.log('NO OF RANKS + ' + ranks.numberRanks);
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    console.log(ranks);
    if (ranks.talentSpellid) {
      window.electron.ipcRenderer.sendMessage(
        'ranksQuery',
        `SELECT * FROM forge_talent_ranks WHERE talentSpellId = ${props.originalspellID}`,
      );
      handleSql();
      console.log(ranks);
    }
  }, [ranks]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    // Create a new array with the updated value
    let newTalentSpellid: number[] = ranks.talentSpellid;
    newTalentSpellid[index] = event.target.valueAsNumber;

    // Update the ranks object with the new talentSpellid array
    setRanks({
      ...ranks,
      talentSpellid: newTalentSpellid,
    });
    handleSql();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sql.forEach((v) => {
      window.electron.ipcRenderer.sendMessage('endQuery', v);
    });
    // window.electron.ipcRenderer.sendMessage('endQuery', sql[1]);

    props.setUpdater((prev) => !prev);
  };

  useEffect(() => {
    window.electron.ipcRenderer.once('endQuery', (event, args) => {
      // console.log(event);
      if (typeof event !== 'string') {
        toast('Executed Successfully', { toastId: 'successToast' });
        // props.loadTalents();

        // props.setUpdater(!props.updater);
      }
    });
  });

  return (
    <div className="talentWrapper">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Talent Modal"
        className={'TalentModalBG'}
      >
        <form onSubmit={handleSubmit} className="talentModalForm">
          {Array.from({ length: ranks.numberRanks }).map((_, index) => {
            return (
              <label>
                Talent Spell ID:
                <input
                  type="number"
                  name="talentSpellid"
                  onChange={(event) => handleChange(event, index)}
                  value={ranks.talentSpellid?.[index]}
                />
              </label>
            );
          })}
          {Array.from({ length: sql.length }).map((_, index) => {
            return (
              <Code text={sql[index]} language="sql" theme={atomOneDark} />
            );
          })}
          <button type="submit">Submit</button>
        </form>
      </Modal>
      <div onClick={openModal} className="innerModalPop">
        Set Ranks
      </div>
    </div>
  );
};

export default RanksModal;
