import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import WindowedSelect from 'react-windowed-select';
import { Spells } from './types/Spells.type';
import { IOption } from './types/IOption';
import { ForgeTalent, nodeTypes } from './types/Forge_Talent.type';
import './talentModal.css';
import RanksModal from './RanksModal';
import { Ranks } from './types/Ranks.type';
import PreReqModal from './PreReqModal';
import { classLists } from './types/ClassList.type';
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
  const [infoTooltipVisible, setInfoTooltipVisible] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (props.forgeTalent) {
      setTalent({
        ...props.forgeTalent,
        nodeType: props.forgeTalent.nodeType ?? nodeTypes[0].value, // Default to the first nodeType if undefined
      });
      setSql('');
      setChanges({});
    }
  }, [props.forgeTalent]);

  useEffect(() => {
    if (props.forgeTalent) {
      const currentRow = props.forgeTalent.rowIndex;
      const rowToMinLevel = {
        1: 11,
        2: 13,
        3: 15,
        4: 17,
        5: 27,
        6: 29,
        7: 31,
        8: 47,
        9: 49,
        10: 51,
        11: 60,
      };
      const minLevel = rowToMinLevel[currentRow] || 0; // Default to 0 if row is not in the map

      let tabPointReq = props.forgeTalent.tabPointReq;
      // Check and adjust TabPointReq based on the row index of the talent
      if (currentRow === 5) {
        tabPointReq = 8;
      } else if (currentRow === 8) {
        tabPointReq = 18;
      } else {
        tabPointReq = 0;
      }

      // Update talent state with new data
      setTalent({
        ...props.forgeTalent,
        tabPointReq: tabPointReq,
        minLevel: minLevel, // New minLevel based on currentRow
      });

      // Prepare changes for SQL update
      setChanges({
        tabPointReq: tabPointReq,
        minLevel: minLevel,
      });
    }
  }, [props.forgeTalent]);

  useEffect(() => {
    if (!props.forgeTalent && className) {
      const rowToMinLevel = {
        1: 11,
        2: 13,
        3: 15,
        4: 17,
        5: 27,
        6: 29,
        7: 31,
        8: 47,
        9: 49,
        10: 51,
        11: 60,
      };
      const minLevel = rowToMinLevel[props.row] || 0; // Default to 0 if row is not in the map

      let tabPointReq = 0;
      if (props.row === 5) {
        tabPointReq = 8;
      } else if (props.row === 8) {
        tabPointReq = 18;
      }

      // Set default values for a new talent
      setTalent({
        talentTabId: parseInt(className),
        rowIndex: props.row,
        columnIndex: props.column,
        rankCost: 1,
        minLevel: minLevel,
        talentType: 0,
        numberRanks: 0,
        preReqType: 1,
        tabPointReq: tabPointReq,
        nodeType: '',
        nodeindex: 0,
        spellid: 0,
      });
    }
  }, [props.row, props.column, props.forgeTalent, className]);

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
        `, rowIndex, columnIndex, talentTabId, talentType, preReqType, tabPointReq, rankCost, minLevel) VALUES (` +
        values +
        `, ${props.row}, ${props.column}, ${className}, ${talent.talentType}, ${talent.preReqType}, ${talent.tabPointReq}, ${talent.rankCost}, ${talent.minLevel});`;
    }

    setSql(sql);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    let valueToSet: number = parseInt(value);

    // Check if the input is "nodeType" and parse it as a number
    if (name === 'nodeType') {
      valueToSet = parseInt(value, 10);
    }

    // Update talent state
    setTalent((prevTalent) => ({
      ...prevTalent,
      [name]: name === 'nodeType' ? valueToSet : parseInt(value),
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
      [event.target.name]: parseInt(value),
    });
    if (event.target.name === 'numberRanks') {
      setRanks({ ...ranks, numberRanks: parseInt(value) });
    }
    setChanges((prevChanges) => ({
      ...prevChanges,
      [event.target.name]: parseInt(value),
      [name]: name === 'nodeType' ? valueToSet : parseInt(value),
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
    setInfoTooltipVisible((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const fieldInfo = {
    rankCost:
      'Rank Cost determines how many points are required to learn this talent.',
    spellID: 'The ID of the Spell you want as the Talent',
    numberRanks: 'How many ranks of this talent are available? - Min: 1 Max: 2',
    nodeIndex:
      'Top to Bottom & Left to Right.. numerical order of Talents.. must be in order at all times for our Talent Loadouts.',
    nodeType:
      'This determines what the talent is.. a passive? active? or a choice-node.',
    talentTabID: 'This determines what Tree the talent is being placed in.',
    columnIndex: 'This determines what column the talent is being placed in.',
    rowIndex: 'This determines what row the talent is being placed in.',
    rankCost:
      'This determines how many points per talent it will cost. Ex: Can make Mortal Strike cost 5 points.',
    minLevel: 'The min lvl required to learn the talent',
    TalentType:
      'Determines if the talent costs a "class" point or a "spec" point. Ex: 0 = Spec, 7 = Class',
    TabPointReq:
      'Determines how many points must be spent in order unlock the talent.',
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
            Spell ID:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('spellID')}
            >
              (i)
            </button>
            {infoTooltipVisible.spellID && (
              <div className="tooltip">{fieldInfo.spellID}</div>
            )}
            <input
              type="number"
              name="spellid"
              onChange={handleChange}
              value={talent.spellid}
              disabled={isOtherFieldsBlocked}
              min={0}
            />
          </label>
          <label>
            Number Ranks:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('numberRanks')}
            >
              (i)
            </button>
            {infoTooltipVisible.numberRanks && (
              <div className="tooltip">{fieldInfo.numberRanks}</div>
            )}
            <input
              type="number"
              name="numberRanks"
              onChange={handleChange}
              value={talent.numberRanks}
              min={1}
              max={2}
            />
            <RanksModal
              spellid={talent.spellid}
              setUpdater={props.setUpdater}
            />
          </label>
          <label>
            Node Index:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('nodeIndex')}
            >
              (i)
            </button>
            {infoTooltipVisible.nodeIndex && (
              <div className="tooltip">{fieldInfo.nodeIndex}</div>
            )}
            <input
              type="number"
              name="nodeindex"
              onChange={handleChange}
              value={talent.nodeindex}
              min={0}
              max={121}
            />
          </label>
          <label>
            Node Type:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('nodeType')}
            >
              (i)
            </button>
            {infoTooltipVisible.nodeType && (
              <div className="tooltip">{fieldInfo.nodeType}</div>
            )}
            <select
              name="nodeType"
              onChange={handleChange}
              value={talent.nodeType}
              min={0}
              max={2}
            >
              {nodeTypes.map((type, index) => (
                <option
                  key={type.value}
                  value={type.value}
                  hidden={index === 0}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Talent Tab ID:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('TalentTabID')}
            >
              (i)
            </button>
            {infoTooltipVisible.TalentTabID && (
              <div className="tooltip">{fieldInfo.talentTabID}</div>
            )}
            <input
              type="number"
              name="talentTabId"
              // onChange={handleChange}
              disabled={true}
              value={parseInt(className!)}
              min={0}
            />
          </label>
          <label>
            Column Index:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('columnIndex')}
            >
              (i)
            </button>
            {infoTooltipVisible.columnIndex && (
              <div className="tooltip">{fieldInfo.columnIndex}</div>
            )}
            <input
              type="number"
              name="columnIndex"
              onChange={handleChange}
              value={talent.columnIndex}
              disabled={true}
              min={0}
            />
          </label>
          <label>
            Row Index:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('rowIndex')}
            >
              (i)
            </button>
            {infoTooltipVisible.rowIndex && (
              <div className="tooltip">{fieldInfo.rowIndex}</div>
            )}
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
              disabled={true}
            />
          </label>
          <label>
            Min Level:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('minLevel')}
            >
              (i)
            </button>
            {infoTooltipVisible.minLevel && (
              <div className="tooltip">{fieldInfo.minLevel}</div>
            )}
            <input
              type="number"
              name="minLevel"
              onChange={handleChange}
              value={talent.minLevel}
              min={11}
              disabled={true}
            />
          </label>
          <label>
            Talent Type:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('talentType')}
            >
              (i)
            </button>
            {infoTooltipVisible.talentType && (
              <div className="tooltip">{fieldInfo.TalentType}</div>
            )}
            <input
              type="number"
              name="talentType"
              onChange={handleChange}
              value={talent.talentType}
              disabled={true}
            />
          </label>
          <label>
            Pre Req Type:
            <input
              type="number"
              name="preReqType"
              onChange={handleChange}
              value={talent.preReqType === 0 ? 0 : 1}
              disabled={true}
            />
          </label>
          <label>
            Tab Point Req:
            <button
              type="button"
              className="infoButton"
              onClick={() => toggleInfoTooltip('TabPointReq')}
            >
              (i)
            </button>
            {infoTooltipVisible.TabPointReq && (
              <div className="tooltip">{fieldInfo.TabPointReq}</div>
            )}
            <input
              type="number"
              name="tabPointReq"
              onChange={handleChange}
              value={talent.tabPointReq}
              disabled={true}
            />
          </label>
          <PreReqModal spellid={talent.spellid} setUpdater={props.setUpdater} />
          <ChoiceNodeModal
            forgeTalent={talent}
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
