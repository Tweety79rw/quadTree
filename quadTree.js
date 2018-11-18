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
  left() {
    return this.cx - this.w;
  }
  right() {
    return this.cx + this.w;
  }
  up() {
    return this.cy - this.h;
  }
  bottom() {
    return this.cy + this.h;
  }
  
  nwCenter() {
    return { cx: this.left() + this.w/2,
      cy: this.up() + this.h/2,
      w: this.w/2,
      h: this.h/2};
  }
  neCenter() {
    return { cx: this.right() - this.w/2,
      cy: this.up() + this.h/2,
      w: this.w/2,
      h: this.h/2};
  }
  swCenter() {
    return { cx: this.left() + this.w/2,
      cy: this.bottom() - this.h/2,
      w: this.w/2,
      h: this.h/2};
  }
  seCenter() {
    return { cx: this.right() - this.w/2,
      cy: this.bottom() - this.h/2,
      w: this.w/2,
      h: this.h/2};
  }    
  contains(point, y) {
    if(point instanceof Point) {
      return (this.left() <= point.x 
        && this.right() > point.x 
        && this.up() <= point.y
        && this.bottom() > point.y);
    } else {
      return (this.left() <= point
        && this.right() > point
        && this.up() <= y
        && this.bottom() > y);
    }
  }
  /*intersects(range) {
    return (this.contains(range.left(),range.up()) ||
      this.contains(range.right(), range.up()) ||
      this.contains(range.left(), range.bottom()) ||
      this.contains(range.right(), range.bottom()) ||
      range.contains(this.left(),this.up()) ||
      range.contains(this.right(), this.up()) ||
      range.contains(this.left(), this.bottom()) ||
      range.contains(this.right(), this.bottom()));
  }*/
  intersects(range) {
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
  }
  subdivide() {
    let nw = this.region.nwCenter();
    let ne = this.region.neCenter();
    let sw = this.region.swCenter();
    let se = this.region.seCenter();
    this.northWest = new QuadTree(new Region(nw.cx, nw.cy, nw.w, nw.h), this.capacity);
    this.northEast = new QuadTree(new Region(ne.cx, ne.cy, ne.w, ne.h), this.capacity);
    this.southWest = new QuadTree(new Region(sw.cx, sw.cy, sw.w, sw.h), this.capacity);
    this.southEast = new QuadTree(new Region(se.cx, se.cy, se.w, se.h), this.capacity);
    this.subdivided = true;
  }
  size() {
    let sum = this.points.length;
    if(this.subdivided) {
      sum += this.northWest.size();
      sum += this.northEast.size();
      sum += this.southWest.size();
      sum += this.southEast.size();
    }
    return sum;
  }
  insert(point) {
    if(!this.region.contains(point)) {
      return;
    }
    if(this.points.length < this.capacity) {
      this.points.push(point);
    } else {
      if(!this.subdivided) {
        this.subdivide();
      }
      this.northWest.insert(point);
      this.northEast.insert(point);
      this.southWest.insert(point);
      this.southEast.insert(point);
    }
  }
  query(range, results) {
    if(!results) {
      results = [];
    }
    if(this.region.intersects(range)){
      for(let p of this.points) {
        if(range.contains(p)) {
          results.push(p);
        }
      }
    }
    if(this.subdivided) {
      this.northWest.query(range, results);
      this.northEast.query(range, results);
      this.southWest.query(range, results);
      this.southEast.query(range, results);
    }
    return results;
  }
  show() {
    rectMode(CENTER);
    noFill();
    stroke(0,255,0);
    strokeWeight(2);
    rect(this.region.cx, this.region.cy, this.region.w*2, this.region.h*2);
    if(this.subdivided) {
      this.northWest.show();
      this.northEast.show();
      this.southWest.show();
      this.southEast.show();
    }
  }
}