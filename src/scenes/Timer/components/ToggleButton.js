import React from 'react'
import Box from '@material-ui/core/Box'
import IconButton from '@material-ui/core/IconButton'
import styled from 'styled-components'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import { useDispatch, useSelector } from 'react-redux'
import { setNextTimer } from '../actions'
import { STATUSES, TYPES, setTitle } from '../reducer'
import {
  setStatus,
  setTimeLeft,
  setProgress,
  pauseTimer,
  saveInterval,
} from '../actions'
import chime from '../assets/chime.mp3'
import icon from '../assets/alarm.svg'

const ActionIcon = styled(IconButton)`
  border: 1px solid #bababa;
`

const ToggleButton = () => {
  const { status, timeLeft, duration, type } = useSelector(state => state.timer)

  const dispatch = useDispatch()

  const audio = new Audio(chime)

  const calculateTimeLeft = endTime => {
    const difference = +endTime - +new Date()
    let timeLeft = { minutes: 0, seconds: 0 }

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return timeLeft
  }

  const calculateProgress = timeLeft => {
    const secondsTotal = duration * 60
    const secondsLeft = timeLeft.minutes * 60 + timeLeft.seconds

    return 100 / (secondsTotal / secondsLeft)
  }

  const startTimer = () => {
    if (status === STATUSES.running) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    dispatch(setStatus(STATUSES.running))

    const endTime = new Date(
      new Date().getTime() + timeLeft.minutes * 60000 + timeLeft.seconds * 1000
    )

    const interval = setInterval(() => {
      const calculatedTimeLeft = calculateTimeLeft(endTime)
      const calculatedProgress = calculateProgress(calculatedTimeLeft)

      dispatch(setTimeLeft(calculatedTimeLeft))
      dispatch(setProgress(calculatedProgress))

      setTitle(type, calculatedTimeLeft)

      if (!calculatedProgress) {
        setTimeout(() => {
          dispatch(setNextTimer())
          audio.play()

          if (
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const msg =
              type === TYPES.work.id ? 'Take a break ☕️' : 'Start working 👨‍💻'

            new Notification(msg, {
              icon,
              vibrate: [100, 50, 100],
            })
          }
        }, 1000)

        clearInterval(interval)
      }
    }, 200)

    dispatch(saveInterval(interval))
  }

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      {status !== STATUSES.running && (
        <ActionIcon aria-label="start timer" onClick={startTimer}>
          <PlayArrowIcon />
        </ActionIcon>
      )}

      {status === STATUSES.running && (
        <ActionIcon
          aria-label="pause timer"
          onClick={() => {
            dispatch(pauseTimer())
          }}
        >
          <PauseIcon />
        </ActionIcon>
      )}
    </Box>
  )
}

export { ToggleButton }