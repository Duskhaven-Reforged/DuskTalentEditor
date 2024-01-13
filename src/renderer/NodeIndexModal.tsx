import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { preReqTalents } from './types/forge_talent_prereq.type';
import './PreReqModal.css';
import { Code, atomOneDark } from 'react-code-blocks';
import { toast } from 'react-toastify';
import { choiceNode } from './types/ChoiceNode.type';
import { useParams } from 'react-router-dom';
import { ForgeTalent } from './types/Forge_Talent.type';

const NodeIndexModal = (props: {
  sqlQueries: Record<number, string>;
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
  setModal: React.Dispatch<boolean>;
  isOpen: boolean;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { class: className } = useParams();

  useEffect(() => {
    setModalIsOpen(props.isOpen);
    console.log('NODE MODAL OPEN? ' + props.isOpen);
  }, [props.isOpen]);

  const closeModal = () => {
    setModalIsOpen(false);
    props.setModal(false);
  };

  async function handleSubmit(event: React.FormEvent) {
    for (let keys of Object.keys(props.sqlQueries)) {
      let sql = props.sqlQueries[parseInt(keys)];
      await new Promise<void>((resolve, reject) => {
        window.electron.ipcRenderer.sendMessage('nodeEndQuery', sql);
        window.electron.ipcRenderer.once(
          'nodeEndQuery',
          (event: any, args: any) => {
            resolve();
          },
        );
      });
    }
    props.setUpdater((prev) => !prev);
    console.log('CHANGED UPDATER FROM NODE INDEX');
    closeModal();
  }

  return (
    <div className="NodeIndexModal">
      <Modal
        isOpen={modalIsOpen}
        contentLabel="Node Index Modal"
        className={'TalentModalBG'}
        onRequestClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="preReqWrap ">
          <h4>Node Index Update Confirmation</h4>
          <div className="codeBlocks nodeBlocks">
            {Object.entries(props.sqlQueries).map(([key, value]) => {
              return (
                <Code
                  text={value}
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

export default NodeIndexModal;
