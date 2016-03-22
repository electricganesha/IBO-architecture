$.ajax({
  type: "GET",
  url: "js/jquery-ui.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/three.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/Stats.js",
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
  url: "js/Tween.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/StereoEffect.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/threex.videotexture.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/vreticle.js",
  dataType: "script",
  async: false
});

$.ajax({
  type: "GET",
  url: "js/OrbitControls.js",
  dataType: "script",
  async: false
});

// TEXTURES
var loader = new THREE.TextureLoader();

var texturaCadeira = loader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_vermelho_small.jpg');

var texturaCadeiraSelect = loader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_amarelo_small.jpg');

var texturaCadeiraHighlight = loader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_amarelo_small.jpg');

var texturaCadeiraOcupada = loader.load('models/Cinema_Motta/Cadeira_Nova/cadeira_Tex_ocupada.jpg');

var texturaCadeiraDeficiente = loader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Diffuse_azul_small.jpg');

var texturaCadeiraNormalMap = loader.load('models/Cinema_Motta/Cadeira_Nova/BaseCadeira_Normals_small.jpg');

texturaCadeiraNormalMap.minFilter = THREE.LinearFilter;

var texturaBracoNormalMap = loader.load('models/Cinema_Motta/Braco_Novo/BracoCadeira_Normal_small.jpg');

var texturaBraco = loader.load('models/Cinema_Motta/Braco_Novo/BracoCadeira_Diffuse_small.jpg');

var eyeTexture = loader.load('models/Cinema_Motta/eye-icon.png');

var video = document.getElementById( 'video' );
textureVideo = new THREE.VideoTexture( video );
textureVideo.minFilter = THREE.LinearFilter;
textureVideo.magFilter = THREE.LinearFilter;
textureVideo.format = THREE.RGBFormat;

// BOOLEANS

var sittingDown = false; //if the user has clicked on a chair (e.g. is sitting down)

var insideHelp = true;

var isLoading = true; // if the scene is loading


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

var spriteEyeModel = new THREE.Mesh();

// STATISTICS (FPS, MS, MB)
var statsFPS = new Stats();

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

var selectedChairs = new Array(); // an array that keeps the selected chairs
var spriteEyeArray = new Array(); // an array that keeps the floating eye icons
var cadeirasJSON; // an array that keeps the info about the chairs that we retrieve from the DB

// MENU VARIABLES

var isLoadOcup = false;
var isLoadingInfo = true;
var num_sessao = "0";

var deviceOrientationSelectedObject;
var deviceOrientationSelectedPoint;

// RANDOM

var screenReferenceSphere; // the sphere (invisible) located in the middle of the screen, to lookAt

var video; // the video canvas
var plane; // the video screen


// create the material
var materialcadeiraMobileHighlight = new THREE.MeshBasicMaterial( {
  map: texturaCadeiraHighlight
});

// create the material
var materialcadeiraMobile = new THREE.MeshBasicMaterial( {
  map: texturaCadeira
});

// create the material
var materialcadeiraDeficienteMobile = new THREE.MeshBasicMaterial( {
  map: texturaCadeiraDeficiente,
});

// create the material
var materialcadeiraOcupadaMobile = new THREE.MeshBasicMaterial( {
  map: texturaCadeiraOcupada,
});

// STRUCTURAL / DOM / RENDERER

renderer = new THREE.WebGLRenderer({ precision: "lowp", antialias:true });
renderer.setSize( window.innerWidth, window.innerHeight );
element = renderer.domElement;
container = document.body;
container.appendChild(element);

// Load the initial scenes

if(firstTimeRunning){
  carregarJSONBDInitial(0);
  firstTimeRunning = false;
}

mainScene = new THREE.Scene();
startLoadingScene();

//
// LOADING MANAGERS
//
// check if all the models were loaded
THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
  if(loaded == total && firstTimeLoading)
  {
    firstTimeLoading = false;
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

var rtParameters = {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					format: THREE.RGBFormat,
					stencilBuffer: true
				};

				var rtWidth  = window.innerWidth / 2;
				var rtHeight = window.innerHeight / 2;

//
// This method shows the loading scene, while the items are not loaded
//
function startLoadingScene() {
  loadingScene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10);
  camera.position.set(0, 0, 7);
  camera.lookAt(loadingScene.position);

  currentScene = loadingScene;

  loader = new THREE.JSONLoader();
  loader.load( "models/loading3.js", function( geometry,materials ) {

    loaderMesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );

    loadingScene.add(loaderMesh);

  });

}

//
// Here we initialise all the needed variables, like the stats, camera, and controls
//

function fullscreen() {
  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
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

THREE.DeviceOrientationControls = function ( object ) {

  var scope = this;

  var firstAlpha;
  var firstIn = false;
  var entrouOri = false;

  this.object = object;

  this.object.rotation.reorder( "YXZ" );

  this.freeze = true;

  this.deviceOrientation = {};

  this.screenOrientation = 0;
  var iDivOri = document.createElement('div');
  iDivOri.style.width = '100%';
  iDivOri.style.cursor = "pointer";
  iDivOri.style.textAlign = "center";
  iDivOri.style.height = '100%';
  iDivOri.style.position = "absolute";
  iDivOri.style.background = 'rgba(0,0,0,1)';
  iDivOri.id = 'loadedScreenOri';
  iDivOri.style.top = '0';
  iDivOri.style.display = "none";

  var textDivOri = document.createElement('div');
  textDivOri.style.color = "white";
  textDivOri.style.cursor = "pointer";
  textDivOri.innerHTML = " Rotate phone";
  textDivOri.style.width = '50%';
  textDivOri.style.textAlign = "center";
  textDivOri.style.fontFamily = "osb";
  textDivOri.style.height = '100%';
  textDivOri.style.position = "absolute";
  textDivOri.id = 'textScreenOri';
  textDivOri.style.left = '24%';
  textDivOri.style.top = '30%';

  iDivOri.appendChild(textDivOri);
  document.body.appendChild(iDivOri);
  var onDeviceOrientationChangeEvent = function ( event ) {
    scope.deviceOrientation = event;
    if(!firstIn)
    {
      firstAlpha = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) : 90;
      firstIn = true;
    }
    if(!sittingDown && isVR)
    {
      var mouse2 = new THREE.Vector2();
      mouse2.x = 2 * ((window.innerWidth/2) / window.innerWidth) - 1;
      mouse2.y = 1 - 2 * ((window.innerHeight/2) / window.innerHeight);
      // normal raycasting variables
      var intersectedOne = false;
      var intersectedObject = new THREE.Object3D();

      var raycaster = new THREE.Raycaster();

      var intersections;

      raycaster.setFromCamera( mouse2, camera );

      // search the raycasted objects in the octree
      octreeObjects = octree.search( raycaster.ray.origin, raycaster.ray.far, true, raycaster.ray.direction );

      intersections = raycaster.intersectOctreeObjects( octreeObjects );

      var spriteFound = false;

      // for each of the intersected objects
      for(var i=0; i<intersections.length; i++)
      {
        var pointSpriteVR = intersections[0].point;
        var index = spriteEyeArray.indexOf(intersections[i].object);
        // if intersected object is a sprite
        if(intersections[i].object.name == "spriteEye")
        {
          spriteFound = true;
          //var index = spriteEyeArray.indexOf(intersections[i].object);
        }
      }
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
        if ( intersected != intersectionObject && !spriteFound && !mouseIsOnMenu) {


          deviceOrientationSelectedObject = intersections[0].object;
          deviceOrientationSelectedPoint = intersections[0].point;

          // if there was a previously intersected object
          if ( intersected )
          {
            var selectedObject = mainScene.getObjectByName("highLightChair");
            mainScene.remove( selectedObject );
          }

          intersected = intersectionObject;

          highLightChair = new THREE.Mesh(intersected.geometry,materialcadeiraMobileHighlight);

          intersected.geometry.computeBoundingBox();

          var centroid = new THREE.Vector3();
          centroid.addVectors( intersected.geometry.boundingBox.min, intersected.geometry.boundingBox.max );

          centroid.applyMatrix4( intersected.matrixWorld );

          highLightChair.scale.set(1.15,1.00,1.05);

          highLightChair.rotation.set(intersected.rotation.x,intersected.rotation.y,intersected.rotation.z+0.035);

          highLightChair.position.set(centroid.x-0.005,centroid.y-0.006,centroid.z);

          mainScene.add(highLightChair);
          highLightChair.name = "highLightChair";

          // if intersection is new : change color to highlight

          switch(intersected.estado) {
            case "OCUPADA":
            var selectedObject = mainScene.getObjectByName("highLightChair");
            mainScene.remove( selectedObject );
            document.body.style.cursor = 'no-drop';
            break;
            default:
            document.body.style.cursor = 'pointer';
          }
        }
      }
      else // if there are no intersections
      {
        var selectedObject = mainScene.getObjectByName("highLightChair");
        mainScene.remove( selectedObject );
        intersected = null;
        uuidTexturaAntiga = "";
      }
    }
  };

  var onScreenOrientationChangeEvent = function () {
    if(window.orientation == 0){
      $("#loadedScreenOri").fadeIn("fast");
    }else{
      $("#loadedScreenOri").fadeOut("fast");
      scope.screenOrientation = window.orientation || 0;
    }
  };

  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

  var setObjectQuaternion = function () {

    var zee = new THREE.Vector3( 0, 0, 1 );

    var euler = new THREE.Euler();

    var q0 = new THREE.Quaternion();

    var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

    return function ( quaternion, alpha, beta, gamma, orient ) {
      euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler( euler );                               // orient the device

      quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

      quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation
    }

  }();

  this.connect = function() {

    onScreenOrientationChangeEvent(); // run once on load

    window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
    window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

    scope.freeze = false;

  };

  this.disconnect = function() {

    scope.freeze = true;

    window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
    window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

  };

  this.update = function () {

    if ( scope.freeze ) return;

    var alpha  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) : 0; // Z
    var beta   = scope.deviceOrientation.beta  ? THREE.Math.degToRad( scope.deviceOrientation.beta  ) : 0; // X'
    var gamma  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
    var orient = scope.screenOrientation       ? THREE.Math.degToRad( scope.screenOrientation       ) : 0; // O

    alpha = alpha-firstAlpha;
    setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
  };

};

function init() {
  // 0: fps, 1: ms, 2: mb
  statsFPS.setMode( 0 );

  statsFPS.domElement.style.position = 'absolute';
  statsFPS.domElement.style.left = '0px';
  statsFPS.domElement.style.top = '0px';

  document.body.appendChild( statsFPS.domElement );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 50 );

  camera.position.x = -6.160114995658247;
  camera.position.y = 1.5;
  camera.position.z = 0.009249939938009306;

  var check = {
    gyroscope: function (callback) {
      function handler(event) {
        var hasGyro = typeof event.alpha === 'number'
        && typeof event.beta  === 'number'
        && typeof event.gamma === 'number';
        window.removeEventListener('deviceorientation', handler, false);
        callback(hasGyro);
      }
      window.addEventListener('deviceorientation', handler, false);
    }
  };

  var checkaccel = {
    accelerometer: function (callback) {
      function handler(event) {
        var hasAccel = typeof event.acceleration.x === 'number'
        && typeof event.acceleration.y  === 'number';
        window.removeEventListener('devicemotion', handler, false);
        callback(hasAccel);
      }
      window.addEventListener('devicemotion', handler, false);
    }
  };

  check.gyroscope(function (hasGyroscope) {
    if(hasGyroscope) {
      /*checkaccel.accelerometer(function (hasAccelerometer) {
        if(hasAccelerometer) {
          controls = new THREE.DeviceOrientationControls(camera);
          controls.connect();
        } else {
          controls = new THREE.OrbitControls(camera, renderer.domElement);
        }
      });*/
      // Listen for orientation changes
      if(window.innerHeight > window.innerWidth){
        var iDivOri = document.createElement('div');
        iDivOri.style.width = '100%';
        iDivOri.style.cursor = "pointer";
        iDivOri.style.textAlign = "center";
        iDivOri.style.height = '100%';
        iDivOri.style.position = "absolute";
        iDivOri.style.background = 'rgba(0,0,0,1)';
        iDivOri.id = 'loadedScreenOri';
        iDivOri.style.top = '0';
        //iDivOri.style.display = "none";

        var textDivOri = document.createElement('div');
        textDivOri.style.color = "white";
        textDivOri.style.cursor = "pointer";
        textDivOri.innerHTML = " Rotate phone";
        textDivOri.style.width = '50%';
        textDivOri.style.textAlign = "center";
        textDivOri.style.fontFamily = "osb";
        textDivOri.style.height = '100%';
        textDivOri.style.position = "absolute";
        textDivOri.id = 'textScreenOri';
        textDivOri.style.left = '24%';
        textDivOri.style.top = '30%';

        iDivOri.appendChild(textDivOri);
        document.body.appendChild(iDivOri);
      }else{
        controls = new THREE.DeviceOrientationControls(camera);
        controls.connect();
      }
      // Listen for orientation changes
      window.addEventListener("orientationchange", function() {
        if (window.orientation == "90"){
        controls = new THREE.DeviceOrientationControls(camera);
        controls.connect();
        }
      }, false);
    } else {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
  });


  // lights
  var light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1.0 );
  mainScene.add( light );

  // model
  group = new THREE.Object3D();

  //event listeners
  document.addEventListener('mousedown', onMouseDown, false);

  window.addEventListener( 'resize', onWindowResize, false );


  showMenuSelect(); // this method initialises the side div container

  // create the main selection menu
  var iDiv = document.createElement('div');
  iDiv.style.width = '100%';
  iDiv.style.cursor = "pointer";
  iDiv.style.textAlign = "center";
  iDiv.style.height = '100%';
  iDiv.style.position = "absolute";
  iDiv.style.background = 'rgba(0,0,0,1)';
  iDiv.id = 'loadedScreen';
  iDiv.style.top = '0';
  iDiv.style.display = "block";

  var textDiv = document.createElement('div');
  textDiv.style.color = "white";
  textDiv.style.cursor = "pointer";
  textDiv.innerHTML = " Welcome to 'BOI (Box Office Immersion)', a PUSH Interactive experiment. <br> <br> <br> BOI is a novel product by PUSH Interactive, that brings the best out of interactive three-dimensional environments to the ticket sale experience. We propose a visually appealing, easy-to-use and intuitive, improvement on the online ticket offices. By using WebGL (the 3D web standard) we are able to have a seamless experience across the most popular web-browsers, providing a solid product that is non-platform specific, so that clients are able to access it through desktops, laptops, mobile devices, and other platforms."
  +"<br><br>Our system is flexible enough to be applied to almost every single ticket selling experience, be it movie theatres, concert halls, sports stadiums, or even public transports. <br>"
  +"<br>We offer tailor-made integration into your own ticket sales system, as our product is sold as a module that can be inserted in a traditional ticket sales pipeline, receiving input in all the popular web data interchange formats like XML or JSON, and outputting the selected information in your favourite format as well. <br>"
  +"<br><br><br><br> Click on the text to continue";
  textDiv.style.width = '50%';
  textDiv.style.textAlign = "center";
  textDiv.style.fontFamily = "osb";
  textDiv.style.height = '100%';
  textDiv.style.position = "absolute";
  textDiv.id = 'textScreen';
  textDiv.style.left = '24%';
  textDiv.style.top = '30%';


  iDiv.appendChild(textDiv);
  document.body.appendChild(iDiv);
  $("#loadedScreen" ).click(function() {
    isLoadingInfo = false;
    $("#loadedScreen").fadeOut("slow");
    video.play();
    video.pause();
    fullscreen();
    insideHelp = false;
  });
  isLoading = false;
  firstTimeInit = false;
}

//
// create a show the selection menu
//
function showMenuSelect(){

  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
  }

  function deviceMotionHandler(eventData) {

    // Grab the acceleration from the results
    var acceleration = eventData.acceleration;

    if((acceleration.x > 3 || acceleration.x < -3) && (acceleration.y > 3 || acceleration.y < -3) && acceleration.z > 3 || acceleration.z < -3)
    {
      if(sittingDown)
      {
        sittingDown = false;
        setupTweenOverview();

        video.pause();

        for(var i=0; i<spriteEyeArray.length ; i++)
        {
          spriteEyeArray[i].visible = true;
        }

        deviceOrientationSelectedPoint = undefined;
        deviceOrientationSelectedObject = undefined;
      }
      else
      {
        if(deviceOrientationSelectedPoint != undefined && deviceOrientationSelectedObject != undefined)
          changePerspective(deviceOrientationSelectedPoint.x,deviceOrientationSelectedPoint.y,deviceOrientationSelectedPoint.z,deviceOrientationSelectedObject);
      }
    }
  }

  // create main legenda for cinema
  var legDiv = document.createElement('div');
  legDiv.style.width = '100%';
  legDiv.style.top = "100%";
  legDiv.style.marginTop = "-80px";
  legDiv.style.height = '160px';
  legDiv.style.position = "absolute";
  legDiv.id = 'LegDiv';
  // create sub main legenda for cinema
  var legenda = document.createElement('div');
  legenda.style.width = '900px';
  legenda.style.margin = "auto";
  legenda.style.textAlign = "center";
  legenda.style.height = '200px';
  legenda.style.borderRadius = "10px";
  legenda.id = 'legenda';

  var legEsq = document.createElement('div');
  legEsq.style.width = '90px';
  legEsq.style.float = "left";
  legEsq.style.textAlign = "center";
  legEsq.style.height = '200px';
  legEsq.style.background = '#1cbb9b';
  legEsq.style.borderRadius = "10px";
  legEsq.id = 'legEsq';

  legEsq.onclick = function() {
    switchToVr();
  }
  legEsq.onmouseover = function() {
    legEsq.style.cursor = 'pointer';
  }

  var ptrocavr = document.createElement('p');
  ptrocavr.innerHTML = "VR";
  ptrocavr.style.color = "#FFF";
  ptrocavr.style.fontSize = "13px";
  ptrocavr.style.fontFamily = "osr";
  ptrocavr.style.marginTop = "15px";
  ptrocavr.id = "ptrocavr";

  var ptrocavrImg = document.createElement('img');
  ptrocavrImg.id = "ptrocavrImg";
  ptrocavrImg.style.marginTop = "-4px";

  legEsq.appendChild(ptrocavr);
  legEsq.appendChild(ptrocavrImg);
  legDiv.appendChild(legenda);
  legenda.appendChild(legEsq);
  document.body.appendChild(legDiv);
  document.getElementById("ptrocavrImg").src="img/VR-icon.png";

}

//
// Load the main Scene
//
function loadScene() {
  // load venue status from DB

  loadSala();
  loadCadeiras(populateCadeirasInstances);
  loadBracos(populateBracosInstances);

  // load the model for the EYE icon
  loader.load( "models/Cinema_Motta/olho_v03.js", function( geometry,materials ) {
    spriteEyeModel = new THREE.Mesh(geometry,materials);
  });

  // create the cinema screen
  var geometry = new THREE.PlaneGeometry( 7, 2.5, 10, 10);
  var material = new THREE.MeshBasicMaterial( {side:THREE.DoubleSide, map:textureVideo} );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.x = -6.5;
  plane.position.y = 1.2;
  plane.rotation.y = Math.PI/2;
  mainScene.add( plane );
}

//
// Here we load the venue model
//
function loadSala() {



  var loaderJSON = new THREE.JSONLoader();


  loaderJSON.load( "models/Cinema_Motta/tela_final.js", function( geometry,material ) {
    telaFinal = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:textureVideo}));
    telaFinal.position.y += 0.5;
    mainScene.add(telaFinal);
  });

  // load JSON model
  loaderJSON.load( "models/Cinema_Motta/Sala_Baked_03.js", function( geometry, materials ) {

    //var bufferGeometry = new THREE.BufferGeometry().fromGeometry( geometry );

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
function loadCadeiras(populateCadeirasInstances) {

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
    populateCadeirasInstances(mesh,normalsArray,bufferGeometry); // we carry on through a callback to load the models synchronously
  });
}

//
// 3. here we iterate on the point cloud to replicate the instances and position each instance in the correct place
//
function populateCadeirasInstances(mesh, normalsArray, bufferGeometry) {
  // get the origin (from) and vertical axis vectors
  var from = new THREE.Vector3( 0,0,0 );
  var vAxis = new THREE.Vector3( -1,0,0 );

  sphereGeo = new THREE.SphereGeometry( 0.1, 6, 6 );

  var genericObject = new THREE.Mesh(bufferGeometry,materialcadeira);

  singleGeometryNormal = new THREE.Geometry();
  singleGeometryOcupadas = new THREE.Geometry();
  singleGeometryDeficiente = new THREE.Geometry();

  var materials = [];

  materials.push(materialcadeiraMobile);
  materials.push(materialcadeiraDeficienteMobile);
  materials.push(materialcadeiraOcupadaMobile);


  // for each point in the point cloud
  for(i=0; i<mesh.geometry.vertices.length; i++){
    var vertex = mesh.geometry.vertices[i];

    var materialcadeira = materialcadeiraMobile.clone();

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

      for(var k = 0 ; k < cadeirasJSON.length ; k++)
      {
        if(newObject.name == cadeirasJSON[k].nome_procedural)
        {
          cadeiraCorrente = cadeirasJSON[k];
        }
      }
      if(cadeiraCorrente.estado == "OCUPADA")
      {
        newObject.estado = "OCUPADA";
        singleGeometryOcupadas.merge(newObject.geometry, newObject.matrix, 2);
      }
      else if(cadeiraCorrente.estado == "DEFICIENTE")
      {
        newObject.estado = "DEFICIENTE";
        singleGeometryDeficiente.merge(newObject.geometry, newObject.matrix, 1);
      }
      else
      {
        newObject.estado = "LIVRE";
        singleGeometryNormal.merge(newObject.geometry, newObject.matrix, 0);
      }
      octree.add( newObject);

    }
  }
  //add to scene
  var meshSG = new THREE.Mesh(singleGeometryNormal, new THREE.MeshFaceMaterial(materials));
  meshSG.name = "singleGeometryNormal";
  mainScene.add(meshSG);

  var meshSGOcupadas = new THREE.Mesh(singleGeometryOcupadas, new THREE.MeshFaceMaterial(materials));
  meshSGOcupadas.name = "singleGeometryOcupadas";
  mainScene.add(meshSGOcupadas);

  var meshSGDeficiente = new THREE.Mesh(singleGeometryDeficiente, new THREE.MeshFaceMaterial(materials));
  meshSGDeficiente.name = "singleGeometryDeficiente";
  mainScene.add(meshSGDeficiente);
}

//
// Here we access the DB and load the chair occupation info
//

function carregarJSONBDInitial(num_sessao) {

  $.ajax({
    url: 'php/ler_BDCinema.php', //This is the current doc
    type: "POST",
    dataType:'json', // add json datatype to get json
    data: ({sessao: "cadeiras"+num_sessao}),
    success: function(data){
      cadeirasJSON = data;
      console.log("JSON Loaded Correctly from DB Initial cadeiras " + num_sessao);
      loadScene();
    },
    error:    function(textStatus,errorThrown){
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
}

//
// here we load the chair arms
//
function loadBracos(populateBracosInstances){
  // single geometry for geometry merge
  var singleGeometry = new THREE.Geometry();

  // chair arm material
  var material = new THREE.MeshBasicMaterial({
    map: texturaBraco,
    specular : [0.1, 0.1, 0.1],
    shininess : 120.00
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

  } );

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

// memorize the last texture that was selected
var uuidTexturaAntiga ="";

//
// Mouse Click Event
//
function onMouseDown(e) {
  // if we are in the cinema overview
  if(!sittingDown && insideHelp == false) {
    // normal raycaster variables
    var intersectedOne = false;

    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var raycasterSprite = new THREE.Raycaster();

    mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight);

    raycaster.setFromCamera( mouse, camera );

    var intersectsSprite = raycaster.intersectObjects( spriteEyeArray );

    if(intersectsSprite.length > 0)
    {
      var pointSprite = intersectsSprite[0].point;
      // for each intersected object
      for(var i=0; i<intersectsSprite.length; i++)
      {
        // if intersected object is a sprite then call the change perspective function (which seats you down)
        if(intersectsSprite[i].object.name == "spriteEye")
        {
          spriteFound = true;
          var index = spriteEyeArray.indexOf(intersectsSprite[i].object);
          changePerspective(pointSprite.x,pointSprite.y,pointSprite.z,selectedChairs[index]);
        }
      }
    } else {
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

        // retrieve information of chair occupation from array retrieved from DB
        for(var i=0; i<cadeirasJSON.length; i++)
        {
          if(cadeirasJSON[i].nome_procedural == obj.name)
          {
            fila = cadeirasJSON[i].fila;
            lugar = cadeirasJSON[i].lugar;
            estado = cadeirasJSON[i].estado;
          }

        }

      }

      if(obj != undefined)
      {
        // if chair is not selected yet && chair is not occupied && intersected object is not a sprite
        if(($.inArray(obj, selectedChairs)=="-1") && (obj.estado != "OCUPADA") && !spriteFound && !mouseIsOnMenu && !mouseIsOutOfDocument && insideHelp == false)
        {
          // calculate intersected object centroid
          obj.geometry.computeBoundingBox();

          var centroid = new THREE.Vector3();
          centroid.addVectors( obj.geometry.boundingBox.min, obj.geometry.boundingBox.max );
          centroid.multiplyScalar( - 0.5 );

          centroid.applyMatrix4( obj.matrixWorld );

          // Add the EYE icon

          var eyeGeometry = new THREE.BoxGeometry( 0.1, 1, 1 );

          var spriteEyeMaterial = new THREE.MeshBasicMaterial( { map: eyeTexture, opacity:0.0, transparent:false} );

          var spriteEyeInstance = new THREE.Mesh(spriteEyeModel.geometry,spriteEyeMaterial);
          spriteEyeInstance.name = "spriteEye";
          spriteEyeInstance.position.set(centroid.x , centroid.y+0.2, centroid.z );
          mainScene.add( spriteEyeInstance );

          //octreeSprites.add(spriteEyeInstance);

          spriteEyeArray.push(spriteEyeInstance);

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

          if(obj.position.z == 0)
          spriteEyeInstance.rotation.y = 0;
          else if(obj.position.z > 0)
          spriteEyeInstance.rotation.y = -angle;
          else if(obj.position.z < 0)
          spriteEyeInstance.rotation.y = angle;

          // paint all the selected chairs (check the array) with the selected color
          if(detectmob())
          selectChair = new THREE.Mesh(obj.geometry,materialcadeiraMobileHighlight);
          else
          selectChair = new THREE.Mesh(obj.geometry,materialcadeiraHighLight);

          selectChair.geometry.computeBoundingBox();

          var centroid = new THREE.Vector3();
          centroid.addVectors( obj.geometry.boundingBox.min, obj.geometry.boundingBox.max );

          centroid.applyMatrix4( obj.matrixWorld );

          selectChair.scale.set(1.15,1.00,1.05);

          selectChair.rotation.set(obj.rotation.x,obj.rotation.y,obj.rotation.z+0.035);

          selectChair.position.set(centroid.x-0.005,centroid.y-0.006,centroid.z);

          selectChair.name = "selectChair_"+obj.name;
          selectChair.material.map = texturaCadeiraHighlight;

          mainScene.add(selectChair);

          // Add the Chair
          selectedChairs.push(obj);

          obj.material.map = texturaCadeiraSelect;
        } else {
          if(!mouseIsOnMenu && !mouseIsOutOfDocument && !spriteFound)
          removeCadeira(obj); // if chair was already selected, de-select it

        }

      }
    }
  }
  else if(!sittingDownOrtho && insideHelp == false) // if clicked when sitting down
  {
    sittingDown = false;
    setupTweenOverview();

    video.pause();

    for(var i=0; i<spriteEyeArray.length ; i++)
    {
      spriteEyeArray[i].visible = true;
    }

  }
  else if (insideHelp == false)
  {
    sittingDown = false;

    for(var i=0; i<spriteEyeArray.length ; i++)
    {
      spriteEyeArray[i].visible = true;
    }
  }
}

//
// Here we remove a chair
//
function removeCadeira(obj) {

  var removalThing = "#"+obj.name;

  $(removalThing).remove();

  var index = selectedChairs.indexOf(obj);

  var eyeSpriteToRemove = spriteEyeArray[index];
  mainScene.remove(eyeSpriteToRemove);
  octree.remove(eyeSpriteToRemove);

  var selectedObject = mainScene.getObjectByName("selectChair_"+obj.name);
  mainScene.remove( selectedObject );

  if (index > -1)
  {
    selectedChairs.splice(index, 1);
    spriteEyeArray.splice(index, 1);
  }
}

// variables to check if we scrolled back or forth (zoom effect)
var alreadyScrolledFront = true;
var alreadyScrolledBack = false;

function render(dt) {
  renderVR.render(mainScene, camera);
}

function update(dt) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderVR.setSize(window.innerWidth, window.innerHeight);
}

//
// main render function (render cycle)
//
function animate() {

  requestAnimationFrame(animate);
  // if we are rendering the loading scene
  if(isLoading)
  {
    renderer.render( loadingScene, camera );
    loaderMesh.rotation.y -= 0.03;
  }
  // if we are rendering the main scene
  else
  {

    for(var i=0; i<spriteEyeArray.length; i++)
    {
      spriteEyeArray[i].position.x += 0.002*Math.sin(clock.getElapsedTime() * 3);
      spriteEyeArray[i].position.z += 0.0005*Math.cos(clock.getElapsedTime() * 3);
    }

    renderer.render( mainScene, camera );

    statsFPS.begin();

    if(controls != undefined && !isLoadOcup && !isLoadingInfo)
      controls.update(clock.getDelta()); //for cameras

    octree.update();
    TWEEN.update();

    statsFPS.end();

    // clean all the sprites
    if(isPerspectiveOrtho || sittingDown)
    {
      for(var i=0; i<spriteEyeArray.length ; i++)
      {
        spriteEyeArray[i].visible = false;
      }
    }
    else // show all the sprites
    {
      for(var i=0; i<spriteEyeArray.length ; i++)
      {
        spriteEyeArray[i].visible = true;
      }
    }
  }

}

animate();

//
// if we click the view perspective button or EYE icon
//
function changePerspective(x, y, z,obj) {

  $("#menuSelect").animate({"right": '-=300px'});
  setTimeout(function(){ video.play(); }, 3000);
  sittingDown = true;

  lastCameraPositionBeforeTween = new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z);
  lastControlsLat = controls.lat;
  lastControlsLon = controls.lon;
  setupTweenFP(obj);

  for(var i=0; i<spriteEyeArray.length ; i++)
  {
    spriteEyeArray[i].visible = false;
  }

}

//
// if we click the view perspective button or EYE icon
//
function changePerspectiveOrtographic(x, y, z,obj) {

  sittingDown = true;
  isPerspectiveOrtho = false;
  sittingDownOrtho = true;

  $("#menuSelect").animate({"right": '-=300px'});

  $("#ecraDiv").hide();

  // calculate centroid
  obj.geometry.computeBoundingBox();

  var centroid = new THREE.Vector3();
  centroid.addVectors( obj.geometry.boundingBox.min, obj.geometry.boundingBox.max );
  centroid.multiplyScalar( - 0.5 );

  centroid.applyMatrix4( obj.matrixWorld );
  //sittingDown = true;
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 50 );

  camera.position.x = centroid.x;
  camera.position.y = centroid.y+0.25; // head height
  camera.position.z = centroid.z;

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

  // calculate longitude angle - sideways rotation
  var longAngle;

  if(obj.position.z > 0)
  longAngle = -180+angle*180/Math.PI;
  else
  longAngle = 180-angle*180/Math.PI;



  controls = new THREE.FirstPersonControls(camera);

  controls.lookVertical = true;
  controls.constrainVertical = true;
  controls.verticalMin = Math.PI/3;
  controls.verticalMax = 2*Math.PI/3;
  controls.movementSpeed = 0;
  controls.autoForward = false;
  controls.lat = angle*180/Math.PI;
  controls.lon = longAngle;

  for(var i=0; i<spriteEyeArray.length ; i++)
  {
    spriteEyeArray[i].visible = false;
  }

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
    }).start();
    // tween camera rotation horizontally
    tweenCamRotationOver = new TWEEN.Tween(controls).to({
      lon:lastControlsLon
    },2000).easing(TWEEN.Easing.Sinusoidal.InOut).start();
  }).start();
}

function animateVr() {
  vr = requestAnimationFrame(animateVr);
  update(clock.getDelta());
  render(clock.getDelta());
}

function switchToVr() {
  if (isVR==false) // if we're in cinema overview 3D change to VR view
  {
    renderVR = new THREE.StereoEffect(renderer);
    renderVR.eyeSeparation = 0.01;
    document.getElementById ('ptrocavr').innerHTML = "3D";
    document.getElementById("ptrocavrImg").src="img/icon - cadeiras 3D.png";
    isVR = true;
    animateVr();
    var reticle = vreticle.Reticle(camera);
    mainScene.add(camera);
  }
  else // change back to 3D view
  {
    document.getElementById ('ptrocavr').innerHTML = "VR";
    document.getElementById("ptrocavrImg").src="img/VR-icon.png";
    isVR = false;
    cancelAnimationFrame(vr);
    renderer.setSize( window.innerWidth, window.innerHeight );
    mainScene.remove(camera);
  }
}