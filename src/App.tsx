import { useEffect } from 'react';
import * as Three from 'three';
import './css/App.css';
import { Universe } from './lib/ Universe';
import { BoundingBox } from './lib/BoundingBox';
import { SoftBody } from './lib/SoftBody';
import { Sphere } from './lib/Sphere';
import * as dat from 'dat.gui';
import { MeshBasicMaterial } from 'three';

function App() {
  const gui = new dat.GUI();
  const scene = new Three.Scene();
  const camera = new Three.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new Three.WebGLRenderer();
  const universe = new Universe();

  renderer.setSize( window.innerWidth, window.innerHeight );
  const bounding = {x: 3, y: 6}
  
  // Bounding lines
  const boundingBox = new BoundingBox(bounding.x, bounding.y);
  const lineMaterial = new Three.LineBasicMaterial( { color: 0x0000ff});
  const lGeometry = new Three.BufferGeometry().setFromPoints(boundingBox.points);
  var line = new Three.Line(lGeometry, lineMaterial);

  var universeControls = {gravity: 9.84, melting_point: 31};

  scene.add(line)
  // Spheres
  const N = 20;
  for (var i = 0; i < N; i++) {
    let radius = Math.random() * (0.7) + 0.5
    let x = Math.random() * (bounding.x * 2) - bounding.x
    let y = Math.random() * bounding.y * 2 - bounding.y;
    
    let sphere = new Sphere(new Three.SphereGeometry(radius, 32, 16), new Three.MeshNormalMaterial());
    sphere.setY(y);
    sphere.setX(x);
    scene.add(sphere.mesh);
    universe.addObject(sphere)
  }

  camera.position.z = 10;

  useEffect(() => {
    document.querySelector("#canvas-container")!.appendChild(renderer.domElement);
    animate();
    gui.add(universeControls, 'gravity', 0, 30);
    gui.add(universeControls, "melting_point", 1, 150);


  }, []);
  function animate() {
    requestAnimationFrame( animate );
    universe.setGravity(universeControls.gravity)
    
    for(let object of universe.objects) {
      //object.calculateMovement(boundingBox, universe);
      object.setMeltingPoint(universeControls.melting_point);
      object.calculateBuoyancy(boundingBox, universe);
    }


    renderer.render( scene, camera );
  }
  return (
    <div className="App">
      <div id="canvas-container" style={{border: "1px solid black"}}>
      </div>
    </div>
  );
}

export default App;
