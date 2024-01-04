import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { preReqTalents } from './types/forge_talent_prereq.type';
import './PreReqModal.css';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import { DBRanks } from './types/DB_Ranks.type';
import { useParams } from 'react-router-dom';

const RanksModal = (props: {
  spellid: number;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [rank, setRank] = useState<DBRanks[]>([]);
  const [dbRank, setDbRank] = useState<DBRanks[]>([]);
  const [sqlQueries, setSqlQueries] = useState<string[]>([]);
  const { class: className } = useParams();

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleAddRank = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    rankNumber: number,
  ) => {
    const dbRankItem = dbRank.find((item) => item.rank === rankNumber);
    const newPreReqItem = dbRankItem || {
      talentSpellId: props.spellid,
      talentTabId: parseInt(className!),
      rank: rankNumber,
      spellId: 0,
    };
    setRank([...rank, newPreReqItem]);
  };

  const handleDeleteRank = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const newRank = [...rank];
    newRank.splice(index, 1);
    setRank(newRank);
    if (dbRank[index]) {
      sqlQueries.push(
        `DELETE FROM forge_talent_ranks WHERE spellid = ${dbRank[index].spellId};`,
      );
      setSqlQueries([...sqlQueries]);
    }
  };

  useEffect(() => {
    console.log(rank);
  }, [rank]);

  useEffect(() => {
    const handleGetRanks = (event: any, args: any) => {
      const reqs: preReqTalents[] = event;
      if (reqs) {
        setRank(JSON.parse(JSON.stringify(reqs)));
        setDbRank(JSON.parse(JSON.stringify(reqs)));
      }
    };

    window.electron.ipcRenderer.once('ranksQuery', handleGetRanks);

    // Cleanup function
    return () => {
      window.electron.ipcRenderer.removeListener('ranksQuery', handleGetRanks);
    };
  }, []);

  const generateSqlQueries = () => {
    let sqlQueries: string[] = [];
    console.log(dbRank);
    rank.forEach((rankItem, index) => {
      let sqlQuery = '';
      if (dbRank[index]) {
        const updatedFields = Object.keys(rankItem).filter(
          (key) =>
            rankItem[key as keyof DBRanks] !==
            dbRank[index][key as keyof DBRanks],
        );
        if (updatedFields.length > 0) {
          const updateClause = updatedFields
            .map((key) => `${key} = ${rankItem[key as keyof DBRanks]}`)
            .join(', ');
          sqlQuery = `UPDATE forge_talent_ranks SET ${updateClause} WHERE spellid = ${dbRank[index].spellId};`;
        }
      } else {
        sqlQuery = `INSERT INTO forge_talent_ranks (talentSpellId, talentTabId, rank, spellid) VALUES (${rankItem.talentSpellId}, ${rankItem.talentTabId}, ${rankItem.rank}, ${rankItem.spellId});`;
      }
      if (sqlQuery) {
        sqlQueries.push(sqlQuery);
      }
    });
    // Add DELETE queries for items that are in dbRank but not in rank
    dbRank.forEach((dbRankItem, index) => {
      if (!rank[index]) {
        sqlQueries.push(
          `DELETE FROM forge_talent_prereq WHERE rank = ${dbRankItem.rank};`,
        );
      }
    });
    setSqlQueries(sqlQueries);
  };

  useEffect(() => {
    generateSqlQueries();
  }, [rank, dbRank]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof DBRanks,
  ) => {
    let newRank = [...rank];
    newRank[index][field] = event.target.valueAsNumber;

    setRank(newRank);
  };

  useEffect(() => {});

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage(
      'ranksQuery',
      `SELECT * FROM forge_talent_ranks WHERE talentSpellId = ${props.spellid}`,
    );
  }, [props.spellid]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    sqlQueries.forEach((sql) => {
      window.electron.ipcRenderer.sendMessage('ranksQuery', sql);
    });
  }

  useEffect(() => {
    const handleEndQuery = (event: any, args: any) => {
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

    window.electron.ipcRenderer.once('ranksEndQuery', handleEndQuery);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'ranksEndQuery',
        handleEndQuery,
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
          {rank.map((_, index) => {
            return (
              <div key={index} className="preReqForm">
                <label>
                  Rank:
                  <input
                    type="number"
                    name="rank"
                    onChange={(event) => handleChange(event, index, 'rank')}
                    value={index + 1}
                    disabled={true}
                  />
                </label>
                <label>
                  Talent Spell ID:
                  <input
                    type="number"
                    name="talentSpellId"
                    onChange={(event) =>
                      handleChange(event, index, 'talentSpellId')
                    }
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
                    value={rank[index].talentTabId}
                    disabled={true}
                  />
                </label>
                <label>
                  Spell ID:
                  <input
                    type="number"
                    name="reqTalent"
                    onChange={(event) => handleChange(event, index, 'spellId')}
                    value={rank[index].spellId}
                  />
                </label>

                <button
                  type="button"
                  onClick={(event) => handleDeleteRank(index, event)}
                >
                  Delete Rank
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
            onClick={(event) => handleAddRank(event, rank.length + 1)}
          >
            Add Rank
          </button>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </Modal>
      <div onClick={openModal} className="innerModalPop">
        Set Ranks
      </div>
    </div>
  );
};

export default RanksModal;
