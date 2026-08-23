
import {FC, useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import {WithChildren} from '../../../helpers'


const Portal: FC<{className?: string} & WithChildren> = ({children, className = ''}) => {
  const [container] = useState(document.createElement('div'))

  if (className) container.classList.add(className)

  useEffect(() => {
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [])

  return createPortal(children, container)
}

export {Portal}