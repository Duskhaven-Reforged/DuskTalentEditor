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
  sqlQueries: string[];
  setUpdater: React.Dispatch<React.SetStateAction<boolean>>;
  setModal: boolean;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { class: className } = useParams();

  useEffect(() => {
    setModalIsOpen(props.setModal);
  }, [props.setModal]);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  function handleSubmit(event: React.FormEvent) {
    props.sqlQueries.forEach((sql) => {
      window.electron.ipcRenderer.sendMessage('nodeEndQuery', sql);
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

    window.electron.ipcRenderer.once('nodeEndQuery', handlepreReqEndQuery);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'nodeEndQuery',
        handlepreReqEndQuery,
      );
    };
  }, []);

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
            {Array.from({ length: props.sqlQueries.length }).map((_, index) => {
              return (
                <Code
                  text={props.sqlQueries[index]}
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
