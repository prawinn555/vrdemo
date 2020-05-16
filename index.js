var modelset = {};
modelset['Dinosaur'] = window.location.href + 'dinosaur.glb';
modelset['Shark'] = window.location.href + 'shark/scene.gltf';


const dimensions = ['x', 'y', 'z'];

function setModel(model) {
	console.log('set model', model);
	if (!model) return;
	const url = `${modelset[model]}`;
	console.log('url', url);
	mymodel.setAttribute('gltf-model', url);
}

function setBG(bg) {
	console.log('bg', bg);
	if (!bg) return;

	let env = `<a-entity class="bgElem" 
					environment="preset: ${bg}; lighting: none; shadow: none; lightPosition: 0 2.15 0"
                hide-in-ar-mode></a-entity>
				`;

	console.log(`new : ${env}`);
	let entityEl = document.querySelector('.bgElem');
	let parent = entityEl.parentNode;
	// entityEl.setAttribute('environment', `preset: ${bg}; lighting: none; shadow: none; lightPosition: 0 2.15 0`);
	parent.removeChild(entityEl);
	parent.appendChild(createElementFromHTML(env));

}

function showPositionStatus() {
	pos = modelcontainer.getAttribute('position');
	positionStatus.innerHTML = `x ${round(pos.x)} y ${round(pos.y)} z ${round(pos.z)}`;
}
function showRotationStatus() {
	rotation = modelcontainer.getAttribute('rotation');
	rotationStatus.innerHTML = `y ${round(rotation.y)}`;
}

function round(v) {
	return Math.round(v*100)/100;
}
var animations = {};
function showAnimationStatus() {
	animationStatus.innerHTML = `${JSON.stringify(animations)}`;
}


function later(delay, value) {
    return new Promise(resolve => setTimeout(resolve, delay, value));
}


function toggleMove(delta) {
	
    const d = dimensions.find( el => delta[el]);
	const k = `move-${d}`;
	
			var x = document.activeElement.tagName;
		document.activeElement.blur();
	    console.log('blur ', x);

	let stop = movingDirections[k]===delta[d];
	if(stop) {
		stopMoving(k);
	} else {
		changeMovingDirections(k, delta[d], cycleDelay);
	}
	updateBtnActive(stop, k, delta[d]);
}



function updateBtnActive(stop, k, sign) {
	const name = sign>0? 'up' : 'down';
	const list = document.querySelectorAll(`button.${k}`);
	console.log(`updateBtnActive stop=${stop} ${name}`, list);
	list.forEach(el =>{
		if(stop) { 
			el.classList.remove('active');
		} else if(el.classList.contains(name)){
			el.classList.add('active');
		} else {
			el.classList.remove('active');
		}
	});
}


function toggleRotate(delta) {
    const d = 'y';
	const k = 'rotation';
	let stop = movingDirections[k]===delta[d];
	if(stop) {
		stopMoving(k);
	} else {
		changeMovingDirections(k, delta[d], cycleDelay);
	}
	updateBtnActive(stop, k, delta.y);
	

}


var repeating = false;

/*
example
{ move-x : 1,
  move-y : 1,
  rotation : -1
}
 */
var movingDirections = {};

async function changeMovingDirections(directionKey, name, delay) {



	movingDirections[directionKey] = name;
	//console.log(`changeMovingDirections ${directionKey} ${name} delay ${delay}ms`);
			
	if(repeating) {
		// prevent mutiple call
		return;
	}
	repeating = true;
	while(Object.keys(movingDirections).length>0) {
		updateAnimation();
		await later(delay);
	}
	repeating = false;
}

const limitMinY = -0.6;
const limitMaxY = 2.5;
const cycleDelay = 1000;
// moving scale per cycle.
const movingScale = 0.3;

function showMessage(m) {
	console.log(m);
	document.querySelector("#message").setAttribute('value', m);
}
function updateAnimation () {
			showPositionStatus();
			showRotationStatus();
			if(Object.keys(movingDirections).find(k => k.includes('move'))) {
				let a = {};
				a.property = 'position';
				a.to = {...pos};
				a.dur = cycleDelay;
				a.easing = 'linear';
				dimensions.forEach( d => {
				   let delta = movingDirections[`move-${d}`];
				   if(delta) {
					  a.to[d] = round(pos[d] + delta*movingScale);
				   }
	            });
				if(a.to.y<limitMinY) { 
					a.to.y = limitMinY; 
					showMessage('Don\'t burry me please !');
				}
				if(a.to.y>limitMaxY) { 
					a.to.y = limitMaxY; 
					showMessage('I am afraid of height !');
				}
				animations.move = a;
				modelcontainer.setAttribute('animation', a);
			} else {
				delete animations.move;
			}
			if(movingDirections.rotation) {
				let a = {};
				a.property = 'rotation';
				a.dur = cycleDelay;
				a.easing = 'linear';
				a.to = {x:0, y: rotation.y + movingDirections.rotation*8, z:0};
				animations.rotation = a;
				modelcontainer.setAttribute('animation__rotate', a);
			} else {
				delete animations.rotation;
			}			
			showAnimationStatus();
			//console.log('animation', modelcontainer.getAttribute('animation'));
}




function stopMoving(directionKey) {
	delete movingDirections[directionKey];
	// console.log('stopMoving');
}

var mymodel;
var positionStatus;
var pos;
var rotation;
var modelcontainer;

const envList = `contact, egypt, checkerboard, forest, goaland, yavapai, goldmine, threetowers, poison, arches, tron, japan, dream, volcano, starry, osiris`
		.split(',').map(s => s.trim());
const bgIndex = Math.round(Math.random()*100) % envList.length;
console.log('bgIndex', bgIndex);
const initBG = envList[bgIndex ];

document.addEventListener("DOMContentLoaded", function(event) {
	console.log('loaded');
	positionStatus = document.querySelector('.positionStatus');
	rotationStatus = document.querySelector('.rotationStatus');
	animationStatus = document.querySelector('.animationStatus');
    mymodel = document.querySelector('#mymodel');
	modelcontainer = document.querySelector('#modelcontainer');
	
	let selectElement = document.querySelector('.selectModel');

	selectElement.addEventListener('change', (event) => {
		setModel(event.target.value);
	});

	selectElement = document.querySelector('.selectBG');

	selectElement.addEventListener('change', (event) => {
		setBG(event.target.value);
	});

	envList.forEach(env => {
		selectElement.appendChild(createElementFromHTML(
			`<option ${env===initBG?'selected':''}>${env}</option>`));
	});
    setBG(initBG);
	showPositionStatus();
	showRotationStatus();
	setModel('Dinosaur');
});

function createElementFromHTML(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();

	// Change this to div.childNodes to support multiple top-level nodes
	return div.firstChild;
}

function toggleDisplay(array) {
	array.forEach(id => {
		let el = document.querySelector(id);
		let c = 'hidden';
		if(el.classList.contains(c)) {
			el.classList.remove(c)
		} else {
			el.classList.add(c);
		}
	});

}
