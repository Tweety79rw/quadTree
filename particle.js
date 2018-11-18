class Particle {
  constructor(cx,cy, r) {
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.highlight = false;
  }
  update() {
    this.cx += random(-1,1);
    this.cy += random(-1,1);
  }
  setHighlight(val) {
    this.highlight = val;
  }
  render() {
    if(this.highlight) {   
      fill(255);
    } else {
      fill(100);
    }
    ellipse(this.cx, this.cy, this.r*2, this.r*2);
  }
}