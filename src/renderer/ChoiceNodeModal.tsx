import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { preReqTalents } from './types/forge_talent_prereq.type';
import './PreReqModal.css';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import { choiceNode } from './types/ChoiceNode.type';
import { useParams } from 'react-router-dom';

const ChoiceNodeModal = (props: {
  choiceNodeId: number;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [choiceNodes, setChoiceNodes] = useState<choiceNode[]>([]);
  const [dbChoiceNodes, setDbChoiceNodes] = useState<choiceNode[]>([]);
  const [sqlQueries, setSqlQueries] = useState<string[]>([]);
  const { class: className } = useParams();

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleAddChoiceNode = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    choiceSpellId: number,
  ) => {
    const dbReqItem = dbChoiceNodes.find(
      (item) => item.choiceSpellId === choiceSpellId,
    );
    const newChoice = dbReqItem || {
      choiceNodeId: props.choiceNodeId,
      choiceSpellId: 0,
      talentTabId: parseInt(className!),
    };
    setChoiceNodes([...choiceNodes, newChoice]);
  };

  const handleDeleteChoiceNode = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const newChoice = [...choiceNodes];
    newChoice.splice(index, 1);
    setChoiceNodes(newChoice);
    if (dbChoiceNodes[index]) {
      sqlQueries.push(
        `DELETE FROM forge_talent_choices WHERE choiceSpellId = ${dbChoiceNodes[index].choiceSpellId};`,
      );
      setSqlQueries([...sqlQueries]);
    }
  };

  useEffect(() => {
    console.log(choiceNodes);
  }, [choiceNodes]);

  useEffect(() => {
    const handleGetPreReq = (event: any, args: any) => {
      const reqs: preReqTalents[] = event;
      if (reqs) {
        setChoiceNodes(JSON.parse(JSON.stringify(reqs)));
        setDbChoiceNodes(JSON.parse(JSON.stringify(reqs)));
      }
    };

    window.electron.ipcRenderer.once('preReqQuery', handleGetPreReq);

    // Cleanup function
    return () => {
      window.electron.ipcRenderer.removeListener(
        'preReqQuery',
        handleGetPreReq,
      );
    };
  }, []);

  const generateSqlQueries = () => {
    let sqlQueries: string[] = [];
    choiceNodes.forEach((choiceItem, index) => {
      let sqlQuery = '';
      if (dbChoiceNodes[index]) {
        const updatedFields = Object.keys(choiceItem).filter(
          (key) =>
            choiceItem[key as keyof choiceNode] !==
            dbChoiceNodes[index][key as keyof choiceNode],
        );
        if (updatedFields.length > 0) {
          const updateClause = updatedFields
            .map((key) => `${key} = ${choiceItem[key as keyof choiceNode]}`)
            .join(', ');
          sqlQuery = `UPDATE forge_talent_choice_nodes SET ${updateClause} WHERE choiceSpellId = ${dbChoiceNodes[index].choiceSpellId};`;
        }
      } else {
        sqlQuery = `INSERT INTO forge_talent_choice_nodes (choiceNodeId, talentTabId, choiceSpellId) VALUES (${choiceItem.choiceNodeId}, ${choiceItem.talentTabId}, ${choiceItem.choiceSpellId});`;
      }
      if (sqlQuery) {
        sqlQueries.push(sqlQuery);
      }
    });
    // Add DELETE queries for items that are in dbReq but not in preReq
    dbChoiceNodes.forEach((dbChoiceItem, index) => {
      if (!choiceNodes[index]) {
        sqlQueries.push(
          `DELETE FROM forge_talent_choice_node WHERE choiceSpellId = ${dbChoiceItem.choiceSpellId};`,
        );
      }
    });
    setSqlQueries(sqlQueries);
  };

  useEffect(() => {
    generateSqlQueries();
  }, [choiceNodes, dbChoiceNodes]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof choiceNode,
  ) => {
    let newChoiceNodes = [...choiceNodes];
    newChoiceNodes[index][field] = event.target.valueAsNumber;

    setChoiceNodes(newChoiceNodes);
  };

  useEffect(() => {});

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage(
      'preReqQuery',
      `SELECT * FROM forge_talent_choice_nodes WHERE choiceNodeId = ${props.choiceNodeId}`,
    );
  }, [props.choiceNodeId]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    sqlQueries.forEach((sql) => {
      window.electron.ipcRenderer.sendMessage('preReqEndQuery', sql);
    });
  }

  useEffect(() => {
    const handlepreReqEndQuery = (event: any, args: any) => {
      console.log(event);
      if (typeof event !== 'string') {
        toast('Executed Successfully', { toastId: 'successToast' });
        // props.loadTalents();

        props.setUpdater((prev) => !prev);
        closeModal();
      } else {
        toast(event, { toastId: 'successToast' });
      }
    };

    window.electron.ipcRenderer.once('preReqEndQuery', handlepreReqEndQuery);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'preReqEndQuery',
        handlepreReqEndQuery,
      );
    };
  }, []);

  return (
    <div className="talentWrapper">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="PreReq Modal"
        className={'TalentModalBG'}
      >
        <form onSubmit={handleSubmit} className="preReqWrap">
          {choiceNodes.map((_, index) => {
            return (
              <div key={index} className="preReqForm">
                <label>
                  choiceNodeId:
                  <input
                    type="number"
                    name="choiceNodeId"
                    onChange={(event) =>
                      handleChange(event, index, 'choiceNodeId')
                    }
                    value={index + 1}
                    disabled={true}
                  />
                </label>
                <label>
                  talentTabId:
                  <input
                    type="number"
                    name="talentTabId"
                    onChange={(event) =>
                      handleChange(event, index, 'talentTabId')
                    }
                    disabled={true}
                    value={className}
                  />
                </label>
                <label>
                  choiceSpellId:
                  <input
                    type="number"
                    name="choiceSpellId"
                    onChange={(event) =>
                      handleChange(event, index, 'choiceSpellId')
                    }
                    value={choiceNodes[index].choiceSpellId}
                  />
                </label>
                <button
                  type="button"
                  onClick={(event) => handleDeleteChoiceNode(index, event)}
                >
                  Delete Choice Node
                </button>
              </div>
            );
          })}
          <div className="codeBlocks">
            {Array.from({ length: sqlQueries.length }).map((_, index) => {
              return (
                <Code
                  text={sqlQueries[index]}
                  language="sql"
                  theme={atomOneDark}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={(event) =>
              handleAddChoiceNode(event, choiceNodes.length + 1)
            }
          >
            Add Choice Node
          </button>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </Modal>
      <div onClick={openModal} className="innerModalPop">
        Set Choice Nodes
      </div>
    </div>
  );
};

export default ChoiceNodeModal;
