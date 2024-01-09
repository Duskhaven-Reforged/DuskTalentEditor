import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import './ToolTip.css';

const TooltipComponent = (props: { tip: string; tipId: string }) => {
  return (
    <div>
      <a
        data-tooltip-id={props.tipId}
        data-tooltip-content={props.tip}
        className="tooltipHover"
      >
        <FontAwesomeIcon icon={faCircleInfo} color="#757575" />
      </a>
      <Tooltip id={props.tipId} content={props.tip} />
    </div>
  );
};

export default TooltipComponent;
