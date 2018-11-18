let particals = [];
//let qTree;
function setup() {
  createCanvas(800,600);
  //qTree = new QuadTree(new Region(320,240,640,480), 4);
  for(let i = 0; i < 1000; i++) {
    let p = new Particle(random(width), random(height), 4);

    particals.push(p);
    //qTree.insert(pt);
  }
}

function draw() {
  background(0);
  noStroke();
  let qTree = new QuadTree(new Region(width/2,height/2,width/2,height/2), 4);
  /*for(let p of points) {
    qTree.insert(p);
    let pts = qTree.query(new Region(p.userData.cx, p.userData.cy, p.userData.r*4, p.userData.r*4));
  for(let pt of pts) {
      if(pt == p)
        continue;
      let d = dist(p.userData.cx, p.userData.cy, pt.userData.cx, pt.userData.cy);
      if(d < (pt.userData.r + p.userData.r)) {
        pt.userData.setHighlight(true);
        p.userData.setHighlight(true);
      }
    }
  }*/
  for(let p of particals) {
    p.update();
    p.render();
  }
  for(let p of particals) {
    p.setHighlight(false);
    qTree.insert(new Point(p.cx, p.cy, p));
    let pts = qTree.query(new Region(p.cx, p.cy, p.r*2, p.r*2));
    for(let j = 0; j < pts.length; j++) {
      if(pts[j].userData == p)
        continue;
      let d = dist(p.cx, p.cy, pts[j].userData.cx, pts[j].userData.cy);
      if(d < (pts[j].userData.r + p.r)) {
        pts[j].userData.setHighlight(true);
        p.setHighlight(true);
      }
    }
    /*for(let pt of particals) {
      if(pt == p)
        continue;
      let d = dist(p.cx, p.cy, pt.cx, pt.cy);
      if(d < (pt.r + p.r)) {
        p.setHighlight(true);
      }
    }*/
  }
  //stroke(255,0,0);
  //noFill();
  //rectMode(CENTER);
  //rect(mouseX, mouseY, 50,50);
  //console.log(qTree.size());
  //noLoop();
  qTree.show();
}
