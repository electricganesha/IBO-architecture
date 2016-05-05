$.ajax({
  type: "GET",
  url: "js/three.min.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/Octree.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/MTLLoader.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/OBJMTLLoader.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/JSONLoader.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/FirstPersonControls.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/Tween.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/jscolor.min.js",
  dataType: "script",
  async: false
});

var textureLoader = new THREE.TextureLoader();

var texturaCadeiraHighlight = textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_amarelo_small.jpg');

var texturaCadeiraNormalMap = textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Normals_small.jpg');

texturaCadeiraNormalMap.minFilter = THREE.LinearFilter;

// create the material
var materialcadeiraHighLight = new THREE.MeshPhongMaterial( {
  map: texturaCadeiraHighlight,
  normalMap: texturaCadeiraNormalMap
});

// BOOLEANS

var sittingDown = false; //if the user has clicked on a chair (e.g. is sitting down)

var insideHelp = true;

var isLoading = true; // if the scene is loading

var isSelected = false; // if at least one chair is selected

var mouseIsOnMenu = false; // if the mouse is over the menu

var mouseIsOutOfDocument = false; // if the mouse is over the menu

var isPerspectiveOrtho = false; // if we are in 2D perspective

var isVR = false; // if we are in VR view

var sittingDownOrtho = false; //if the user has clicked on a chair and before was orthographic (e.g. is sitting down)

var lastCameraPositionBeforeTween;

var lastControlsLat;

var lastControlsLon;

// 3D SCENE

var controls;

var loaderJSON = new THREE.JSONLoader();

var clock = new THREE.Clock();

var container;

var camera, scene, renderer, renderVR, vr;

var firstTimeRunning = true;
var firstTimeLoading = true;
var firstTimeInit = true;

// RAYCASTING

// we are using an octree for increasing the performance on raycasting
var octree = new THREE.Octree( {
  undeferred: true,
  depthMax: 310,
  objectsThreshold: 8,
  overlapPct: 0.15
} );

var intersected; // to know if an object was intersected by a ray

// 3D OBJECT ARRAYS

var chairGroup = new THREE.Object3D(); // the array where we add all the instances of chairs, to then raycast and select

var loaderMesh = new THREE.Mesh(); // the mesh that appears on loading

// RANDOM

var screenReferenceSphere; // the sphere (invisible) located in the middle of the screen, to lookAt

var plane; // the video screen

//WEB AUDIO
// Detect if the audio context is supported.
window.AudioContext = (
  window.AudioContext ||
  window.webkitAudioContext ||
  null
);

var AudioContext = window.AudioContext || window.webkitAudioContext;

if (!AudioContext) {
  throw new Error("AudioContext not supported!");
}

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

  // Create a new audio context.
  var audioCtx = new AudioContext();

  var panner = audioCtx.createPanner();

  var listener = audioCtx.listener;
  listener.setPosition(0,0,-5);
  listener.setOrientation(-1,0,0,0,1,0);

  var gainNode = audioCtx.createGain();

  var source;

// WEB AUDIO
function setupAudioProcessing()
{

  panner.refDistance = 1;
  panner.maxDistance = 10000;
  panner.rolloffFactor = 0.1;
  panner.coneInnerAngle = 0;
  panner.coneOuterAngle = 45;
  panner.coneOuterGain = 1;
  panner.setPosition(-6,1.5,0);
  panner.setOrientation(1,0,0);

  source = audioCtx.createMediaElementSource(video);
  source.connect(panner);

  panner.connect(audioCtx.destination);
}

// STRUCTURAL / DOM / RENDERER

renderer = new THREE.WebGLRenderer({ precision: "lowp", antialias:true });
renderer.setSize( window.innerWidth, window.innerHeight );
element = renderer.domElement;
container = document.body;
container.appendChild(element);


// Load the initial scenes

mainScene = new THREE.Scene();
startLoadingScene();

if(firstTimeRunning){
  firstTimeRunning = false;
  loadScene();
}

//
// LOADING MANAGERS
//
// check if all the models were loaded
THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
  if(loaded == total && firstTimeLoading)
  {
    firstTimeLoading = false;
    $('#loadingDiv').hide();
    init();
  }
};

// if all models were loaded successfully
THREE.DefaultLoadingManager.onLoad = function () {
  ('all items loaded');
};

// if there was an error loading the models
THREE.DefaultLoadingManager.onError = function () {
  ('there has been an error');
};

function updatebuttonsplaca(id) {
  switch (id) {
    case 1:
      if(document.getElementById('models1Del').src.indexOf("Botao_apagar") > -1)
      {
        console.log("Botao_mais");
        document.getElementById('models1Del').src = "img/Botao_mais.png";
      }else{
        console.log("Botao_apagar");
        document.getElementById('models1Del').src = "img/Botao_apagar.png";
      }
      document.getElementById('models2Del').src = "img/Botao_mais.png";
      document.getElementById('models3Del').src = "img/Botao_mais.png";
      break;
    case 2:
      if(document.getElementById('models2Del').src.indexOf("Botao_apagar") > -1)
      {
        document.getElementById('models2Del').src = "img/Botao_mais.png";
      }else{
        document.getElementById('models2Del').src = "img/Botao_apagar.png";
      }
      document.getElementById('models1Del').src = "img/Botao_mais.png";
      document.getElementById('models3Del').src = "img/Botao_mais.png";
      break;
    case 3:
      if(document.getElementById('models3Del').src.indexOf("Botao_apagar") > -1)
      {
        document.getElementById('models3Del').src = "img/Botao_mais.png";
      }else{
        document.getElementById('models3Del').src = "img/Botao_apagar.png";
      }
      document.getElementById('models2Del').src = "img/Botao_mais.png";
      document.getElementById('models1Del').src = "img/Botao_mais.png";
      break;
  }
}

function menu(){
  var primeira = true;
  var selected;
   document.getElementById("menuBTEsquerda").onclick = function() {
     document.getElementById('menuEsquerda').style.display = "block";
     document.getElementById('trianguloImgEsquerda').style.display = "block";
     document.getElementById('trianguloImgCentro').style.display = "none";
     document.getElementById('trianguloImgDireita').style.display = "none";
   }

   document.getElementById("menuBTEsquerda").onmouseover = function() {
     document.getElementById('menuBTEsquerda').style.backgroundImage = "url('img/Vicoustic_botoes-press-ing_0000_Layer-1.png')";
   }

   document.getElementById("menuBTEsquerda").onmouseout = function() {
     document.getElementById('menuBTEsquerda').style.backgroundImage = "url('img/Vicoustic_botoes-normal-ing_0000_Layer-1.png')";
   }

   /*------------------------------------------*/

   document.getElementById("models1Del").onclick = function() {
     updatebuttonsplaca(1);
   }

   document.getElementById("models2Del").onclick = function() {
     updatebuttonsplaca(2);
   }

   document.getElementById("models3Del").onclick = function() {
     updatebuttonsplaca(3);
   }



   /*------------------------------------------*/

  document.getElementById("menuBTCentro").onclick = function() {
    document.getElementById('menuEsquerda').style.display = "block";
    document.getElementById('trianguloImgCentro').style.display = "block";
    document.getElementById('trianguloImgEsquerda').style.display = "none";
    document.getElementById('trianguloImgDireita').style.display = "none";
  }

  document.getElementById("menuBTCentro").onmouseover = function() {
    document.getElementById('menuBTCentro').style.backgroundImage = "url('img/Vicoustic_botoes-press-ing_0001_Layer-2.png')";
  }

  document.getElementById("menuBTCentro").onmouseout = function() {
    document.getElementById('menuBTCentro').style.backgroundImage = "url('img/Vicoustic_botoes-normal-ing_0001_Layer-2.png')";
  }

  /*------------------------------------------*/

  document.getElementById("menuBTDireita").onclick = function() {
    document.getElementById('menuEsquerda').style.display = "block";
    document.getElementById('trianguloImgDireita').style.display = "block";
    document.getElementById('trianguloImgCentro').style.display = "none";
    document.getElementById('trianguloImgEsquerda').style.display = "none";
  }

  document.getElementById("menuBTDireita").onmouseover = function() {
    document.getElementById('menuBTDireita').style.backgroundImage = "url('img/Vicoustic_botoes-press-ing_0002_Layer-0.png')";
  }

  document.getElementById("menuBTDireita").onmouseout = function() {
    document.getElementById('menuBTDireita').style.backgroundImage = "url('img/Vicoustic_botoes-normal-ing_0002_Layer-0.png')";
  }

  /*------------------------------------------*/

  document.getElementById("closeBt").onclick = function() {
    document.getElementById('menuEsquerda').style.display = "none";
  }

  document.getElementById("models1").onclick = function() {
  }

  document.getElementById("models2").onclick = function() {
  }

  document.getElementById("models3").onclick = function() {
  }


  $('#menuDiv').bind('mouseenter' ,"*", function(e){
    mouseIsOnMenu = true;
    controls.lookSpeed = 0;
  },false);

  $('#menuDiv').bind('mouseleave', "*", function(e){
    mouseIsOnMenu = false;
  },false);

  $('#colorPicker').bind('mouseenter' ,"*", function(e){
    mouseIsOnMenu = true;
    controls.lookSpeed = 0;
  },false);

  $('#colorPicker').bind('mouseleave', "*", function(e){
    mouseIsOnMenu = false;
  },false);
}
//
// This method shows the loading scene, while the items are not loaded
//
function startLoadingScene() {
  loadingScene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);

  var light = new THREE.AmbientLight( 0xffffff ); // soft white light
  loadingScene.add( light );

  camera.position.set(0, 0, 2);
  camera.lookAt(loadingScene.position);

  currentScene = loadingScene;

  var loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = " loading ... ";
  loadingDiv.style.position = "absolute";
  loadingDiv.style.width = "100%";
  loadingDiv.style.textAlign = "center";
  loadingDiv.id = "loadingDiv";
  loadingDiv.style.fontFamily = "osr";
  loadingDiv.style.color = "#FFF";
  loadingDiv.style.top = '65%';
  loadingDiv.style.fontSize = "24px";
  document.body.appendChild(loadingDiv);

  loadingDiv.style.animation = "coloranimLoading 1.5s infinite";
  loadingDiv.style.webkitAnimation = "coloranimLoading 1.5s infinite";

  loader = new THREE.JSONLoader();
  loader.load( "models/cadeiraloading.js", function( geometry,materials ) {

  material1 = new THREE.MeshPhongMaterial(
  {
  map : materials[0].map,
  normalMap : textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Normals_small.jpg'),
  });
  materials[0] = material1;

  material2 = new THREE.MeshPhongMaterial(
  {
  map : materials[1].map,
  normalMap : textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Normals_small.jpg'),
  });
  materials[1] = material2;

  material3 = new THREE.MeshPhongMaterial(
  {
  map : materials[2].map,
  normalMap : textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Normals_small.jpg'),
  });
  materials[2] = material3;

  loaderMesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );

  loadingScene.add(loaderMesh);

  });

}

//
// Here we initialise all the needed variables, like the stats, camera, and controls
//
function fullscreen() {
  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
    document.getElementById("ptrocafsImg").src="img/exit-full-screen.png";
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    document.getElementById("ptrocafsImg").src="img/full-screen-button.png";
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}


function init() {
  menu();
  setupAudioProcessing();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 15 );

  camera.position.x = -6.160114995658247;
  camera.position.y = 1.5;
  camera.position.z = 0.009249939938009306;

  controls = new THREE.FirstPersonControls(camera);
  controls.lon = 0;
  controls.lat = -15;

  controls.lookVertical = true;
  controls.constrainVertical = true;
  controls.verticalMin = THREE.Math.degToRad(70);
  controls.verticalMax = THREE.Math.degToRad(130);

  controls.minPolarAngle = 0; // radians
  controls.maxPolarAngle = Math.PI; // radians

  controls.movementSpeed = 0;
  controls.autoForward = false;


  // lights
  var light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1.0 );
  mainScene.add( light );

  // model
  group = new THREE.Object3D();

  //event listeners
  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('mousedown', onMouseDown, false);
  document.addEventListener('mousewheel', onMouseWheel, false);

  $(window).mouseleave(function() {
    // cursor has left the building
    mouseIsOutOfDocument = true;
    controls.lookSpeed = 0;
  })
  $(window).mouseenter(function() {
    // cursor has entered the building
    mouseIsOutOfDocument = false;
  })

  window.addEventListener( 'resize', onWindowResize, false );

  isLoading = false;
  firstTimeInit = false;
}

//
// Load the main Scene
//
function loadScene() {
  // load venue status from DB

  // TEXTURES
  var texturaBracoNormalMap = textureLoader.load('models/Cinema_Motta/Braco_Novo/BracoCadeira_Normal_small.jpg');
  var texturaBraco = textureLoader.load('models/Cinema_Motta/Braco_Novo/BracoCadeira_Diffuse_small.jpg');
  // create the material
  var materialcadeiraMobileHighlight = new THREE.MeshBasicMaterial( {
    map: textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_amarelo_small.jpg'),
  });

  // create the material
  var materialcadeiraMobile = new THREE.MeshBasicMaterial( {
    map: textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_vermelho_small.jpg'),
  });

  // create the material
  var materialcadeiraHighLight = new THREE.MeshPhongMaterial( {
    map: textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_amarelo_small.jpg'),
    normalMap: textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Normals_small.jpg'),
  });

  // create the material
  var materialcadeiraNormal = new THREE.MeshPhongMaterial( {
    map: textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_amarelo_small.jpg'),
    normalMap: textureLoader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Normals_small.jpg'),
  });

  loadSala();
  loadCadeiras(populateCadeirasInstances,materialcadeiraNormal,materialcadeiraHighLight);
  loadBracos(populateBracosInstances,texturaBracoNormalMap,texturaBraco);

  // load the model for the EYE icon
  loader.load( "models/Cinema_Motta/olho_v03.js", function( geometry,materials ) {
    spriteEyeModel = new THREE.Mesh(geometry,materials);
  });

  // create the cinema screen
  var geometry = new THREE.PlaneGeometry( 7, 2.5, 10, 10);
  var material = new THREE.MeshBasicMaterial( {side:THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.x = -6.5;
  plane.position.y = 1.2;
  plane.rotation.y = Math.PI/2;
  //mainScene.add( plane );
}

//
// Here we load the venue model
//
function loadSala() {
  var loaderJSON = new THREE.JSONLoader();

  loaderJSON.load( "models/Cinema_Motta/placafrente.js", function( geometry,material ) {

    material = new THREE.MeshBasicMaterial({
      color:0x000000,
    });

    material.combine = THREE.MixOperation;

    testePlacas = new THREE.Mesh(geometry,material);
    testePlacas.name="placatras";
    mainScene.add(testePlacas);
  });

  loaderJSON.load( "models/Cinema_Motta/placatras.js", function( geometry,material ) {


    texturaAlpha = textureLoader.load('models/organic.jpg');

    texturaAlpha.wrapS = THREE.RepeatWrapping;
    texturaAlpha.wrapT = THREE.RepeatWrapping;
    texturaAlpha.repeat.set( 4, 8 );

    texturaNormal = textureLoader.load('models/chesterfield-normal.png');

    material = new THREE.MeshBasicMaterial({
      transparent:true,
      opacity:0.8,
      alphaMap:texturaAlpha,
      normalMap:texturaNormal,
    });

    material.combine = THREE.MixOperation;

    testePlacas = new THREE.Mesh(geometry,material);
    testePlacas.name="placafrente";
    mainScene.add(testePlacas);
  });

  loaderJSON.load( "models/Cinema_Motta/placaDireitaFrente.js", function( geometry,material ) {

    material = new THREE.MeshBasicMaterial({
      color:0x000000,
    });

    material.combine = THREE.MixOperation;

    testePlacas = new THREE.Mesh(geometry,material);
    testePlacas.name="placaDireitaTras";
    mainScene.add(testePlacas);
  });

  loaderJSON.load( "models/Cinema_Motta/placaDireitaTras.js", function( geometry,material ) {


    texturaAlpha = textureLoader.load('models/organic.jpg');

    texturaAlpha.wrapS = THREE.RepeatWrapping;
    texturaAlpha.wrapT = THREE.RepeatWrapping;
    texturaAlpha.repeat.set( 4, 8 );

    texturaNormal = textureLoader.load('models/chesterfield-normal.png');

    material = new THREE.MeshBasicMaterial({
      transparent:true,
      opacity:0.8,
      alphaMap:texturaAlpha,
      normalMap:texturaNormal,
    });

    material.combine = THREE.MixOperation;

    testePlacas = new THREE.Mesh(geometry,material);
    testePlacas.name="placaDireitaFrente";
    mainScene.add(testePlacas);
  });

  loaderJSON.load( "models/Cinema_Motta/placaCentroTras.js", function( geometry,material ) {

    material = new THREE.MeshBasicMaterial({
      color:0x000000,
    });

    material.combine = THREE.MixOperation;

    testePlacas = new THREE.Mesh(geometry,material);
    testePlacas.position.x = testePlacas.position.x-0.7;
    testePlacas.position.y = testePlacas.position.y+0.7;
    testePlacas.name="placaCentroTras";
    mainScene.add(testePlacas);
  });

  loaderJSON.load( "models/Cinema_Motta/placaCentroFrente.js", function( geometry,material ) {


    texturaAlpha = textureLoader.load('models/organic.jpg');

    texturaAlpha.wrapS = THREE.RepeatWrapping;
    texturaAlpha.wrapT = THREE.RepeatWrapping;
    texturaAlpha.repeat.set( 4, 8 );

    texturaNormal = textureLoader.load('models/chesterfield-normal.png');

    material = new THREE.MeshBasicMaterial({
      transparent:true,
      opacity:0.8,
      alphaMap:texturaAlpha,
      normalMap:texturaNormal,
    });

    material.combine = THREE.MixOperation;

    testePlacas = new THREE.Mesh(geometry,material);
    testePlacas.position.x = testePlacas.position.x-0.7;
    testePlacas.position.y = testePlacas.position.y+0.7;
    testePlacas.name="placaCentroFrente";
    mainScene.add(testePlacas);
  });

  // load JSON model
  loaderJSON.load( "models/Cinema_Motta/Sala_Baked_03.js", function( geometry, materials ) {

    materials[0] = new THREE.MeshBasicMaterial(materials[0]);
    materials[1] = new THREE.MeshBasicMaterial(materials[1]);
    materials[2] = new THREE.MeshBasicMaterial(materials[2]);
    materials[3] = new THREE.MeshBasicMaterial(materials[3]);

    material1 = new THREE.MeshBasicMaterial();
    material1.map = materials[0].map;
    material1.map.magFilter = THREE.NearestFilter;
    material1.map.minFilter = THREE.LinearMipMapNearestFilter;
    material1.map.anisotropy = 16;
    material1.overdraw = 1.0;
    materials[0] = material1;

    material2 = new THREE.MeshBasicMaterial();
    material2.map = materials[1].map;
    material2.map.magFilter = THREE.NearestFilter;
    material2.map.minFilter = THREE.LinearMipMapNearestFilter;
    material2.map.anisotropy = 16;
    material2.overdraw = 1.0;
    materials[1] = material2;

    material3 = new THREE.MeshBasicMaterial();
    material3.map = materials[2].map;
    material3.map.magFilter = THREE.NearestFilter;
    material3.map.minFilter = THREE.LinearMipMapNearestFilter;
    material3.map.anisotropy = 16;
    material3.overdraw = 1.0;
    materials[2] = material3;

    material4 = new THREE.MeshBasicMaterial();
    material4.map = materials[3].map;
    material4.map.magFilter = THREE.NearestFilter;
    material4.map.minFilter = THREE.LinearMipMapNearestFilter;
    material4.map.anisotropy = 16;
    material4.overdraw = 1.0;
    materials[3] = material4;


    var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ));

    mesh.position.x = mesh.position.x-0.2;
    mesh.position.y = mesh.position.y+0.3;

    mainScene.add(mesh);

    // here we compute the bounding box of the model, to find the centroid
    mesh.geometry.computeBoundingBox();

    var centroid = new THREE.Vector3();
    centroid.addVectors( mesh.geometry.boundingBox.min, mesh.geometry.boundingBox.max );
    centroid.multiplyScalar( - 0.5 );

    centroid.applyMatrix4( mesh.matrixWorld );

    // here we add the lookAt sphere to the screen
    var geometry = new THREE.SphereGeometry( 0.25, 12, 12 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    screenReferenceSphere = new THREE.Mesh( geometry, material );
    screenReferenceSphere.position.x = -6.160114995658247;
    screenReferenceSphere.position.y = 1.0;
    screenReferenceSphere.position.z = 0.009249939938009306;

  } );

}

//
// here we load the chairs
//
function loadCadeiras(populateCadeirasInstances,materialcadeiraNormal,materialcadeiraHighLight) {

  var loaderJSON = new THREE.JSONLoader();

  // 1. load the point cloud that contains the position referece and the rotation reference for each chair
  loaderJSON.load( "models/Cinema_Motta/Pcloud_oriented_Cadeiras.js", function( geometry, material, normals ) {

    mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );

    normalsArray = [];

    // the normals array contains the normal vector (mesh orientation) for each instance
    for(i=0 ; i<normals.length ; i+=3)
    {
      normalVector = new THREE.Vector3(normals[i], normals[i+1], normals[i+2]);
      normalsArray.push(normalVector);
    }
  });
  // 2. load the model itself (only once) to replicate and get the geometry to pass along
  var loaderOBJ = new THREE.OBJMTLLoader();
  loaderOBJ.load( 'models/Cinema_Motta/Cadeira_Nova/Cadeira_Nova.obj', 'models/Cinema_Motta/Cadeira_Nova/Cadeira_Nova.mtl', function ( object ) {
    var bufferGeometry;
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh && child.geometry != "undefined") {
        bufferGeometry = child.geometry;
      }
    });
    populateCadeirasInstances(mesh,normalsArray,bufferGeometry,materialcadeiraNormal,materialcadeiraHighLight); // we carry on through a callback to load the models synchronously
  });
}

//
// 3. here we iterate on the point cloud to replicate the instances and position each instance in the correct place
//
function populateCadeirasInstances(mesh, normalsArray, bufferGeometry,materialcadeiraNormal) {
  // get the origin (from) and vertical axis vectors
  var from = new THREE.Vector3( 0,0,0 );
  var vAxis = new THREE.Vector3( -1,0,0 );

  sphereGeo = new THREE.SphereGeometry( 0.1, 6, 6 );

  var genericObject = new THREE.Mesh(bufferGeometry,materialcadeira);

  singleGeometryNormal = new THREE.Geometry();

  var materials = [];

  materials.push(materialcadeiraNormal);

  // for each point in the point cloud
  for(i=0; i<mesh.geometry.vertices.length; i++){
    var vertex = mesh.geometry.vertices[i];

    var materialcadeira = materialcadeiraNormal.clone();

    // create the new instance
    newObject = genericObject.clone(genericObject);
    genericObject.material = materialcadeira;

    // if this instance has a normal vector
    if (normalsArray[i] != null){

      // calculate the orientation vector
      var to = new THREE.Vector3( normalsArray[i].x,normalsArray[i].y,normalsArray[i].z );
      var direction = to.clone().sub(from);
      var length = direction.length();

      // position the instance in the point
      newObject.position.x = vertex.x;
      newObject.position.y = vertex.y;
      newObject.position.z = vertex.z;

      // calculate the quaternion from the vertical axis and the computed normal vector
      var quaternion = new THREE.Quaternion().setFromUnitVectors( vAxis.normalize(),to.normalize()  );
      newObject.setRotationFromQuaternion(quaternion);

      // identify the instance
      newObject.name = "CADEIRA_" + i;
      newObject.updateMatrix();
      mesh.geometry.colorsNeedUpdate = true;

      var cadeiraCorrente = "";

        newObject.estado = "LIVRE";
        singleGeometryNormal.merge(newObject.geometry, newObject.matrix, 0);
      octree.add( newObject);

    }
  }
  //add to scene
  var meshSG = new THREE.Mesh(singleGeometryNormal, new THREE.MeshFaceMaterial(materials));
  meshSG.name = "singleGeometryNormal";
  mainScene.add(meshSG);
}

//
// here we load the chair arms
//
function loadBracos(populateBracosInstances,texturaBracoNormalMap,texturaBraco){
  // single geometry for geometry merge
  var singleGeometry = new THREE.Geometry();

  // chair arm material
  var material = new THREE.MeshPhongMaterial({
    map: texturaBraco,
    specular : [0.1, 0.1, 0.1],
    shininess : 120.00,
    normalMap: texturaBracoNormalMap
  });

  var meshBracos = [];
  var normalsArrayBracos = [];
  var normalVector = new THREE.Vector3(0,0,0);

  // 1. load the point cloud that contains the position referece and the rotation reference for each chair
  loaderJSON.load( "models/Cinema_Motta/Pcloud_oriented_Bracos.js", function( geometry, material, normals ) {

    meshBracos = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
    for(i=0 ; i<normals.length ; i+=3)
    {
      normalVector = new THREE.Vector3(normals[i], normals[i+1], normals[i+2]);
      normalsArrayBracos.push(normalVector);
    }

  });

  // 2. load the model itself (only once) to replicate and get the geometry to pass along
  var loaderOBJ = new THREE.OBJMTLLoader();
  loaderOBJ.load( 'models/Cinema_Motta/Braco_Novo/Braco_Novo.obj', 'models/Cinema_Motta/Braco_Novo/Braco_Novo.mtl', function ( object ) {
    var preNewObject;
    object.traverse(function(child) {
      //(child.name);
      if (child instanceof THREE.Mesh && child.geometry != "undefined"){
        preNewObject = new THREE.Mesh( child.geometry, material );
      }
    });
    populateBracosInstances(singleGeometry,meshBracos,normalsArrayBracos,normalVector,preNewObject,material);
  });

}

//
// 3. here we iterate on the point cloud to replicate the instances and position each instance in the correct place
//
function populateBracosInstances(singleGeometry,meshBracos,normalsArrayBracos,normalVector,preNewObject,material) {
  var newBraco;

  // vertical axis and origin (from) vectors
  var vAxis = new THREE.Vector3( -1,0,0 );
  var from = new THREE.Vector3( 0,0,0 );

  // for each point in the point cloud
  for(i=0; i<meshBracos.geometry.vertices.length; i++){

    // get point from point cloud
    var vertex = meshBracos.geometry.vertices[i];

    newBraco = preNewObject.clone();

    // normal vector (orientation)
    var to = new THREE.Vector3( normalsArrayBracos[i].x,normalsArrayBracos[i].y,normalsArrayBracos[i].z );

    var direction = to.clone().sub(from);
    var length = direction.length();

    newBraco.position.x = vertex.x;
    newBraco.position.y = vertex.y;
    newBraco.position.z = vertex.z;

    // set rotation from quaternion
    var quaternion = new THREE.Quaternion().setFromUnitVectors( vAxis.normalize(),to.normalize()  );
    newBraco.setRotationFromQuaternion(quaternion);

    newBraco.updateMatrix();

    // merge each new instance into a single geometry to optimize
    singleGeometry.merge(newBraco.geometry, newBraco.matrix);
  }
  //add to scene
  var meshSG = new THREE.Mesh(singleGeometry, material);
  mainScene.add(meshSG);
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//
// Mouse Move Event
//
// retrieve mouse coordinates
var mouse = new THREE.Vector2();
function onMouseMove(e) {

  mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
  mouse.y = 1 - 2 * (e.clientY / window.innerHeight);

  if(mouse.y > -0.99 && mouse.y <-0.56)
  {
    mouseIsOnMenu = true;
    controls.lookSpeed = 0;
  }
  else {
    mouseIsOnMenu = false;
  }

  // define the look speed through the mouse position
  // if mouse is moving to the edges of the screen, speed increases
  if(!isSelected && !sittingDown && !mouseIsOnMenu && !mouseIsOutOfDocument)
  controls.lookSpeed = (Math.abs(mouse.x) + Math.abs(mouse.y)) * 0.05;
  else if (isSelected && !sittingDown && !mouseIsOnMenu && !mouseIsOutOfDocument)
  controls.lookSpeed = 0.10;
  else if (sittingDown)
  controls.lookSpeed = (Math.abs(mouse.x) + Math.abs(mouse.y)) * 0.2;

  // if we are in the cinema overview
  if(!sittingDown)
  {
    // normal raycasting variables
    var intersectedOne = false;
    var intersectedObject = new THREE.Object3D();

    var raycaster = new THREE.Raycaster();

    var intersections;

    raycaster.setFromCamera( mouse, camera );

    // search the raycasted objects in the octree
    octreeObjects = octree.search( raycaster.ray.origin, raycaster.ray.far, true, raycaster.ray.direction );

    intersections = raycaster.intersectOctreeObjects( octreeObjects );

    // if there is an intersection
    if ( intersections.length > 0 ) {

      // Check if the objects are in front of each other
      var intersectionIndex = 0;

      for(var i = 0 ; i < intersections.length ; i++)
      {
        var lowerX = intersections[0].object.position.x;

        if( intersections[i].object.position.x < lowerX){
          lowerX = intersections[i].object.position.x;
          intersectionIndex = i;
        }
      }

      intersectionObject = intersections[intersectionIndex].object;

      var highLightChair;

      // if previously intersected object is not the current intersection and is not a sprite
      if ( intersected != intersectionObject && !mouseIsOnMenu && !mouseIsOutOfDocument) {

        // if there was a previously intersected object
        if ( intersected )
        {
          var selectedObject = mainScene.getObjectByName("highLightChair");
          mainScene.remove( selectedObject );
        }

        intersected = intersectionObject;

        highLightChair = new THREE.Mesh(intersected.geometry,materialcadeiraHighLight);

        intersected.geometry.computeBoundingBox();

        var centroid = new THREE.Vector3();
        centroid.addVectors( intersected.geometry.boundingBox.min, intersected.geometry.boundingBox.max );

        centroid.applyMatrix4( intersected.matrixWorld );

        highLightChair.scale.set(1.15,1.00,1.05);

        highLightChair.rotation.set(intersected.rotation.x,intersected.rotation.y,intersected.rotation.z+0.035);

        highLightChair.position.set(centroid.x-0.005,centroid.y-0.006,centroid.z);

        mainScene.add(highLightChair);
        highLightChair.name = "highLightChair";


            document.body.style.cursor = 'pointer';

      }
    }
    else // if there are no intersections
    {

      // if there was a previous intersection
      if ( intersected ) {
        document.body.style.cursor = 'auto';
      }
      var selectedObject = mainScene.getObjectByName("highLightChair");
      mainScene.remove( selectedObject );
      intersected = null;
      uuidTexturaAntiga = "";
    }
  }

}

var primeiravez = true;

//
// Mouse Click Event
//
function onMouseDown(e) {
  // if we are in the cinema overview
  if(!sittingDown && !mouseIsOnMenu) {
    // normal raycaster variables
    var intersectedOne = false;

    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var raycasterSprite = new THREE.Raycaster();

    mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight);

    raycaster.setFromCamera( mouse, camera );

      octreeObjects = octree.search( raycaster.ray.origin, raycaster.ray.far, true, raycaster.ray.direction );

      var intersects = raycaster.intersectOctreeObjects( octreeObjects );

      var textSelChairs = "";

      // for each intersected object
      for (var i = 0; i < intersects.length; i++) {

        // Check if the objects are in front of each other
        var intersectionIndex = 0;

        for(var i = 0 ; i < intersects.length ; i++)
        {
          var lowerX = intersects[0].object.position.x;

          if( intersects[i].object.position.x < lowerX){
            lowerX = intersects[i].object.position.x;
            intersectionIndex = i;
          }
        }

        var intersection = intersects[intersectionIndex];

        //var intersection = intersects[i];
        var obj = intersection.object;
        var point = intersection.point;

        var fila = "";
        var lugar = "";
        var estado = "";
        var spriteFound = false;

      }

      if(obj != undefined)
      {
          // calculate intersected object centroid
          obj.geometry.computeBoundingBox();

          var centroid = new THREE.Vector3();
          centroid.addVectors( obj.geometry.boundingBox.min, obj.geometry.boundingBox.max );
          centroid.multiplyScalar( - 0.5 );

          centroid.applyMatrix4( obj.matrixWorld );

          // calculate rotation based on two vectors
          var matrix = new THREE.Matrix4();
          matrix.extractRotation( obj.matrix );

          // front vector
          var direction = new THREE.Vector3( -1, 0, 0 );
          matrix.multiplyVector3( direction );

          // vector pointing at the reference sphere
          dis1 = screenReferenceSphere.position.x - obj.position.x ;
          dis2 = screenReferenceSphere.position.y - obj.position.y ;
          dis3 = screenReferenceSphere.position.z - obj.position.z;

          var vector = new THREE.Vector3(dis1,dis2,dis3);

          vector.normalize ();

          // calculate angle between two vectors
          var angle = direction.angleTo( vector );

          changePerspective(centroid.x,centroid.y,centroid.z,obj);
      }
  }
  else if(!sittingDownOrtho && !mouseIsOnMenu) // if clicked when sitting down
  {
    sittingDown = false;
    setupTweenOverview();
  }
}

// variables to check if we scrolled back or forth (zoom effect)
var alreadyScrolledFront = true;
var alreadyScrolledBack = false;

//
// mouse wheel event
//
function onMouseWheel(e) {

  // cross-browser wheel delta
  var e = window.event || e; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

  // check if mouse wheel went back or forth
  if (!mouseIsOnMenu && !mouseIsOutOfDocument){
    switch(delta)
    {
      case(1):
      if(alreadyScrolledFront){
        // tween the fov fowards
        tweenFov = new TWEEN.Tween(camera).to({
          fov:20
        },1000).easing(TWEEN.Easing.Exponential.Out).onUpdate(function () {
          camera.updateProjectionMatrix();
        }).onComplete(function () {
        }).start();
        alreadyScrolledFront=false;
        alreadyScrolledBack=true;
      }
      break;
      case(-1):
      if(alreadyScrolledBack){
        //tween the fov backwards
        tweenFov = new TWEEN.Tween(camera).to({
          fov:60
        },1000).easing(TWEEN.Easing.Exponential.Out).onUpdate(function () {
          camera.updateProjectionMatrix();
        }).onComplete(function () {
        }).start();
        alreadyScrolledFront=true;
        alreadyScrolledBack=false;
      }
      break;
    }
  }
  return false;
}

var up = new THREE.Vector3(0,1,0);

//
// main render function (render cycle)
//
function animate() {

  var vector = new THREE.Vector3(0, 0, -1);
  vector.applyEuler(camera.rotation, camera.rotation.order);
  listener.setOrientation(vector.x,vector.y,vector.z,0,1,0);

  requestAnimationFrame(animate);
  // if we are rendering the loading scene
  if(isLoading)
  {
    renderer.render( loadingScene, camera );
    loaderMesh.rotation.y -= 0.04;
  }
  // if we are rendering the main scene
  else
  {

    renderer.render( mainScene, camera );

    if(controls != undefined)
      controls.update(clock.getDelta()); //for cameras

    octree.update();
    TWEEN.update();

    // if we are in the cinema overview
    if(!sittingDown && controls != undefined)
    {
      // if we reach the edges of the screen with the mouse, the camera stops
      if(controls.lon <= 0){
        if(alreadyScrolledFront){
          if(controls.lon < -15)
          {
            //controls.lookSpeed = 0.001;
            controls.lon = -15;
          }
        }else{
          if(controls.lon < -45)
          {
            controls.lon = -45;
          }
        }
      }
      else
      {
        if(alreadyScrolledFront){
          if(controls.lon > 15)
          {
            controls.lon = 15;
          }
        }else{
          if(controls.lon > 45)
          {
            controls.lon = 45;
          }
        }
      }
    }
  }

}

animate();

//
// if we click the view perspective button or EYE icon
//
function changePerspective(x, y, z,obj) {

  sittingDown = true;

  lastCameraPositionBeforeTween = new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z);
  lastControlsLat = controls.lat;
  lastControlsLon = controls.lon;
  setupTweenFP(obj);

}

//
// launch the Tween for changing perspective to seat perspective
//
function setupTweenFP(obj) {

  TWEEN.removeAll();
  // calculate centroid
  obj.geometry.computeBoundingBox();

  var centroid = new THREE.Vector3();
  centroid.addVectors( obj.geometry.boundingBox.min, obj.geometry.boundingBox.max );
  centroid.multiplyScalar( - 0.5 );

  centroid.applyMatrix4( obj.matrixWorld );

  // tween the fov fowards
  tweenFov = new TWEEN.Tween(camera).to({
    fov:70
  },1000).easing(TWEEN.Easing.Exponential.Out).onUpdate(function () {
    camera.updateProjectionMatrix();
  }).onComplete(function () {
  }).start();

  // tween camera movement
  tweenFP = new TWEEN.Tween(camera.position).to({
    x: centroid.x-0.05,
    y: centroid.y+0.25, // head height
    z: centroid.z
  },2000).easing(TWEEN.Easing.Sinusoidal.InOut).onUpdate(function () {

  }).onComplete(function () {
    listener.setPosition(camera.position.x,camera.position.y,camera.position.z);
  }).start();

  // calculate rotation based on two vectors
  var matrix = new THREE.Matrix4();
  matrix.extractRotation( obj.matrix );

  // front vector
  var direction = new THREE.Vector3( -1, 0, 0 );
  matrix.multiplyVector3( direction );

  // vector pointing at the reference sphere
  dis1 = screenReferenceSphere.position.x - obj.position.x ;
  dis2 = screenReferenceSphere.position.y - obj.position.y ;
  dis3 = screenReferenceSphere.position.z - obj.position.z;

  var vector = new THREE.Vector3(dis1,dis2,dis3);

  vector.normalize ();

  // calculate angle between two vectors
  var angle = direction.angleTo( vector );

  // tween the camera rotation vertically
  tweenLatFP = new TWEEN.Tween(controls).to({
    lat:THREE.Math.radToDeg(angle) + 40,
  },2000).easing(TWEEN.Easing.Sinusoidal.InOut).onUpdate(function () {
  }).onComplete(function () {
  }).start();

  // calculate longitude angle - sideways rotation
  var longAngle;

  if(obj.position.z > 0)
  longAngle = -180+angle*180/Math.PI
  else
  longAngle = 180-angle*180/Math.PI

  // tween the camera rotation sideways
  tweenCamRotationFP = new TWEEN.Tween(controls).to({
    lon:longAngle
  },2000).easing(TWEEN.Easing.Sinusoidal.InOut).onUpdate(function () {
  }).onComplete(function () {
  }).start();
}
//
// launch the Tween for changing perspective to overview perspective
//
function setupTweenOverview() {

  // tween the fov fowards
  tweenFov = new TWEEN.Tween(camera).to({
    fov:60
  },1000).easing(TWEEN.Easing.Exponential.Out).onUpdate(function () {
    camera.updateProjectionMatrix();
  }).onComplete(function () {
  }).start();

  // tween camera position
  tweenOverview = new TWEEN.Tween(camera.position).to({
    x: lastCameraPositionBeforeTween.x,
    y: lastCameraPositionBeforeTween.y,
    z: lastCameraPositionBeforeTween.z
  },3000).easing(TWEEN.Easing.Sinusoidal.InOut).onUpdate(function () {
  }).onComplete(function () {
  }).start();

  tweenCamRotToLastPlace = new TWEEN.Tween(camera.rotation).to({
    x: camera.rotation.x,
    y: camera.rotation.y,
    z: camera.rotation.z,
  },100).easing(TWEEN.Easing.Sinusoidal.InOut).onComplete(function () {
    // tween the camera rotation vertically
    tweenLatOver = new TWEEN.Tween(controls).to({
      lat:lastControlsLat
    },3000).easing(TWEEN.Easing.Sinusoidal.InOut).onUpdate(function () {
    }).onComplete(function () {
      controls.lookVertical = true;
      controls.constrainVertical = true;
      controls.verticalMin = THREE.Math.degToRad(70);
      controls.verticalMax = THREE.Math.degToRad(130);
      controls.movementSpeed = 0;
      controls.autoForward = false;
      video.currentTime = 0;
      video.pause();
    }).start();
    // tween camera rotation horizontally
    tweenCamRotationOver = new TWEEN.Tween(controls).to({
      lon:lastControlsLon
    },2000).easing(TWEEN.Easing.Sinusoidal.InOut).start();
  }).start();
}

function setColorPlacaEsquerda(picker) {
    //document.getElementsByTagName('body')[0].style.color = '#' + picker.toString()
    var selectedObject = mainScene.getObjectByName("placafrente");

    selectedObject.material.color.setHex(0xfff000);
    var color = new THREE.Color().setRGB(picker.rgb[0], picker.rgb[1], picker.rgb[2]);
    selectedObject.material.color.setHex("0x"+picker.toString());
  }

  function setColorPlacaCentro(picker) {
      //document.getElementsByTagName('body')[0].style.color = '#' + picker.toString()
      var selectedObject = mainScene.getObjectByName("placaCentroFrente");

      selectedObject.material.color.setHex(0xfff000);
      var color = new THREE.Color().setRGB(picker.rgb[0], picker.rgb[1], picker.rgb[2]);
      selectedObject.material.color.setHex("0x"+picker.toString());
    }

    function setColorPlacaDireita(picker) {
        //document.getElementsByTagName('body')[0].style.color = '#' + picker.toString()
        var selectedObject = mainScene.getObjectByName("placaDireitaFrente");

        selectedObject.material.color.setHex(0xfff000);
        var color = new THREE.Color().setRGB(picker.rgb[0], picker.rgb[1], picker.rgb[2]);
        selectedObject.material.color.setHex("0x"+picker.toString());
      }
