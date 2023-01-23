import { secondsToMinutes } from '../utils/secondsToMinutes';

interface Props {
  mainTime: number;
}

export function Timer(props: Props) {
  return <div className='timer'>{secondsToMinutes(props.mainTime)}</div>;
}
