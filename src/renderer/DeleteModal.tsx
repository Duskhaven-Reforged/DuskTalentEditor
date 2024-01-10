import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { preReqTalents } from './types/forge_talent_prereq.type';
import './PreReqModal.css';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import { choiceNode } from './types/ChoiceNode.type';
import { useParams } from 'react-router-dom';
import { ForgeTalent } from './types/Forge_Talent.type';

const DeleteModal = (props: {
  spellID: number;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
  setModal: React.Dispatch<boolean>;
  isOpen: boolean;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sqlQueries, setSqlQueries] = useState<string[]>([]);
  const { class: className } = useParams();

  useEffect(() => {
    setModalIsOpen(props.isOpen);
  }, [props.isOpen]);

  const closeModal = () => {
    setModalIsOpen(false);
    props.setModal(false);
  };

  useEffect(() => {
    const deleteQueries: string[] = [
      `DELETE FROM forge_talents WHERE spellid=${props.spellID} AND talentTabId=${className};`,
      `DELETE FROM forge_talent_choice_nodes WHERE choiceNodeId=${props.spellID} AND talentTabId=${className}`,
      `DELETE FROM forge_talent_ranks WHERE talentSpellId=${props.spellID} AND talentTabId=${className}`,
      `DELETE FROM forge_talent_prereq WHERE (spellid=${props.spellID} AND talentTabId=${className}) OR (reqTalent=${props.spellID} AND talentTabId=${className})`,
    ];

    setSqlQueries(deleteQueries);
  }, [props.spellID]);

  async function handleSubmit(event: React.FormEvent) {
    for (let sql of sqlQueries) {
      await new Promise<void>((resolve, reject) => {
        window.electron.ipcRenderer.sendMessage('deleteQuery', sql);
        window.electron.ipcRenderer.once(
          'nodeEndQuery',
          (event: any, args: any) => {
            if (typeof event !== 'string') {
              resolve();
            } else {
              reject(event);
            }
          },
        );
      });
    }
    props.setUpdater((prev) => !prev);
    closeModal();
  }

  // function handleSubmit(event: React.FormEvent) {
  //   props.sqlQueries.forEach((sql) => {
  //     window.electron.ipcRenderer.sendMessage('nodeEndQuery', sql);
  //   });
  // }

  // useEffect(() => {
  //   const handlepreReqEndQuery = (event: any, args: any) => {
  //     console.log(event);
  //     if (typeof event !== 'string') {
  //       toast('Executed Successfully', { toastId: 'successToast' });
  //       // props.loadTalents();

  //       props.setUpdater((prev) => !prev);
  //       closeModal();
  //     } else {
  //       toast(event, { toastId: 'successToast' });
  //     }
  //   };

  //   window.electron.ipcRenderer.once('nodeEndQuery', handlepreReqEndQuery);

  //   return () => {
  //     window.electron.ipcRenderer.removeListener(
  //       'nodeEndQuery',
  //       handlepreReqEndQuery,
  //     );
  //   };
  // }, []);

  return (
    <div className="NodeIndexModal">
      <Modal
        isOpen={modalIsOpen}
        contentLabel="Node Index Modal"
        className={'TalentModalBG'}
        onRequestClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="preReqWrap ">
          <h4>Delete Confirmation</h4>
          <div className="codeBlocks nodeBlocks">
            {Array.from({ length: sqlQueries.length }).map((_, index) => {
              return (
                <Code
                  text={sqlQueries[index]}
                  language="sql"
                  theme={atomOneDark}
                  customStyle={{ fontSize: '12px' }}
                />
              );
            })}
          </div>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DeleteModal;
