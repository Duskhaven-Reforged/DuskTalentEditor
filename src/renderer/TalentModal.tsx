import { classLists } from './types/ClassList.type';
import { useEffect, useState } from 'react';
import { ForgeTalent, nodeTypes } from './types/Forge_Talent.type';
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
  talentType: number;
  nodeType: number;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [talent, setTalent] = useState<ForgeTalent>({} as ForgeTalent);
  const [ranks, setRanks] = useState<Ranks>({} as Ranks);
  const [sql, setSql] = useState<string>('');
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [isSpellIdChanged, setIsSpellIdChanged] = useState(false);
  const [isOtherFieldsBlocked, setIsOtherFieldsBlocked] = useState(false);
  const { class: className } = useParams();
  const [infoTooltipVisible, setInfoTooltipVisible] = useState<Record<string, boolean>>({});

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
    if (props.forgeTalent) {
      setTalent({
        ...props.forgeTalent,
        nodeType: props.forgeTalent.nodeType ?? nodeTypes[0].value, // Default to the first nodeType if undefined
      });
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

  useEffect(() => {
    // Assuming className is the `specID` from the URL
    const isGeneralTree = (className: string): boolean => {
      return classLists.some((classItem) =>
        classItem.specs.some(
          (spec) =>
            spec.name.includes('General Tree') && spec.specID === className,
        ),
      );
    };

    // Fetch the specID from URL params
    const matchingSpec = classLists
      .flatMap((cls) => cls.specs)
      .find((spec) => spec.specID === className);
    const currentTalentType =
      matchingSpec && matchingSpec.name.includes('General Tree') ? 7 : 0;

    // Set talentType only when forgeTalent is not set, assuming new talents are being created
    if (!props.forgeTalent) {
      setTalent((prevTalent) => ({
        ...prevTalent,
        talentType: currentTalentType,
      }));
    }
  }, [className, props.forgeTalent]);

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
        `, rowIndex, columnIndex, talentTabId, talentType) VALUES (` +
        values +
        `, ${props.row}, ${props.column}, ${className}, ${talent.talentType});`;
    }

    setSql(sql);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    let valueToSet = value;

    // Check if the input is "nodeType" and parse it as a number
    if (name === 'nodeType') {
      valueToSet = parseInt(value, 10);
    }

    // Update talent state
    setTalent((prevTalent) => ({
      ...prevTalent,
      [name]: name === 'nodeType' ? valueToSet : event.target.valueAsNumber,
    }));

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
      [name]: name === 'nodeType' ? valueToSet : event.target.valueAsNumber,
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

  const toggleInfoTooltip = (fieldName: string) => {
    setInfoTooltipVisible(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const fieldInfo = {
    rankCost: "Rank Cost determines how many points are required to learn this talent.",
    // Add similar descriptions for other fields
  };

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
              // onChange={handleChange}
              disabled={true}
              value={parseInt(className!)}
              disabled={true}
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
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('rankCost')}
            >
              (i)
            </button>
            {infoTooltipVisible.rankCost && (
              <div className="tooltip">{fieldInfo.rankCost}</div>
            )}
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
              disabled={true}
            />
          </label>
          <label>
            Number Ranks:
            <input
              type="number"
              name="numberRanks"
              onChange={handleChange}
              value={talent.numberRanks}
              max={2}
            />
            <RanksModal
              spellid={talent.spellid}
              setUpdater={props.setUpdater}
            />
          </label>
          <label>
            Pre Req Type:
            <input
              type="number"
              name="preReqType"
              onChange={handleChange}
              value={talent.preReqType === 0 ? 0 : 1}
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
            <select
              name="nodeType"
              onChange={handleChange}
              value={talent.nodeType}
            >
              {nodeTypes.map((type, index) => (
                <option key={type.value} value={type.value} hidden={index === 0}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Node Index:
            <input
              type="number"
              name="nodeIndex"
              onChange={handleChange}
              value={talent.nodeindex}
            />
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
