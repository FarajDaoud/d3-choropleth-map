import './index.css';
import * as d3 from 'd3';
import * as d3Legend from 'd3-svg-legend';

//Add event listner On page load
document.addEventListener('DOMContentLoaded', function(){
    var req = new XMLHttpRequest();
    req.open("GET", "", true);
    req.send();
    req.onload = function(){
        let json = JSON.parse(req.responseText);
    };
});