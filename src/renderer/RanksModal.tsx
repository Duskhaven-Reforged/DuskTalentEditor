import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import './talentModal.css';
import { Ranks } from './types/Ranks.type';
import { Code } from 'react-code-blocks';
import { toast } from 'react-toastify';

const RanksModal = (props: {
  ranks: Ranks;
  setRanks: (ranks: Ranks) => void;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [ranks, setRanks] = useState<Ranks>(props.ranks);
  const [sql, setSql] = useState<string[]>([]);

  const handleSql = () => {
    let sqlQueries = [];
    for (let i = 0; i < ranks.numberRanks; i++) {
      let sql = `INSERT INTO forge_talent_ranks VALUES `;
      sql += `(${ranks.talentSpellid[0]}, ${ranks.talentTabid}, ${i + 1}, ${
        ranks.talentSpellid[i]
      })`;
      sql += ';';
      sqlQueries.push(sql);
    }
    setSql(sqlQueries);
  };

  useEffect(() => {
    setRanks(props.ranks);
  }, []);

  const openModal = () => {
    console.log('NO OF RANKS + ' + ranks.numberRanks);
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    handleSql();
    console.log(ranks);
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
    // TODO: Handle form submission
    sql.forEach((v) => {
      window.electron.ipcRenderer.sendMessage('endQuery', v);
    });
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
            return <Code text={sql[index]} language="sql" />;
          })}
          <button type="submit">Submit</button>
        </form>
      </Modal>
      <div onClick={openModal}>Set Ranks</div>
    </div>
  );
};

export default RanksModal;
