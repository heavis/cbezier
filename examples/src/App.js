import './App.css';
import Ellipse from './Ellipse';
// import Ellipse from './Ellipse';
import EllipseWithCBzier from './EllipseWithCBezier';
import Animation from './Animation';
import Chart from './Chart';
import Offset from './Offset';
import CWindow from './cwindow';
import CMouse from './cmouse';


function App() {
  return (
    <div className="App">
      <CWindow></CWindow>
      <CMouse></CMouse>
      <Offset></Offset>
      <Ellipse></Ellipse>
      <EllipseWithCBzier></EllipseWithCBzier>
      {/* <Animation></Animation> */}
      <Chart></Chart>
    </div>
  );
}

export default App;
