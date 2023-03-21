import './App.css';
import Ellipse from './Ellipse';
// import Ellipse from './Ellipse';
import EllipseWithCBzier from './EllipseWithCBezier';
import Animation from './Animation';
import Chart from './Chart';
import Offset from './Offset';


function App() {
  return (
    <div className="App">
      <Offset></Offset>
      <Ellipse></Ellipse>
      <EllipseWithCBzier></EllipseWithCBzier>
      <Animation></Animation>
      <Chart></Chart>
    </div>
  );
}

export default App;
