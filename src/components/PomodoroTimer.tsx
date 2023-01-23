import { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';
import { Button } from './Button';
import { Timer } from './Timer';

import bellStart from '../sounds/bell-start.mp3';
import bellFinish from '../sounds/bell-finish.mp3';
import { secondsToTime } from '../utils/secondsToTime';
const audioStartWorking = new Audio(bellStart);
const audioStopWorking = new Audio(bellFinish);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  longRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props) {
  const [mainTime, setMainTime] = useState(props.pomodoroTime);
  const [timeConting, setTimeConting] = useState(false);
  const [working, setWorking] = useState(false);
  const [resting, setResting] = useState(false);
  const [cyclesManager, setCyclesManager] = useState(new Array(props.cycles - 1).fill(true));

  const [completedCycles, setCompletedCycles] = useState(0);
  const [fullWorkingTime, setFullWorkingTime] = useState(0);

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      if (working) setFullWorkingTime(fullWorkingTime + 1);
    },
    timeConting ? 1000 : null,
  );

  const configureWork = useCallback(() => {
    setTimeConting(true);
    setWorking(true);
    setResting(false);
    setMainTime(props.pomodoroTime);
    audioStartWorking.play();
  }, [setTimeConting, setWorking, setResting, setMainTime, props.pomodoroTime]);

  const configureRest = useCallback(
    (long: boolean) => {
      setTimeConting(true);
      setWorking(false);
      setResting(true);

      if (long) {
        setMainTime(props.longRestTime);
      } else {
        setMainTime(props.shortRestTime);
      }
      audioStopWorking.play();
    },
    [setTimeConting, setWorking, setResting, setMainTime, props.longRestTime, props.shortRestTime],
  );

  useEffect(() => {
    if (working) document.body.classList.add('working');
    if (resting) document.body.classList.remove('working');

    if (mainTime > 0) return;

    if (working && cyclesManager.length > 0) {
      configureRest(false);
      cyclesManager.pop();
    } else if (working && cyclesManager.length <= 0) {
      configureRest(true);
      setCyclesManager(new Array(props.cycles - 1).fill(true));
      setCompletedCycles(completedCycles + 1);
    }

    if (resting) configureWork();
  }, [
    working,
    resting,
    mainTime,
    cyclesManager,
    completedCycles,
    configureRest,
    setCyclesManager,
    configureWork,
    props.cycles,
  ]);

  return (
    <div className='pomodoro'>
      <h2>You are: {working ? 'Working' : 'Resting'}</h2>
      <Timer mainTime={mainTime} />
      <div className='controls'>
        <Button text='Work' onClick={() => configureWork()} />
        <Button
          className={!working && !resting ? 'hidden' : ''}
          text={timeConting ? 'Pause' : 'Play'}
          onClick={() => setTimeConting(!timeConting)}
        />
        <Button text='Rest' onClick={() => configureRest(false)} />
      </div>

      <div className='details'>
        <p>Completed cycles: {completedCycles}</p>
        <p>Working time: {secondsToTime(fullWorkingTime)}</p>
      </div>
    </div>
  );
}
