import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { preReqTalents } from './types/forge_talent_prereq.type';
import './PreReqModal.css';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import TooltipComponent from './shared/ToolTip';

const PreReqModal = (props: {
  spellid: number;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [preReq, setPreReq] = useState<preReqTalents[]>([]);
  const [dbReq, setDbReq] = useState<preReqTalents[]>([]);
  const [sqlQueries, setSqlQueries] = useState<string[]>([]);
  const { class: className } = useParams();

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleAddPreReq = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    reqId: number,
  ) => {
    const dbReqItem = dbReq.find((item) => item.reqId === reqId);
    const newPreReqItem = dbReqItem || {
      reqId: reqId,
      spellid: props.spellid,
      talentTabId: parseInt(className!),
      reqTalent: 0,
      reqTalentTabId: parseInt(className!),
      reqRank: 1,
    };
    setPreReq([...preReq, newPreReqItem]);
  };

  const handleDeletePreReq = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const newPreReq = [...preReq];
    newPreReq.splice(index, 1);
    setPreReq(newPreReq);
    if (dbReq[index]) {
      sqlQueries.push(
        `DELETE FROM forge_talent_prereq WHERE reqId = ${dbReq[index].reqId};`,
      );
      setSqlQueries([...sqlQueries]);
    }
  };

  useEffect(() => {
    console.log(preReq);
  }, [preReq]);

  useEffect(() => {
    const handleGetPreReq = (event: any, args: any) => {
      const reqs: preReqTalents[] = event;
      if (reqs) {
        setPreReq(JSON.parse(JSON.stringify(reqs)));
        setDbReq(JSON.parse(JSON.stringify(reqs)));
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
    console.log(dbReq);
    preReq.forEach((preReqItem, index) => {
      let sqlQuery = '';
      if (dbReq[index]) {
        const updatedFields = Object.keys(preReqItem).filter(
          (key) =>
            preReqItem[key as keyof preReqTalents] !==
            dbReq[index][key as keyof preReqTalents],
        );
        if (updatedFields.length > 0) {
          const updateClause = updatedFields
            .map((key) => `${key} = ${preReqItem[key as keyof preReqTalents]}`)
            .join(', ');
          sqlQuery = `UPDATE forge_talent_prereq SET ${updateClause} WHERE reqId = ${dbReq[index].reqId};`;
        }
      } else {
        sqlQuery = `INSERT INTO forge_talent_prereq (reqId, spellId, talentTabId, reqTalent, reqTalentTabId, reqRank) VALUES (${preReqItem.reqId}, ${preReqItem.spellid}, ${preReqItem.talentTabId}, ${preReqItem.reqTalent}, ${preReqItem.reqTalentTabId}, ${preReqItem.reqRank});`;
      }
      if (sqlQuery) {
        sqlQueries.push(sqlQuery);
      }
    });
    // Add DELETE queries for items that are in dbReq but not in preReq
    dbReq.forEach((dbReqItem, index) => {
      if (!preReq[index]) {
        sqlQueries.push(
          `DELETE FROM forge_talent_prereq WHERE reqId = ${dbReqItem.reqId};`,
        );
      }
    });
    setSqlQueries(sqlQueries);
  };

  useEffect(() => {
    generateSqlQueries();
  }, [preReq, dbReq]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof preReqTalents,
  ) => {
    let newPreReq = [...preReq];
    newPreReq[index][field] = event.target.valueAsNumber;

    setPreReq(newPreReq);
  };

  useEffect(() => {});

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage(
      'preReqQuery',
      `SELECT * FROM forge_talent_prereq WHERE spellid = ${props.spellid}`,
    );
  }, [props.spellid]);

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
          {preReq.map((_, index) => {
            return (
              <div key={index} className="preReqForm">
                <label>
                  reqId:
                  <input
                    type="number"
                    name="reqId"
                    onChange={(event) => handleChange(event, index, 'reqId')}
                    value={index + 1}
                    disabled={true}
                  />
                </label>
                <label>
                  spellId:
                  <input
                    type="number"
                    name="spellId"
                    onChange={(event) => handleChange(event, index, 'spellid')}
                    value={props.spellid}
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
                    value={preReq[index].talentTabId}
                    disabled={true}
                  />
                </label>
                <label>
                  reqTalent:{' '}
                  <TooltipComponent
                    tip="The ID of the talent that is required before you can take this talent."
                    tipId="reqTalent"
                  />
                  <input
                    type="number"
                    name="reqTalent"
                    onChange={(event) =>
                      handleChange(event, index, 'reqTalent')
                    }
                    value={preReq[index].reqTalent}
                  />
                </label>
                <label>
                  reqTalentTabId:
                  <input
                    type="number"
                    name="reqTalentTabId"
                    onChange={(event) =>
                      handleChange(event, index, 'reqTalentTabId')
                    }
                    value={preReq[index].reqTalentTabId}
                    disabled={true}
                  />
                </label>
                <label>
                  reqRank:
                  <input
                    type="number"
                    name="reqRank"
                    onChange={(event) => handleChange(event, index, 'reqRank')}
                    value={preReq[index].reqRank}
                    disabled={true}
                  />
                </label>
                <button
                  type="button"
                  onClick={(event) => handleDeletePreReq(index, event)}
                >
                  Delete Pre Req
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
            onClick={(event) => handleAddPreReq(event, preReq.length + 1)}
          >
            Add PreReq
          </button>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </Modal>
      <div onClick={openModal} className="innerModalPop">
        Set Pre Requisite Talents
      </div>
    </div>
  );
};

export default PreReqModal;
