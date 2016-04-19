import d3 from 'd3';
import d3Kit from 'd3kit';
import Physics from './physics.js';
import Path from 'paths-js/dist/node/path';
import _ from 'lodash';

const DEFAULT_OPTIONS = {
  margin: {top: 20, right: 280, bottom: 90, left: 80},
  initialWidth: 1100,
  initialHeight: 610
};

const CUSTOM_EVENTS = [
  'customEvent'
];

export default d3Kit.factory.createChart(DEFAULT_OPTIONS, CUSTOM_EVENTS,
function constructor(skeleton){
  // alias
  const options = skeleton.options();
  const dispatch = skeleton.getDispatcher();
  const layers = skeleton.getLayerOrganizer();

  layers.create(['axis', 'count', 'dino', 'piece', {legend: ['color', 'type', 'size', 'title']}]);

  dispatch.on('resize',  visualize);
  dispatch.on('options', visualize);
  dispatch.on('data', visualize);

  const xScale = d3.scale.ordinal()
    .domain(['right', 'left', 'center']);
  const yScale = d3.scale.ordinal()
    .domain([true, false]);
  const rScale = d3.scale.linear()
    .range([20, 5]);
  const colorScale = d3.scale.ordinal()
    .range(['#16a085', '#2ecc71', '#2980b9', '#8e44ad', '#f39c12', '#d35400', '#c0392b', '#34495e']);
    // .category10();

  function color(x){
    if(x==='neutral') return '#7f8c8d';
    return x==='mixed' ? colorScale(Math.round(Math.random()*Math.random()*colorScale.range().length)) : colorScale(x);
  }

  const xAxis = d3.svg.axis()
    .scale(xAxis)
    .orient('bottom');

  function visualize(){
    if(!skeleton.hasData()) return;

    const data = skeleton.data();
    const extent = d3.extent(data, d => d.notes);
    rScale.domain(extent);
    xScale.rangeRoundPoints([0, skeleton.getInnerWidth()], 0.6);
    yScale.rangeRoundPoints([0, skeleton.getInnerHeight()], 0.6);

    const groups = _(data)
      .groupBy(d => d.is3d+'/'+d.position)
      .mapValues(values => {
        return {
          position: values[0].position,
          is3d: values[0].is3d,
          count: values.length
        };
      })
      .values()
      .value();

    const colors = _.uniq(data.map(d => d.color))
      .sort((a,b) => a.localeCompare(b));

    const types = _.uniq(data.map(d => d.type))
      .sort((a,b) => a.localeCompare(b))
      .map(d => {
        return {
          size: 10,
          data: {
            type: d,
            color: 'neutral'
          }
        }
      });

    layers.get('legend')
      .attr('transform', d => `translate(${skeleton.getInnerWidth() + 120},${25})`);

    layers.get('legend.title')
      .attr('transform', d => `translate(${16},${0})`);

    layers.get('legend.title')
      .append('text')
        .text('Color');

    layers.get('legend.title')
      .append('text')
        .attr('y', 235)
        .text('Type');

    layers.get('legend.title')
      .append('text')
        .attr('y', 410)
        .text('Popularity (notes)');

    drawLegendColors(colors);
    drawLegendTypes(types);
    drawGroups(groups);
    drawSize(extent);

    layers.get('axis').selectAll('text.x-axis')
        .data(['right', 'left', 'center'])
      .enter().append('text')
        .classed('x-axis', true)
        .attr('x', d => xScale(d))
        .attr('y', skeleton.getInnerHeight() + 30)
        .text(d => d)

    layers.get('axis').selectAll('text.y-axis')
        .data([true, false])
      .enter().append('text')
        .classed('y-axis', true)
        .attr('x', - 30)
        .attr('y', d => yScale(d))
        .text(d => !d)

    layers.get('axis').append('text')
      .classed('axis-title', true)
      .attr('x', -30)
      .attr('y', skeleton.getInnerHeight()/2)
      .text('No 3D')

    layers.get('axis').append('text')
      .classed('axis-title', true)
      .attr('x', skeleton.getInnerWidth()/2)
      .attr('y', skeleton.getInnerHeight()+ 70)
      .text('position of the visualization on the page')

    layers.get('dino')
      .append('image')
        .attr('x', 50)
        .attr('y', 140)
        .attr('width', 250)
        .attr('height', 183)
        .style('opacity', 0.3)
        .attr('xlink:href', `images/dino.png`);


    const bodies = data.map(d => {
      const x = xScale(d.position);
      const y = yScale(d.is3d);
      return {
        clusterX: x,
        clusterY: y,
        cx: Math.random() * skeleton.getInnerWidth(),
        cy: Math.random() * skeleton.getInnerHeight(),
        size: rScale(d.notes),
        data: d
      };
    });

    const force = Physics.avoidCollision2D(bodies, {
      width: skeleton.getInnerWidth(),
      height: skeleton.getInnerHeight(),
      padding: 0
    });

    const selection = layers.get('piece').selectAll('g.piece')
      .data(bodies, (d,i) => i);

    const sEnter = selection.enter().append('g')
      .classed('piece', true)
      .attr('transform', d => `translate(${d.cx},${d.cy})`);

    drawShapes(sEnter);

    force.on('tick.draw', function(){
      layers.get('piece').selectAll('g.piece')
        .attr('transform', d => `translate(${d.cx},${d.cy})`)
    });

  }

  function drawShapes(sEnter){
    sEnter.filter(d => d.data.type==='bar')
      .append('circle')
        .attr('r', d => d.size/2)
        .style('fill', d => color(d.data.color))

    sEnter.filter(d => d.data.type==='pie')
      .append('rect')
        .attr('x', d => -d.size/4)
        .attr('y', d => -d.size/2)
        .attr('width', d => d.size/2)
        .attr('height', d => d.size)
        .style('fill', d => color(d.data.color))

    sEnter.filter(d => d.data.type==='donut')
      .append('line')
        .attr('x1', d => -d.size/2)
        .attr('y1', d => -d.size/2)
        .attr('x2', d => d.size/2)
        .attr('y2', d => d.size/2)
        .style('stroke', d => color(d.data.color))
        .style('stroke-width', 2)

    sEnter.filter(d => d.data.type==='line')
      .append('path')
        .attr('d', d => {
          return Path()
            .moveto(-d.size/2, -d.size/2)
            .lineto(d.size/2, -d.size/2)
            .lineto(2, d.size/2)
            .lineto(-2, d.size/2)
            .closepath()
            .print();
        })
        .style('fill', d => color(d.data.color))

    sEnter.filter(d => d.data.type==='map')
      .append('circle')
        .attr('r', d => d.size/2)
        .style('fill', d => color(d.data.color))

    sEnter.filter(d => d.data.type==='map')
      .append('circle')
        .attr('r', d => d.size/4)
        .style('fill', '#fff')

    sEnter.filter(d => d.data.type==='graph')
      .append('text')
        .attr('dy', 3)
        .style('text-anchor', 'middle')
        .text('A')

    sEnter.filter(d => d.data.type==='funnel')
      .append('path')
        .attr('d', d => {
          return Path()
            .moveto(-d.size/2, -d.size/2)
            .lineto(-d.size/2, -d.size/3)
            .lineto(0, 0)
            .lineto(1,3)
            .lineto(d.size/2, d.size/2)
            .lineto(d.size/2, d.size/4)
            .lineto(d.size/4, d.size/3)
            .lineto(d.size/5, -d.size/4)
            .lineto(d.size/3, -d.size/2)
            .lineto(0, -d.size/3)
            .closepath()
            .print();
        })
        .style('fill', d => color(d.data.color))
  }

  function drawLegendColors(colors){
    layers.get('legend.color')
      .attr('transform', d => `translate(${0},${10})`);

    const sEnter = layers.get('legend.color').selectAll('g.legend')
        .data(colors)
      .enter().append('g')
        .classed('legend', true)
        .classed('legend-color', true)
        .attr('transform', (d,i) => `translate(${0},${i*16})`)

    sEnter.append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', d => color(d))

    sEnter.append('text')
      .attr('x', 16)
      .attr('dy', '0.8em')
      .text(d => d)
  }

  function drawLegendTypes(types){
    layers.get('legend.type')
      .attr('transform', d => `translate(${0},${250})`);

    const sEnter = layers.get('legend.type').selectAll('g.legend')
        .data(types)
      .enter().append('g')
        .classed('legend', true)
        .classed('legend-type', true)
        .attr('transform', (d,i) => `translate(${0},${i*20})`)

    sEnter.append('text')
      .attr('x', 16)
      .attr('dy', '0.4em')
      .text(d => d.data.type)

    drawShapes(sEnter);
  }

  function drawGroups(groups){
    const sEnter = layers.get('count').selectAll('g')
        .data(groups)
      .enter().append('g')
        .attr('transform', d => `translate(${xScale(d.position)},${yScale(d.is3d)})`);

    sEnter.append('g')
      .attr('transform', d => `rotate(${d.count})`)
    .append('text')
      .classed('count', true)
      .attr('dy', 35)
      .text(d => d.count)

    sEnter.append('circle')
      .attr('r', 70)
  }

  function drawSize(extent){
    layers.get('legend.size')
      .attr('transform', d => `translate(${0},${425})`);

    const sEnter = layers.get('legend.size').selectAll('g.legend')
        .data(d3.range(extent[0], extent[1], 13))
      .enter().append('g')
        .classed('legend', true)
        .classed('legend-type', true)
        .attr('transform', (d,i) => `translate(${0},${i*20})`)

    sEnter.append('text')
      .attr('x', 16)
      .attr('dy', '0.4em')
      .text(d => d)

    sEnter.append('circle')
      .attr('r', d => rScale(d)/2)
      .style('fill', d => color('neutral'))
  }

  return skeleton.mixin({
    visualize
  });
});