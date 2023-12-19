import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { preReqTalents } from './types/forge_talent_prereq.type';

const PreReqModal = (props: { spellid: number }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [preReq, setPreReq] = useState<preReqTalents[]>([]);

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    console.log(preReq);
  }, [preReq]);

  useEffect(() => {
    const handleGetPreReq = (event: any, args: any) => {
      const reqs: preReqTalents[] = event;
      if (reqs) {
        setPreReq(reqs);
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

  useEffect(() => {});

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage(
      'preReqQuery',
      `SELECT * FROM forge_talent_prereq WHERE spellid = ${props.spellid}`,
    );
  }, [props.spellid]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
  }

  return (
    <div className="talentWrapper">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="PreReq Modal"
        className={'TalentModalBG'}
      >
        <form onSubmit={handleSubmit} className="talentModalForm">
          <label>
            reqID: <input></input>
          </label>
          <button type="submit">Submit</button>
        </form>
      </Modal>
      <div onClick={openModal}>Set Ranks</div>
    </div>
  );
};

export default PreReqModal;
