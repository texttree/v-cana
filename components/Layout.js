import { useState } from 'react'

import AppBar from './AppBar'
import SideBar from './SideBar'

function Layout({ backgroundColor, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)

  return (
    <div
      className={`mx-auto min-h-screen ${backgroundColor}`}
      onClick={() => setShowModalStepGoal(false)}
    >
      <AppBar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isStepPage={isStepPage}
        setIsStepPage={setIsStepPage}
        showModalStepGoal={showModalStepGoal}
        setShowModalStepGoal={setShowModalStepGoal}
      />
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main>
        <div className="pt-3 lg:pt-5 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default Layout
