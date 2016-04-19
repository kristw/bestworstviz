import d3 from 'd3';

const DEFAULT_OPTIONS = {
  width: 900,
  height: 550,
  padding: 2
}

function avoidCollision2D(bodies, options){
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  const force = d3.layout.force()
    .nodes(bodies)
    .size([options.width, options.height])
    .gravity(0)
    .charge(0)
    .on('tick.default', e => {
      bodies.forEach(gravity(0.35 * e.alpha));
      bodies.forEach(collide(0.5, bodies));
    })
    .start();

  // Move nodes toward cluster focus.
  function gravity(alpha) {
    return function(d) {
      d.cy += (d.clusterY - d.cy) * alpha;
      d.cx += (d.clusterX - d.cx) * alpha;
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha, elements) {
    var quadtree = d3.geom.quadtree()
      .x(function(d){return d.cx;})
      .y(function(d){return d.cy;})(elements);

    return function(d) {
      var r = d.size + options.padding,
          nx1 = d.cx - r,
          nx2 = d.cx + r,
          ny1 = d.cy - r,
          ny2 = d.cy + r;

      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.cx - quad.point.cx,
              y = d.cy - quad.point.cy,
              l = Math.sqrt(x * x + y * y),
              r = d.size + quad.point.size + options.padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.cx -= x *= l;
            d.cy -= y *= l;
            quad.point.cx += x;
            quad.point.cy += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  return force;
}

export default {
  avoidCollision2D
};