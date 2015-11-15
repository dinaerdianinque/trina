var collection; 
var tags;

(function() {

    var groups = [];

    var container;
    var camera, scene, controls, renderer;

    var worldsize = 3500;
    var cardwidth = 400;
    var cardheight = 220;

    var tagAngles = [];
    var colorGrids = [];
    
    var camRotY;
    var tolerance;
    var lowOp = { opacity: 0.2 };
    var highOp = { opacity: 1 };

    var groupLocation = new THREE.Geometry();

    init();
    animate();



    function init() {


        container = document.getElementById( 'container' );

        // Setup

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 4000 );
        camera.position.z = 1500;
        camera.position.y = 100;
        camera.rotation.y = -Math.PI/2 ;


        controls = new THREE.OrbitControls( camera, container );

        scene = new THREE.Scene();

        // Calculate TagAngles and Tolerance

        var angleStep = (Math.PI*2)/(tags.length-0.5);

        for (var i = 0; i < tags.length; i++) {
            var tagAng = -Math.PI/2 + (angleStep * i);
            tagAngles.push(tagAng);
        }
        console.log(tagAngles);
        tolerance = (Math.PI*2)/(tags.length-1)/2.2;
        

        // Grids and Lables

        var size = worldsize, step = 50;
        var exampleColor = new THREE.Color( 0xffffff );
        for (var q = 0; q<tags.length; q++) {
            var grid = new THREE.Geometry();

            for ( i = - size; i <= size; i += step ) {

                grid.vertices.push( new THREE.Vector3( - size, 0, i ) );
                grid.vertices.push( new THREE.Vector3(   size, 0, i ) );

                //grid.vertices.push( new THREE.Vector3( i, 0, - size ) );
                //grid.vertices.push( new THREE.Vector3( i, 0,   size ) );

            }
            
            exampleColor.setHSL( (q/tags.length), 1, 0.5);
            var gridMat = new THREE.LineBasicMaterial( { color: exampleColor, opacity: 0.1 } );
            gridMat.transparent = true;
            var line = new THREE.Line( grid, gridMat, THREE.LinePieces );
            line.rotation.y = tagAngles[q];
            colorGrids.push(line);
            
            scene.add( line );

            // create Lables
            scene.add( createLables(tags[q], q, exampleColor) );

        }



        // Draw Content
        
        createGroupLocations();

        for ( var p=0; p<collection.length; p++) {

            for (var k=0; k<collection[p].tag.length; k++) {
                createGroup(collection[p].text, collection[p].title, collection[p].author, collection[p].tag[k], groupLocation.vertices[p]);
            }
        }
        for ( i=0; i<groups.length; i++) {
            scene.add( groups[i] );
        }
        

        // TEMP center of the World reference point
        /*
        var geometry = new THREE.BoxGeometry( 10, 10, 10 );
        var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
        object.position.set( -0, 0, 0 );
        scene.add( object );
        */

        //Renderer

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor( 0xf9f9f9, 0.9 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        container.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function createLables (text, tag, col) {

        var canvasLable1 = document.createElement('canvas');

        canvasLable1.width = worldsize*0.8;
        canvasLable1.height = worldsize*0.8;

        //canvas1.style.border = '7px solid';

        var contextLable1 = canvasLable1.getContext('2d');

        contextLable1.fillStyle ='rgba(255,255,255,0)';
        contextLable1.fillRect(0,0,canvasLable1.width,canvasLable1.height);

        contextLable1.fillStyle = 'black';

        contextLable1.textAlign ='center';
        contextLable1.font = '40px monostena,Consolas,monospace';
        contextLable1.fillText (text, canvasLable1.width/2, canvasLable1.height-40);
        //wrapText(contextLable1, text, cardwidth/2, cardheight/4, cardwidth-50, 20);

        // canvas contents will be used for a texture
        var textureLable1 = new THREE.Texture(canvasLable1);
        textureLable1.needsUpdate = true;
          
        var materialLable1 = new THREE.MeshBasicMaterial( {map: textureLable1, side:THREE.DoubleSide, color: col } );
        materialLable1.transparent = true;
        materialLable1.opacity = 1;

        var meshLable1 = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(canvasLable1.width, canvasLable1.height),
            materialLable1
          );
        meshLable1.position.set(0, 0, 0);
        
        meshLable1.rotation.x = -Math.PI / 2;
        meshLable1.rotation.z = tagAngles[tag-1] + Math.PI / 4;

        scene.add( meshLable1 );

    }

    function createGroup(text, title, author, tag, pos) {

        var group = new THREE.Group();

        var canvas1 = document.createElement('canvas');

        canvas1.width = cardwidth;
        canvas1.height = cardheight;

        //canvas1.style.border = '7px solid';

        var context1 = canvas1.getContext('2d');

        context1.fillStyle ='rgba(255,255,255,.9)';
        context1.fillRect(0,0,cardwidth,cardheight);

        context1.fillStyle = 'black';

        context1.textAlign ='center';
        context1.font = '10px monostena,Consolas,monospace';
        wrapText(context1, text, cardwidth/2, cardheight/4, cardwidth-50, 20);
        
        context1.textAlign = 'left';
        wrapText(context1, title, 20, cardheight*0.8, cardwidth/2.2, 20);

        context1.textAlign = 'right';
        wrapText(context1, author, cardwidth-20, cardheight*0.8, cardwidth/2.2, 20);

        // canvas contents will be used for a texture
        var texture1 = new THREE.Texture(canvas1);
        texture1.needsUpdate = true;
          
        // var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
        var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
        material1.transparent = true;
        material1.opacity = lowOp.opacity;

        var mesh1 = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(canvas1.width, canvas1.height),
            material1
          );
        mesh1.position.set(0, cardheight/2, 0);
        
        group.add( mesh1 );
        group.position.set(_.values(pos)[0], 0, _.values(pos)[2]); 

        
        group.rotation.y = tagAngles[tag-1];

        groups.push(group);

    }
    
    function isOdd(num) { return num % 2;}

    function createGroupLocations () {
        var side = (Math.ceil(Math.sqrt(collection.length))-1)*cardwidth*1.5;
        var counter = 0;

        for ( i = - side/2; i <= side/2; i += (cardwidth*1.5) ) {
            counter++;
            if (isOdd(counter)) {
                for ( j = - side/2; j <= side/2; j += (cardwidth*1.5) ) {
                    groupLocation.vertices.push( new THREE.Vector3( j+cardwidth*1.5/4, 0, i ) );
                }
            } else {
                for ( j = - side/2; j <= side/2; j += (cardwidth*1.5) ) {
                    groupLocation.vertices.push( new THREE.Vector3( j-cardwidth*1.5/4, 0, i ) );
                }
            }
        }
    }
    
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
    }


    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

  //function map (num, inMin, inMax, outMin, outMax) {
  //    return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  //}

    var isComplete = true;

    function toHiTween(obj) {
        //TWEEN.removeAll();
        var updateOp  = function(){
            _.values(obj)[4][0].material.opacity = highOp.opacity;
        };

        var tween = new TWEEN.Tween(lowOp)
            .to(highOp, 1000)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(updateOp)
            .onComplete(function(){
                isComplete = true;
                console.log('just Completed toHiTween!');
            });
        tween.start();

    }

    function toLoTween (obj) {
        //TWEEN.removeAll();
        var updateOp  = function(){
            _.values(obj)[4][0].material.opacity = lowOp.opacity;
        };

        var tween = new TWEEN.Tween(lowOp)
            .to(lowOp, 1000)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(updateOp)
            .onComplete(function(){
                isComplete = true;
                console.log('just Completed toLoTween!');
            });
         tween.start();
    }

    function animate() {

        requestAnimationFrame( animate );

        //TWEEN.update(); ///

        render();
        

        camRotY=controls.getAzimuthalAngle();

        _.forEach(groups, function(i){

            var tagRot = _.values(i)[7].y;

            if (tagRot < camRotY+tolerance  && tagRot > camRotY-tolerance) {
                       
                _.values(i)[4][0].material.opacity = highOp.opacity;
                    
            } 
            if (tagRot >= camRotY+tolerance  || tagRot <= camRotY-tolerance) {
                    
                _.values(i)[4][0].material.opacity = lowOp.opacity;
                
            }

            /*
            if (isComplete) {
                console.log('isComplete is now ' + isComplete);

                if (tagRot < camRotY+tolerance  && tagRot > camRotY-tolerance) {
                       
                    isComplete = false;
                    toHiTween(i);
                    
                } 
                if (tagRot >= camRotY+tolerance  || tagRot <= camRotY-tolerance) {
                        
                    isComplete = false;
                    toLoTween(i);
                    
                }
            }
            */

        });
    
        _.forEach(colorGrids, function(i){
            var lineRot = _.values(i)[7].y;
            if (lineRot < camRotY+tolerance  && lineRot > camRotY-tolerance) {
                i.material.opacity=1;
            } 
            if (lineRot >= camRotY+tolerance  || lineRot <= camRotY-tolerance) {
                i.material.opacity=0.1;
            }

        });

        // animate grid transparency 

        
        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        controls.minPolarAngle = -Math.PI/2; // radians
        controls.maxPolarAngle = Math.PI/2; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        controls.minAzimuthAngle = - Infinity; // radians
        controls.maxAzimuthAngle = Infinity; // radians

        

    }


    function render() {

        //var time = Date.now() * 0.001;
        //groups[i].rotation.y = time * 0.1;
        
        renderer.render( scene, camera );


    }

})();
