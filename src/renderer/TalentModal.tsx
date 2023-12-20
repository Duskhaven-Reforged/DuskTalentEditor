import { useEffect, useState } from 'react';
import { ForgeTalent } from './types/Forge_Talent.type';
import Modal from 'react-modal';
import './talentModal.css';
import RanksModal from './RanksModal';
import { Ranks } from './types/Ranks.type';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import WindowedSelect from 'react-windowed-select';
import { Spells } from './types/Spells.type';
import { IOption } from './types/IOption';
import { useParams } from 'react-router-dom';
import PreReqModal from './PreReqModal';
import ChoiceNodeModal from './ChoiceNodeModal';

const TalentModal = (props: {
  forgeTalent: ForgeTalent | undefined;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
  row: number;
  column: number;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [talent, setTalent] = useState<ForgeTalent>({} as ForgeTalent);
  const [ranks, setRanks] = useState<Ranks>({} as Ranks);
  const [sql, setSql] = useState<string>('');
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [isSpellIdChanged, setIsSpellIdChanged] = useState(false);
  const [isOtherFieldsBlocked, setIsOtherFieldsBlocked] = useState(false);
  const { class: className } = useParams();

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
  }, [props.forgeTalent]);

  useEffect(() => {
    if (!props.forgeTalent) {
      setTalent((prevTalent) => ({
        ...prevTalent,
        rowIndex: props.row,
        columnIndex: props.column,
      }));
    }
  }, [props.row, props.column]);

  // useEffect(() => {
  //   console.log(options);
  // }, [options]);

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
    let sql = props.forgeTalent
      ? `UPDATE forge_talents SET `
      : `INSERT INTO forge_talents (`;

    let first = true;
    let columns = '';
    let values = '';
    for (const key in changes) {
      if (!first) {
        columns += ', ';
        values += ', ';
      }
      columns += `${key}`;
      if (props.forgeTalent) {
        columns += ` = ${changes[key]}`;
      } else {
        values += `${changes[key]}`;
      }

      first = false;
    }

    if (props.forgeTalent) {
      sql += columns + ` WHERE spellid = ${props.forgeTalent.spellid};`;
    } else {
      sql +=
        columns +
        `, rowIndex, columnIndex, talentTabId) VALUES (` +
        values +
        `, ${props.row}, ${props.column}, ${className});`;
    }

    setSql(sql);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'spellid') {
      setIsSpellIdChanged(true);
    }
    if (
      event.target.name === 'rowIndex' ||
      event.target.name === 'columnIndex'
    ) {
      setIsOtherFieldsBlocked(true);
    }
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
        props.setUpdater((prev) => !prev);
        closeModal();
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
              value={parseInt(className!)}
            />
          </label>
          <label>
            Column Index:
            <input
              type="number"
              name="columnIndex"
              onChange={handleChange}
              value={talent.columnIndex}
              disabled={true}
            />
          </label>
          <label>
            Row Index:
            <input
              type="number"
              name="rowIndex"
              onChange={handleChange}
              value={talent.rowIndex}
              disabled={true}
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
              originalspellID={talent.spellid}
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
            <input
              type="number"
              name="spellid"
              onChange={handleChange}
              value={talent.spellid}
              disabled={isOtherFieldsBlocked}
            />
          </label>
          <PreReqModal spellid={talent.spellid} setUpdater={props.setUpdater} />
          <ChoiceNodeModal
            choiceNodeId={talent.spellid}
            setUpdater={props.setUpdater}
          />
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
