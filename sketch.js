let particles = [];
const canvasWidth = 800;
const canvasHeight = 600;
const quadTreeCap = 50;
const startingParticleCount = 3000;
const windowRegion = new Region(canvasWidth/2,canvasHeight/2,canvasWidth,canvasHeight);
let fps, particleCount, quadCap, particleCountSpan, quadCapSpan, doQuad = true, renderQTree = true;
/**
 * p5 setup function, this is called at the start of the p5 animation.
 */
function setup() {
  // create a canvas
  createCanvas(canvasWidth, canvasHeight);
  // create particles
  for(let i = 0; i < startingParticleCount; i++) {
    let p = new Particle(random(width), random(height), 4);
    particles.push(p);
  }
  // create dom elements
  fps = createSpan();
  fps.parent(createDiv('Frames Per Second '));
  particleCountSpan = createSpan();
  quadCapSpan = createSpan();
  particleCount = createSlider(2, 6000, startingParticleCount, 1);
  let particleDiv = createDiv('# of Particles ');
  particleCount.parent(particleDiv);
  particleCountSpan.parent(particleDiv)
  quadCap = createSlider(5, 1000, quadTreeCap, 1);
  let capDiv = createDiv('Particles Per QuadTree ');
  quadCap.parent(capDiv);
  quadCapSpan.parent(capDiv);
  let checkbox = createCheckbox('Use Quadtree', true);
  checkbox.changed(function() {
    doQuad = this.checked();
  });
  checkbox = createCheckbox('Show Quadtree', true);
  checkbox.changed(function() {
    renderQTree = this.checked();
  });
}
/**
 * This function checks if the two particles are intersecting and sets the
 * highlight flag if they are.
 * @param  {Particle} a particle with x and y
 * @param  {Particle, Point} b particle with x and y
 */
function checkDistAndSet(a, b) {
  if(b instanceof Point) {
    b = b.userData;
  }
  let d = distSq(a.cx, a.cy, b.cx, b.cy);
  if(d < (b.r * a.r * 4)) {
    b.setHighlight(true);
    a.setHighlight(true);
  }
}
/**
 * This function takes the global variables and creates a quad tree then adds
 * the particles. Then checks if there are any other particle that intersect in
 * it's region and highlights them if they do.
 */
function drawQuadTree() {
  let qTree = new QuadTree(windowRegion, quadCap.value());
  for(let p of particles) {
    p.setHighlight(false);
    qTree.insert(new Point(p.cx, p.cy, p));
    let pts = qTree.query(new Region(p.cx, p.cy, p.r*3, p.r*3));
    for(let j = 0; j < pts.length; j++) {
      if(pts[j].userData != p) {
        checkDistAndSet(p, pts[j]);
      }
    }
  }
  if(renderQTree)
    qTree.show();
}
/**
 * This function resets all the particles highlight to false. Then checks each
 * againts all the others to see if any intersect and sets the highlight if they
 *  do.
 */
function drawNSqrd() {
  particles.forEach(function(d) { d.setHighlight(false);});
  for(let p of particles) {
    for(let q of particles) {
      if(p != q) {
        checkDistAndSet(p, q);
      }
    }
  }
}
/**
 * p5 draw loop gets called by p5.js
 */
function draw() {
  background(0);
  if(doQuad)
    drawQuadTree();
  else
    drawNSqrd();
  for(let p of particles) {
    p.update();
    p.render();
  }
  let dif = particleCount.value() - particles.length;
  if(dif > 0) {
    for(let i = 0; i < dif; i++) {
      let p = new Particle(random(width), random(height), 4);
      particles.push(p);
    }
  } else if(dif < 0) {
    particles.splice(particles.length + dif, abs(dif));
  }
  fps.html(frameRate().toFixed(2));
  particleCountSpan.html(particleCount.value());
  quadCapSpan.html(quadCap.value());
}
/**
 * Simple function to get the square distance so we don't have to waste time
 * taking the root.
 * @param  {Number} x  the x value of a point
 * @param  {Number} y  the y value of a point
 * @param  {Number} oX the x value of the other point
 * @param  {Number} oY the y value of the other point
 * @return {Number}    the squared difference
 */
function distSq(x,y,oX,oY) {
  let dx = oX - x;
  let dy = oY - y;
  return dx * dx + dy * dy;
}
