import ConnectionBar from './components/ConnectionBar';
import FilterPanel from './components/FilterPanel';
import EventsList from './components/EventsList';
import KpiCards from './components/KpiCards';
import LiveChart from './components/LiveChart';
import Loading from './components/Loading';
import { useLiveStream } from './hooks/useLiveStream';
import './App.css';

function App() {
  const {
    status,
    errorMessage,
    filteredEvents,
    chartData,
    kpis,
    severityFilter,
    timeWindow,
    bufferSize,
    throttleMs,
    setSeverityFilter,
    setTimeWindow,
    setBufferSize,
    setThrottleMs,
    pause,
    resume,
    simulateDrop,
  } = useLiveStream();

  const showInitialLoading = status === 'connecting' && filteredEvents.length === 0;

  return (
    <div className="app">
      <header className="app__header">
        <img className="app__logo" src="/logo.svg" alt="" width={48} height={48} />
        <div>
          <p className="app__eyebrow">Suadeo assessment</p>
          <h1>Live Monitoring Dashboard</h1>
          <p className="app__subtitle">
            Real-time stream with throttled UI updates, bounded memory, and validated payloads.
          </p>
        </div>
      </header>

      <div className="app__controls">
        <ConnectionBar
          status={status}
          errorMessage={errorMessage}
          onPause={pause}
          onResume={resume}
          onSimulateDrop={simulateDrop}
        />
        <FilterPanel
          severityFilter={severityFilter}
          timeWindow={timeWindow}
          bufferSize={bufferSize}
          throttleMs={throttleMs}
          onSeverityChange={setSeverityFilter}
          onTimeWindowChange={setTimeWindow}
          onBufferSizeChange={setBufferSize}
          onThrottleChange={setThrottleMs}
        />
      </div>

      {showInitialLoading ? (
        <Loading />
      ) : (
        <main className="app__main">
          <KpiCards kpis={kpis} timeWindow={timeWindow} severityFilter={severityFilter} />
          <div className="app__split">
            <LiveChart data={chartData} />
            <EventsList events={filteredEvents} />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
