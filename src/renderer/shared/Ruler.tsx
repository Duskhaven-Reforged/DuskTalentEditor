import './Ruler.css';

type RulerProps = {
  numbers: number[];
  vertical?: boolean;
};

const Ruler = ({ numbers, vertical }: RulerProps) => {
  const rulerClass = vertical ? 'ruler-vertical' : 'ruler';
  const cellClass = vertical ? 'ruler-cell-vertical' : 'ruler-cell';

  return (
    <div className={rulerClass}>
      {numbers.map((number) => (
        <div key={number} className={cellClass}>
          {number}
        </div>
      ))}
    </div>
  );
};

export default Ruler;
