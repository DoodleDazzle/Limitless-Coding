import { VscDebugStop, VscDebugStepOver, VscDebugContinue } from "react-icons/vsc"

const DebugPanel = ({ breakpoints, onBreakpointChange, isDebugging, onStopDebugging }) => {
  return (
    <div className="debug-panel">
      <div className="debug-toolbar">
        <button onClick={onStopDebugging} className="debug-btn">
          <VscDebugStop /> Stop
        </button>
        <button className="debug-btn">
          <VscDebugStepOver /> Step Over
        </button>
        <button className="debug-btn">
          <VscDebugContinue /> Continue
        </button>
      </div>
      
      <div className="debug-info">
        <h3>Variables</h3>
        <div className="variables-list">
          {/* Variables will be populated during debugging */}
        </div>
        
        <h3>Call Stack</h3>
        <div className="call-stack">
          {/* Call stack will be populated during debugging */}
        </div>
        
        <h3>Breakpoints</h3>
        <div className="breakpoints-list">
          {breakpoints.map(bp => (
            <div key={bp.line} className="breakpoint-item">
              Line {bp.line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DebugPanel
