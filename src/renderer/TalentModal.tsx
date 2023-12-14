import { useEffect, useState } from 'react';
import { ForgeTalent } from './types/Forge_Talent.type';
import Modal from 'react-modal';
import './talentModal.css';
import RanksModal from './RanksModal';
import { Ranks } from './types/Ranks.type';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Spells } from './types/Spells.type';
import { IOption } from './types/IOption';

const TalentModal = (props: {
  forgeTalent: ForgeTalent | undefined;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
  spells: Spells | undefined;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [talent, setTalent] = useState<ForgeTalent>({} as ForgeTalent);
  const [ranks, setRanks] = useState<Ranks>({} as Ranks);
  const [sql, setSql] = useState<string>('');
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<IOption>();
  const [options, setOptions] = useState<IOption[]>([]);

  useEffect(() => {
    if (props.forgeTalent) {
      setTalent(props.forgeTalent);
      const r: Ranks = {
        talentSpellid: [props.forgeTalent.spellid],
        talentTabid: props.forgeTalent.talentTabId,
        numberRanks: props.forgeTalent.numberRanks,
      };
      setRanks(r);
    } else {
      const r: Ranks = {
        talentSpellid: [1],
        talentTabid: 1,
        numberRanks: 1,
      };
    }

    if (props.spells) {
      props.spells.forEach((spell) => {
        console.log(spell);
        setOptions([...options, { value: spell.id, label: spell.SpellName0 }]);
      });
    }
  }, [props.forgeTalent]);

  useEffect(() => {
    handleSql();
  }, [changes]);

  useEffect(() => {
    console.log('SQL = ' + sql);
  }, [sql]);

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSql = () => {
    // Construct the SQL query
    let sql = props.forgeTalent
      ? `UPDATE forge_talents SET `
      : `INSERT INTO forge_talents VALUES `;
    let first = true;
    for (const key in changes) {
      if (!first) {
        sql += ', ';
      }
      sql += `${key} = ${changes[key]}`;
      first = false;
    }
    if (props.forgeTalent) {
      sql += ` WHERE spellid = ${talent.spellid};`;
    } else {
      sql += `;`;
    }

    // Set the 'sql' state variable with the constructed SQL query
    setSql(sql);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTalent({
      ...talent,
      [event.target.name]: event.target.valueAsNumber,
    });
    if (event.target.name === 'numberRanks') {
      setRanks({ ...ranks, numberRanks: event.target.valueAsNumber });
    }
    setChanges((prevChanges) => ({
      ...prevChanges,
      [event.target.name]: event.target.valueAsNumber,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    window.electron.ipcRenderer.sendMessage('endQuery', sql);
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
          <label>
            Talent Tab ID:
            <input
              type="number"
              name="talentTabId"
              onChange={handleChange}
              value={talent.talentTabId}
            />
          </label>
          <label>
            Column Index:
            <input
              type="number"
              name="columnIndex"
              onChange={handleChange}
              value={talent.columnIndex}
            />
          </label>
          <label>
            Row Index:
            <input
              type="number"
              name="rowIndex"
              onChange={handleChange}
              value={talent.rowIndex}
            />
          </label>
          <label>
            Rank Cost:
            <input
              type="number"
              name="rankCost"
              onChange={handleChange}
              value={talent.rankCost}
            />
          </label>
          <label>
            Min Level:
            <input
              type="number"
              name="minLevel"
              onChange={handleChange}
              value={talent.minLevel}
            />
          </label>
          <label>
            Talent Type:
            <input
              type="number"
              name="talentType"
              onChange={handleChange}
              value={talent.talentType}
            />
          </label>
          <label>
            Number Ranks:
            <input
              type="number"
              name="numberRanks"
              onChange={handleChange}
              value={talent.numberRanks}
            />
            <RanksModal
              ranks={ranks}
              setRanks={setRanks}
              setUpdater={props.setUpdater}
            />
          </label>
          <label>
            Pre Req Type:
            <input
              type="number"
              name="preReqType"
              onChange={handleChange}
              value={talent.preReqType}
            />
          </label>
          <label>
            Tab Point Req:
            <input
              type="number"
              name="tabPointReq"
              onChange={handleChange}
              value={talent.tabPointReq}
            />
          </label>
          <label>
            Node Type:
            <input
              type="number"
              name="nodeType"
              onChange={handleChange}
              value={talent.nodeType}
            />
          </label>
          <label>
            Node Index:
            <input type="number" name="nodeIndex" onChange={handleChange} />
          </label>
          <label>
            Spell ID:
            {/* <Select
              defaultValue={selectedOption}
              onChange={(nv, am) => {
                if (nv) setSelectedOption(nv);
              }}
              options={options}
            />{' '}
            {talent.spellid} */}
            <input
              type="number"
              name="spellid"
              onChange={handleChange}
              value={talent.spellid}
            />
          </label>
          <Code text={sql} language={`sql`} wrapLongLines theme={atomOneDark} />
          <button type="submit">Submit</button>
        </form>
      </Modal>
      {props.forgeTalent ? (
        <div onClick={openModal}>{props.forgeTalent.spellid}</div>
      ) : (
        <div onClick={openModal}>+</div>
      )}
    </div>
  );
};

export default TalentModal;
