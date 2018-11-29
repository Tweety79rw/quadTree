class Point {
  constructor(x, y, userData) {
    this.x = x;
    this.y = y;
    this.userData = userData;
  }

}
class Region {
  constructor(cx, cy, w, h){
    this.cx = cx;
    this.cy = cy;
    this.w = w;
    this.h = h;
  }
  // half width
  hW() {
    return this.w/2;
  }
  // half height
  hH() {
    return this.h/2;
  }
  // quarter width
  qW() {
    return this.hW()/2;
  }
  // quarter height
  qH() {
    return this.hH()/2;
  }
  // get the sides of this region
  left() {
    return this.cx - this.hW();
  }
  right() {
    return this.cx + this.hW();
  }
  up() {
    return this.cy - this.hH();
  }
  bottom() {
    return this.cy + this.hH();
  }
  Center(sub) {
    let quad = sub.slice(0,1) + sub.slice(5,6).toLowerCase();
    return this[quad + 'Center']();
  }
  // get the internal region of the next subdivisions
  nwCenter() {
    return new Region(this.left() + this.qW(),
      this.up() + this.qH(),
      this.hW(),
      this.hH());
  }
  neCenter() {
    return new Region(this.right() - this.qW(),
      this.up() + this.qH(),
      this.hW(),
      this.hH());
  }
  swCenter() {
    return new Region(this.left() + this.qW(),
      this.bottom() - this.qH(),
      this.hW(),
      this.hH());
  }
  seCenter() {
    return new Region(this.right() - this.qW(),
      this.bottom() - this.qH(),
      this.hW(),
      this.hH());
  }
  // does a Point or x,y exist in this region
  contains(point, y) {
    // point can be a Point object that has x and y or it can be x
    if(point instanceof Point) {
      return this.contains(point.x, point.y);
    } else {
      return (this.left() <= point
        && this.right() > point
        && this.up() <= y
        && this.bottom() > y);
    }
  }
  intersects(range) {
    // if all of the sides of the range are not outside this region then it
    // must intersect
    return !(this.left() > range.right()
      || this.right() < range.left()
      || this.up() > range.bottom()
      || this.bottom() < range.up());
  }
}

class QuadTree {
  constructor(region, cap) {
    this.region = region;
    this.capacity = cap;
    this.points = [];
    this.subdivided = false;
    this.subdivisions = ["northWest", "northEast", "southWest", "southEast"];
  }
  subdivide() {
    this.mapSubdivsions((d, s) => {return new QuadTree(this.region.Center(s), this.capacity);});
    this.subdivided = true;
  }
  mapSubdivsions(fn) {
    for(let quadrent of this.subdivisions) {
      let quad = fn(this[quadrent], quadrent);
      if(quad)
        this[quadrent] = quad;
    }
  }
  // this gets the total number of points in the quad tree, recursive so each
  // QuadTree only needs to check itself and add it's children size
  size() {
    let sum = this.points.length;
    if(this.subdivided) {
      this.mapSubdivsions((d) => { sum += d.size();});
    }
    return sum;
  }
  // insert a point into the quad tree
  insert(point) {
    if(!this.region.contains(point)) {
      return; // region doesn't contain the point
    }
    if(this.points.length < this.capacity) {
      this.points.push(point); // we have room for new point
    } else {
      // no room at the inn time to check the subdivisions
      if(!this.subdivided) {
        this.subdivide(); // subdivide the current tree
      }
      // try to insert into the subdivisions if the region doesn't contain
      // the point it will return immediately
      this.mapSubdivsions((d) => {d.insert(point);});
    }
  }
  query(range, results) {
    // if no results is passed in we create one so it can be returned
    if(!results) {
      results = [];
    }
    if(this.region.intersects(range)){
      for(let p of this.points) {
        if(range.contains(p)) {
          results.push(p); // point is in the range, add it to results
        }
      }
    }
    if(this.subdivided) {
      // check the subdivisions if they have any points in the range
      this.mapSubdivsions((d) => { d.query(range, results);});
    }
    return results;
  }
  show() {
    rectMode(CENTER);
    noFill();
    stroke(0,255,0);
    strokeWeight(2);
    rect(this.region.cx, this.region.cy, this.region.w, this.region.h);
    if(this.subdivided) {
      this.mapSubdivsions((d) => {d.show();});
    }
  }
}
