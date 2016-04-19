import d3 from 'd3';
import d3Kit from 'd3Kit';
import Wtfvis from './wtfvis.js';

const chart = new Wtfvis('#vis');

d3.csv('data/wtfviz.csv', function(error, raw){
  const rows = raw.map(d => {
    d.notes = +d.notes;
    d.is3d = d.is3d==='TRUE';
    return d;
  });

  chart.data(rows);
});