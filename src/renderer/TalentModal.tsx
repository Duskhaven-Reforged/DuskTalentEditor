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
import TooltipComponent from './shared/ToolTip';

const TalentModal = (props: {
  forgeTalent: ForgeTalent | undefined;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
  row: number;
  column: number;
  setNodeIndexQueries: React.Dispatch<React.SetStateAction<string[]>>;
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
      const rowToMinLevel: Record<number, number> =
        props.forgeTalent.talentType === 7
          ? {
              1: 10,
              2: 12,
              3: 14,
              4: 16,
              5: 26,
              6: 28,
              7: 30,
              8: 46,
              9: 48,
              10: 50,
              11: 60,
            }
          : {
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

      if (
        props.forgeTalent.trueNodeIndex &&
        props.forgeTalent.trueNodeIndex != props.forgeTalent.nodeindex
      ) {
        props.setNodeIndexQueries((prev) => [
          ...prev,
          `UPDATE forge_talents SET nodeIndex = ${props.forgeTalent?.trueNodeIndex} WHERE spellid = ${props.forgeTalent?.spellid} AND talentTabId = ${className}`,
        ]);
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
      const rowToMinLevel: Record<number, number> = {
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
        nodeType: 0,
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
      sql += columns;
      // if (
      //   props.forgeTalent.trueNodeIndex &&
      //   props.forgeTalent.trueNodeIndex != props.forgeTalent.nodeindex
      // ) {
      //   sql += `, nodeIndex = ${props.forgeTalent.trueNodeIndex}`;
      // }

      sql += ` WHERE spellid = ${props.forgeTalent.spellid} AND talentTabId = ${className};`;
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

  const fieldInfo = {
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
            <TooltipComponent
              tip={fieldInfo.spellID}
              tipId={fieldInfo.spellID}
            />
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
            <TooltipComponent
              tip={fieldInfo.numberRanks}
              tipId={fieldInfo.numberRanks}
            />
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
            <TooltipComponent
              tip={fieldInfo.nodeIndex}
              tipId={fieldInfo.nodeIndex}
            />
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
            <TooltipComponent
              tip={fieldInfo.nodeType}
              tipId={fieldInfo.nodeType}
            />
            <select
              name="nodeType"
              onChange={handleChange}
              value={talent.nodeType}
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
            <TooltipComponent
              tip={fieldInfo.talentTabID}
              tipId={fieldInfo.talentTabID}
            />
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
            <TooltipComponent
              tip={fieldInfo.columnIndex}
              tipId={fieldInfo.columnIndex}
            />
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
            <TooltipComponent
              tip={fieldInfo.rowIndex}
              tipId={fieldInfo.rowIndex}
            />
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
            <TooltipComponent
              tip={fieldInfo.rankCost}
              tipId={fieldInfo.rankCost}
            />
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
            <TooltipComponent
              tip={fieldInfo.minLevel}
              tipId={fieldInfo.minLevel}
            />
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
            <TooltipComponent
              tip={fieldInfo.TalentType}
              tipId={fieldInfo.TalentType}
            />
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
            <TooltipComponent
              tip={fieldInfo.TabPointReq}
              tipId={fieldInfo.TabPointReq}
            />
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
